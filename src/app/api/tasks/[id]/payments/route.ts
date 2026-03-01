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

// 🚀 Helper to find all admins and masters
async function getNotificationRecipients(currentUserId: string): Promise<string[]> {
  const recipientIds = new Set<string>();

  // 1. From Database
  try {
    const dbAdmins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MASTER", "admin", "master"] } },
      select: { clerkId: true }
    });
    dbAdmins.forEach(u => recipientIds.add(u.clerkId));
  } catch (e) {
    console.error("DB Recipient Discovery Error:", e);
  }

  // 2. From Clerk (Fallback)
  try {
    const client = await clerkClient();
    const clerkRes = await client.users.getUserList({ limit: 100 });
    clerkRes.data.forEach((u: any) => {
      const role = ((u.publicMetadata?.role as string) || (u.privateMetadata?.role as string) || "").toLowerCase();
      if (role === "admin" || role === "master") {
        recipientIds.add(u.id);
      }
    });
  } catch (e) {
    console.error("Clerk Recipient Discovery Error:", e);
  }

  // Ensure we send to everyone including the person who updated (as requested)
  return Array.from(recipientIds);
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await context.params;
  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Unknown User";
  const originalTaskId = await getEffectiveTaskId(taskId);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const newAmount = formData.get("amount") ? Number(formData.get("amount")) : undefined;
    const newReceived = formData.get("received") ? Number(formData.get("received")) : undefined;

    const existingTask = await prisma.task.findUnique({
      where: { id: originalTaskId },
      select: { title: true, amount: true, received: true, paymentProofs: true, paymentHistory: true, assignerName: true, customFields: true },
    });

    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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
    if (newAmount !== undefined && (existingTask.amount === null || existingTask.amount === 0)) {
      updatedAmountToSave = newAmount;
    }

    let updatedReceivedToSave = (existingTask.received ?? 0) + (newReceived ?? 0);

    const updateData: Prisma.TaskUpdateInput = {
      amount: updatedAmountToSave,
      received: updatedReceivedToSave,
      updatedAt: new Date()
    };

    if (uploadedFileUrl) {
      const currentProofs = Array.isArray(existingTask.paymentProofs) ? (existingTask.paymentProofs as string[]) : [];
      updateData.paymentProofs = [...currentProofs, uploadedFileUrl];
    }

    const paymentEntry = {
      amount: updatedAmountToSave ?? 0,
      received: updatedReceivedToSave,
      fileUrl: uploadedFileUrl || null,
      updatedAt: new Date(),
      updatedBy: userName,
      assignerName: existingTask.assignerName || "Unknown",
    };

    const existingHistory = Array.isArray(existingTask.paymentHistory) ? (existingTask.paymentHistory as any[]) : [];
    updateData.paymentHistory = [...existingHistory, paymentEntry] as any;

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: updateData,
    });

    await logActivity({
      taskId: originalTaskId,
      type: "PAYMENT_ADDED",
      content: `₹${newReceived || 0} payment recorded. Total: ₹${updatedReceivedToSave}`,
      author: userName,
      authorId: userId
    });

    // 🚀 Send Notifications with Title
    const recipients = await getNotificationRecipients(userId);
    const cf = (updatedTask.customFields as any) || {};
    const taskDetails = `[${cf.shopName || "N/A"}] - ${updatedTask.title}`;
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    for (const recipientId of recipients) {
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "PAYMENT_ADDED",
            title: "💰 New Payment Added",
            content: `Payment of ₹${newReceived || 0} recorded for ${taskDetails}. Updated By: ${userName} at ${timestamp}`,
            taskId: originalTaskId
          } as any
        });
      } catch (err) {
        console.error(`Notification failed for ${recipientId}:`, err);
      }
    }

    return NextResponse.json({ success: true, task: updatedTask, fileUrl: uploadedFileUrl });
  } catch (err: any) {
    console.error("POST Error:", err);
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
    const existingTask = await prisma.task.findUnique({
      where: { id: originalTaskId },
      select: { title: true, amount: true, received: true, paymentHistory: true, assignerName: true, customFields: true },
    });

    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updatedAmountToSave = (existingTask.amount === null || existingTask.amount === 0) ? (amount ?? existingTask.amount) : existingTask.amount;
    const updatedReceivedToSave = received ?? existingTask.received;

    const paymentEntry = {
      amount: updatedAmountToSave ?? 0,
      received: updatedReceivedToSave,
      fileUrl: null,
      updatedAt: new Date(),
      updatedBy: userName,
    };

    const existingHistory = Array.isArray(existingTask.paymentHistory) ? (existingTask.paymentHistory as any[]) : [];

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: {
        amount: updatedAmountToSave,
        received: updatedReceivedToSave,
        paymentHistory: [...existingHistory, paymentEntry] as any,
        updatedAt: new Date(),
      },
    });

    // 🚀 Send Overridden Notifications
    const recipients = await getNotificationRecipients(userId);
    const cf = (updatedTask.customFields as any) || {};
    const taskDetails = `[${cf.shopName || "N/A"}] - ${updatedTask.title}`;

    for (const rid of recipients) {
      try {
        await prisma.notification.create({
          data: {
            userId: rid,
            type: "PAYMENT_ADDED",
            title: "⚠️ Payment Overridden",
            content: `Payment details updated for ${taskDetails}. New Total: ₹${updatedReceivedToSave}. By: ${userName}`,
            taskId: originalTaskId
          } as any
        });
      } catch (e) { }
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    return NextResponse.json({ error: "Update failed", details: err.message }, { status: 500 });
  }
}
