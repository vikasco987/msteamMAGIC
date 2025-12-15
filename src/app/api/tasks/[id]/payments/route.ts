// // FILE: src/app/api/tasks/[id]/payments/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../../lib/prisma";
// import { getAuth } from "@clerk/nextjs/server";
// import cloudinary from "cloudinary";
// import { Readable } from "stream";
// import { Prisma } from "@prisma/client"; // Import Prisma for JsonValue

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // Define a type for the payment history entry
// interface PaymentHistoryEntry {
//   amount: number;
//   received: number;
//   fileUrl: string | null;
//   updatedAt: Date;
//   updatedBy: string;
// }

// // Define the structure of the Task object as returned by Prisma,
// // focusing on the fields accessed in this route.
// // Adjust this to match your actual Prisma Task model if needed.
// interface TaskWithPaymentInfo {
//   id: string; // Assuming id exists
//   amount: number | null;
//   received: number | null;
//   paymentProofs: Prisma.JsonValue; // Assuming paymentProofs is Json or Json[]
//   paymentHistory: Prisma.JsonValue; // Assuming paymentHistory is Json or Json[]
//   // Add other fields that might be present on your Task model if they are relevant
//   // e.g., title: string;
// }

// function getUserDetails(req: NextRequest) {
//   const { userId, sessionClaims } = getAuth(req);
//   if (!userId) return { error: "Unauthorized" };
//   const userEmail = (sessionClaims?.email as string) || "Unknown User";
//   const userName = (sessionClaims?.firstName as string) || "Unknown User";
//   return { userId, userEmail, userName };
// }

// export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
//   const auth = getUserDetails(req);
//   if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
//   const { userEmail, userName } = auth;

//   const taskId = params.id;

//   try {
//     const formData = await req.formData();
//     const amountStr = formData.get("amount") as string;
//     const receivedStr = formData.get("received") as string;
//     const file = formData.get("file") as File;

//     const newAmount = amountStr ? parseFloat(amountStr) : undefined;
//     const newReceived = receivedStr ? parseFloat(receivedStr) : undefined;

//     // Type the result of findUnique
//     const existingTask: TaskWithPaymentInfo | null = await prisma.task.findUnique({
//       where: { id: taskId },
//       select: { amount: true, received: true, paymentProofs: true, paymentHistory: true },
//     });

//     if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

//     let uploadedFileUrl: string | undefined;

//     if (file && file.size > 0) {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);

//       const uploadRes = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
//         const uploadStream = cloudinary.v2.uploader.upload_stream(
//           { resource_type: "auto", folder: "payment_proofs" },
//           (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//           }
//         );
//         Readable.from(buffer).pipe(uploadStream);
//       });

//       uploadedFileUrl = uploadRes.secure_url;
//     }

//     const currentAmount = existingTask.amount || 0;
//     const currentReceived = existingTask.received || 0;

//     // The line corresponding to the fix request for 'updatedAmountToSave' in POST
//     // This was already 'const', but keeping it for context if the line number was misaligned
//     const updatedAmountToSave = !isNaN(newAmount!) ? newAmount! : currentAmount;
//     let updatedReceivedToSave = !isNaN(newReceived!) ? newReceived! : currentReceived; // This can remain 'let' if it's conditionally modified below
//     if (updatedReceivedToSave > updatedAmountToSave) updatedReceivedToSave = updatedAmountToSave;

//     // FIX (Line 72 equivalent, from previous fix): Replaced 'any' with 'Prisma.TaskUpdateInput'
//     const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
//     if (!isNaN(newAmount!)) updateData.amount = newAmount;
//     if (!isNaN(newReceived!)) updateData.received = newReceived;

//     if (uploadedFileUrl) {
//       // Ensure paymentProofs is an array before pushing
//       const currentPaymentProofs = Array.isArray(existingTask.paymentProofs)
//         ? (existingTask.paymentProofs as string[]) // Cast to string[] assuming it stores URLs
//         : [];
//       updateData.paymentProofs = [...currentPaymentProofs, uploadedFileUrl];
//     }

//     // FIX: Typed paymentEntry
//     const paymentEntry: PaymentHistoryEntry = {
//       amount: updatedAmountToSave,
//       received: updatedReceivedToSave,
//       fileUrl: uploadedFileUrl || null,
//       updatedAt: new Date(),
//       updatedBy: userName || userEmail,
//     };

//     // Safely cast existingTask.paymentHistory to an array of PaymentHistoryEntry
//     const existingHistory = Array.isArray(existingTask.paymentHistory)
//       ? (existingTask.paymentHistory as PaymentHistoryEntry[])
//       : [];
//     updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

//     const updatedTask = await prisma.task.update({ where: { id: taskId }, data: updateData });
//     return NextResponse.json({ success: true, task: updatedTask, fileUrl: uploadedFileUrl });
//   } catch (err: unknown) { // FIX: Changed 'any' to 'unknown' for error handling
//     console.error("Payment Upload Error (POST):", err);
//     return NextResponse.json({ error: "Upload failed", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
//   }
// }

// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   const auth = getUserDetails(req);
//   if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
//   const { userEmail, userName } = auth;
//   const taskId = params.id;

//   try {
//     const { amount, received } = await req.json();
//     const newAmount = typeof amount === 'number' ? amount : undefined;
//     const newReceived = typeof received === 'number' ? received : undefined;

//     const existingTask: Pick<TaskWithPaymentInfo, 'amount' | 'received' | 'paymentHistory'> | null = await prisma.task.findUnique({
//       where: { id: taskId },
//       select: { amount: true, received: true, paymentHistory: true },
//     });
//     if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

//     const currentAmount = existingTask.amount || 0;
//     const currentReceived = existingTask.received || 0;

//     // FIX (Line 153 equivalent, assuming the request referred to this line in PATCH)
//     // Changed 'let' to 'const' as 'updatedAmountToSave' is not reassigned after its initial assignment.
//     const updatedAmountToSave = newAmount !== undefined ? newAmount : currentAmount;
//     let updatedReceivedToSave = newReceived !== undefined ? newReceived : currentReceived; // This can remain 'let' as it is conditionally modified below
//     if (updatedReceivedToSave > updatedAmountToSave) updatedReceivedToSave = updatedAmountToSave;

//     // FIX (Line 121 equivalent, from previous fix): Replaced 'any' with 'Prisma.TaskUpdateInput'
//     const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
//     if (newAmount !== undefined) updateData.amount = newAmount;
//     if (newReceived !== undefined) updateData.received = newReceived;

//     // FIX: Typed paymentEntry
//     const paymentEntry: PaymentHistoryEntry = {
//       amount: updatedAmountToSave,
//       received: updatedReceivedToSave,
//       fileUrl: null, // No file for PATCH
//       updatedAt: new Date(),
//       updatedBy: userName || userEmail,
//     };

//     const existingHistory = Array.isArray(existingTask.paymentHistory)
//       ? (existingTask.paymentHistory as PaymentHistoryEntry[])
//       : [];
//     updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

//     const updatedTask = await prisma.task.update({ where: { id: taskId }, data: updateData });
//     return NextResponse.json({ success: true, task: updatedTask });
//   } catch (err: unknown) { // FIX: Changed 'any' to 'unknown' for error handling
//     console.error("Payment Update Error (PATCH):", err);
//     return NextResponse.json({ error: "Update failed", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
//   }
// }

















import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import cloudinary from "cloudinary";
import { Readable } from "stream";
import { Prisma } from "@prisma/client";

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
}

interface TaskWithPaymentInfo {
  id: string;
  amount: number | null;
  received: number | null;
  paymentProofs: Prisma.JsonValue;
  paymentHistory: Prisma.JsonValue;
  parentTaskId?: string | null;
}

function getUserDetails(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) return { error: "Unauthorized" };
  const userEmail = (sessionClaims?.email as string) || "Unknown User";
  const userName = (sessionClaims?.firstName as string) || "Unknown User";
  return { userId, userEmail, userName };
}

