import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import cloudinary from "cloudinary";
import { Readable } from "stream";
import { Prisma } from "@prisma/client";
import { logActivity } from "@/lib/activity";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface PaymentHistoryEntry {
  amount: number;
  received: number;
  fileUrl: string | null;
  updatedAt: Date;
  updatedBy: string;
  assignerName?: string;
}

// Get parent task ID if exists
async function getEffectiveTaskId(taskId: string): Promise<string> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { parentTaskId: true },
  });
  return task?.parentTaskId || taskId;
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await context.params;
  if (!taskId) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Unknown User";
  const originalTaskId = await getEffectiveTaskId(taskId);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const readNumberFromForm = (v: FormDataEntryValue | null | undefined) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      if (s === "") return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    };

    const newAmount = readNumberFromForm(formData.get("amount"));
    const newReceived = readNumberFromForm(formData.get("received"));

    const existingTask = await prisma.task.findUnique({
      where: { id: originalTaskId },
      select: { amount: true, received: true, paymentProofs: true, paymentHistory: true, assignerName: true },
    });

    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Upload proof file
    let uploadedFileUrl: string | undefined;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "auto", folder: "payment_proofs" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result!);
          }
        );
        Readable.from(buffer).pipe(uploadStream);
      });

      uploadedFileUrl = uploadRes.secure_url;
    }

    let updatedAmountToSave = existingTask.amount;
    let currentTotalReceived = existingTask.received ?? 0;

    // 🔒 Rule 1: Amount is locked after first set
    if (newAmount !== undefined && (existingTask.amount === null || existingTask.amount === 0)) {
      updatedAmountToSave = newAmount;
    }

    // 💰 Rule 2: Received is cumulative (add to existing)
    let updatedReceivedToSave = currentTotalReceived;
    if (newReceived !== undefined) {
      if (!updatedAmountToSave || updatedAmountToSave === 0) {
        return NextResponse.json({ error: "Set total amount before recording payment." }, { status: 400 });
      }
      updatedReceivedToSave += newReceived;

      // Prevent overpayment (with minor float tolerance)
      if (updatedReceivedToSave > (updatedAmountToSave + 0.01)) {
        return NextResponse.json({
          error: `Total received ($${updatedReceivedToSave}) cannot exceed total amount ($${updatedAmountToSave}).`
        }, { status: 400 });
      }
    }

    const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
    if (updatedAmountToSave !== existingTask.amount) updateData.amount = updatedAmountToSave;
    if (updatedReceivedToSave !== existingTask.received) updateData.received = updatedReceivedToSave;

    if (uploadedFileUrl) {
      const currentProofs = Array.isArray(existingTask.paymentProofs) ? (existingTask.paymentProofs as string[]) : [];
      updateData.paymentProofs = [...currentProofs, uploadedFileUrl];
    }

    const paymentEntry: PaymentHistoryEntry = {
      amount: updatedAmountToSave ?? 0,
      received: updatedReceivedToSave,
      fileUrl: uploadedFileUrl || null,
      updatedAt: new Date(),
      updatedBy: userName,
      assignerName: existingTask.assignerName || "Unknown",
    };

    const existingHistory = Array.isArray(existingTask.paymentHistory) ? (existingTask.paymentHistory as PaymentHistoryEntry[]) : [];
    updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: updateData,
    });

    await logActivity({
      taskId: originalTaskId,
      type: "PAYMENT_ADDED",
      content: `₹${newReceived || 0} payment recorded. Total received: ₹${updatedReceivedToSave}`,
      author: userName,
      authorId: userId
    });

    // 🚀 NEW: Notify ONLY Admin and Master
    const client = await clerkClient();
    const clerkUsersResponse = await client.users.getUserList({ limit: 500 });
    const adminMasterIds = clerkUsersResponse.data
      .filter(u => {
        const role = (u.publicMetadata?.role as string)?.toLowerCase();
        return role === 'admin' || role === 'master';
      })
      .map(u => u.id)
      .filter(id => id !== userId);

    const cf = (updatedTask.customFields as any) || {};
    const details = `[${cf.shopName || "N/A"}] - ${cf.phone || "N/A"}`;

    await Promise.all(adminMasterIds.map(recipientId =>
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: "PAYMENT_ADDED",
          content: `Payment Alert: ₹${newReceived || 0} recorded for ${details}. User: ${userName}`,
          taskId: originalTaskId
        }
      }).catch(err => console.error("Payment alert error:", err))
    ));

    return NextResponse.json({ success: true, task: updatedTask, fileUrl: uploadedFileUrl });
  } catch (err: any) {
    console.error("Payment Processing Error:", err);
    return NextResponse.json({ error: "Failed to process payment", details: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await context.params;
  const originalTaskId = await getEffectiveTaskId(taskId);
  const userName = (sessionClaims?.firstName as string) || (sessionClaims?.email as string) || "Unknown User";

  try {
    const { amount, received } = await req.json();
    const newAmount = typeof amount === "number" ? amount : undefined;
    const newReceived = typeof received === "number" ? received : undefined;

    const existingTask = await prisma.task.findUnique({
      where: { id: originalTaskId },
      select: { amount: true, received: true, paymentHistory: true, assignerName: true },
    });

    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Patch usually implies setting the absolute value, but we still apply the lock rule
    let updatedAmountToSave = existingTask.amount;
    if (newAmount !== undefined && (existingTask.amount === null || existingTask.amount === 0)) {
      updatedAmountToSave = newAmount;
    }

    let updatedReceivedToSave = existingTask.received ?? 0;
    if (newReceived !== undefined) {
      // For PATCH, we might want to allow correcting the total, but let's stick to user's cumulative request if possible.
      // Actually, standard PATCH usually sets the value. Let's make PATCH an "override" for corrections, 
      // but POST is for the "add payment" flow.
      updatedReceivedToSave = newReceived;
    }

    const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
    if (updatedAmountToSave !== existingTask.amount) updateData.amount = updatedAmountToSave;
    if (updatedReceivedToSave !== existingTask.received) updateData.received = updatedReceivedToSave;

    const paymentEntry: PaymentHistoryEntry = {
      amount: updatedAmountToSave ?? 0,
      received: updatedReceivedToSave,
      fileUrl: null,
      updatedAt: new Date(),
      updatedBy: userName,
      assignerName: existingTask.assignerName || "Unknown",
    };

    const existingHistory = Array.isArray(existingTask.paymentHistory) ? (existingTask.paymentHistory as PaymentHistoryEntry[]) : [];
    updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: updateData,
    });

    // 🚀 NEW: Notify ONLY Admin and Master
    const client = await clerkClient();
    const clerkUsersResponse = await client.users.getUserList({ limit: 500 });
    const adminMasterIds = clerkUsersResponse.data
      .filter(u => {
        const role = (u.publicMetadata?.role as string)?.toLowerCase();
        return role === 'admin' || role === 'master';
      })
      .map(u => u.id)
      .filter(id => id !== userId);

    const cf = (updatedTask.customFields as any) || {};
    const details = `[${cf.shopName || "N/A"}] - ${cf.phone || "N/A"}`;

    await Promise.all(adminMasterIds.map(recipientId =>
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: "PAYMENT_ADDED",
          content: `Payment Override: Total ₹${updatedReceivedToSave} for ${details}. User: ${userName}`,
          taskId: originalTaskId
        }
      }).catch(err => console.error("Payment alert error:", err))
    ));

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    return NextResponse.json({ error: "Update failed", details: err.message }, { status: 500 });
  }
}