async function getEffectiveTaskId(taskId: string): Promise<string> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { parentTaskId: true },
  });
  return task?.parentTaskId || taskId;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getUserDetails(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { userEmail, userName } = auth;

  const originalTaskId = await getEffectiveTaskId(params.id);

  try {
    const formData = await req.formData();
    // const amountStr = formData.get("amount") as string | null;
    // const receivedStr = formData.get("received") as string | null;
    const file = formData.get("file") as File | null;

//     const newAmount = amountStr !== null ? parseFloat(amountStr) : undefined;
// const newReceived = receivedStr !== null ? parseFloat(receivedStr) : undefined;
// Parse helper: treat blank/whitespace as "not provided"
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
      select: { amount: true, received: true, paymentProofs: true, paymentHistory: true },
    });
    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // ✅ Upload proof file if provided
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

    // ✅ Start with existing values
    let updatedAmountToSave = existingTask.amount;
    let updatedReceivedToSave = existingTask.received ?? 0;

    // Rule: amount is locked after first set
    if (newAmount !== undefined && existingTask.amount === null) {
      updatedAmountToSave = newAmount;
    }

    // Rule: received is cumulative
    if (newReceived !== undefined) {
      if (updatedAmountToSave === null) {
        return NextResponse.json({ error: "Set amount before adding received." }, { status: 400 });
      }
      updatedReceivedToSave += newReceived;
      if (updatedReceivedToSave > updatedAmountToSave) {
        return NextResponse.json({ error: "Received cannot exceed amount." }, { status: 400 });
      }
    }

    const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
    if (updatedAmountToSave !== existingTask.amount) updateData.amount = updatedAmountToSave;
    if (updatedReceivedToSave !== existingTask.received) updateData.received = updatedReceivedToSave;

    // ✅ Append proof only if provided
    if (uploadedFileUrl) {
      const currentProofs = Array.isArray(existingTask.paymentProofs)
        ? (existingTask.paymentProofs as string[])
        : [];
      updateData.paymentProofs = [...currentProofs, uploadedFileUrl];
    }

    // ✅ Always log history (even if only proof uploaded)
    const paymentEntry: PaymentHistoryEntry = {
      amount: updatedAmountToSave ?? 0,
      received: updatedReceivedToSave,
      fileUrl: uploadedFileUrl || null,
      updatedAt: new Date(),
      updatedBy: userName || userEmail,
    };

    const existingHistory = Array.isArray(existingTask.paymentHistory)
      ? (existingTask.paymentHistory as PaymentHistoryEntry[])
      : [];
    updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updatedTask, fileUrl: uploadedFileUrl });
  } catch (err: any) {
    console.error("Payment Upload Error (POST):", err);
    return NextResponse.json({ error: "Upload failed", details: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getUserDetails(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { userEmail, userName } = auth;

  const originalTaskId = await getEffectiveTaskId(params.id);

  try {
    const { amount, received } = await req.json();
    const newAmount = typeof amount === "number" ? amount : undefined;
    const newReceived = typeof received === "number" ? received : undefined;

    const existingTask: Pick<TaskWithPaymentInfo, "amount" | "received" | "paymentHistory"> | null =
      await prisma.task.findUnique({
        where: { id: originalTaskId },
        select: { amount: true, received: true, paymentHistory: true },
      });

    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // const currentAmount = existingTask.amount ?? 0;
    // const currentReceived = existingTask.received ?? null;



    // const updatedAmountToSave = newAmount !== undefined ? newAmount : currentAmount;
    // let updatedReceivedToSave = newReceived !== undefined ? newReceived : currentReceived;
    // if (updatedReceivedToSave > updatedAmountToSave) updatedReceivedToSave = updatedAmountToSave;

    // const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
    // if (newAmount !== undefined) updateData.amount = newAmount;
    // if (newReceived !== undefined) updateData.received = newReceived;
//     const updatedAmountToSave = newAmount !== undefined ? newAmount : currentAmount;
// let updatedReceivedToSave = currentReceived;

// // 🔒 Rule: Received cannot decrease or reset
// if (newReceived !== undefined) {
//   if (newReceived < currentReceived) {
//     return NextResponse.json(
//       { error: "Received cannot be decreased or deleted once set." },
//       { status: 400 }
//     );
//   }
//   if (newReceived > updatedAmountToSave) {
//     return NextResponse.json(
//       { error: "Received cannot exceed amount." },
//       { status: 400 }
//     );
//   }
//   updatedReceivedToSave = newReceived;
// }

// const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
// if (newAmount !== undefined) updateData.amount = updatedAmountToSave;
// if (updatedReceivedToSave !== currentReceived) updateData.received = updatedReceivedToSave;
const currentAmount = existingTask.amount ?? 0;

// Keep both raw (can be null) and numeric (for comparisons)
const currentReceivedRaw: number | null = existingTask.received;
const currentReceivedNum = currentReceivedRaw ?? 0;

const updatedAmountToSave = newAmount !== undefined ? newAmount : currentAmount;
let updatedReceivedToSave = currentReceivedNum; // always a number

// 🔒 Received rules: only act if caller explicitly sent it
if (newReceived !== undefined) {
  // Block decrease if we already had a value
  if (currentReceivedRaw !== null && newReceived < currentReceivedNum) {
    return NextResponse.json(
      { error: "Received cannot be decreased or deleted once set." },
      { status: 400 }
    );
  }
  // Prevent exceeding amount (use possibly-updated amount)
  if (newReceived > updatedAmountToSave) {
    return NextResponse.json(
      { error: "Received cannot exceed amount." },
      { status: 400 }
    );
  }
  // Optional: block negatives
  if (newReceived < 0) {
    return NextResponse.json(
      { error: "Received cannot be negative." },
      { status: 400 }
    );
  }
  updatedReceivedToSave = newReceived;
}

const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };

// Only write fields that were explicitly changed
if (newAmount !== undefined) {
  updateData.amount = updatedAmountToSave;
}
if (newReceived !== undefined && updatedReceivedToSave !== currentReceivedNum) {
  updateData.received = updatedReceivedToSave;
}



   
    const receivedForHistory =
  newReceived !== undefined ? updatedReceivedToSave : currentReceivedNum;

const paymentEntry: PaymentHistoryEntry = {
  amount: updatedAmountToSave,
  received: receivedForHistory,
  fileUrl: null,
  updatedAt: new Date(),
  updatedBy: userName || userEmail,
};


    const existingHistory = Array.isArray(existingTask.paymentHistory)
      ? (existingTask.paymentHistory as PaymentHistoryEntry[])
      : [];
    updateData.paymentHistory = [...existingHistory, paymentEntry] as Prisma.InputJsonValue;

    const updatedTask = await prisma.task.update({
      where: { id: originalTaskId },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    console.error("Payment Update Error (PATCH):", err);
    return NextResponse.json(
      {
        error: "Update failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}