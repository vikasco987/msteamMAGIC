import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

interface PatchRequestBody {
  title?: string;
  status?: string;
  amount?: number | string | null;
  received?: number | string | null;
  description?: string;
  highlightColor?: string | null;
  customFields?: { [key: string]: any };
  assignerEmail?: string | null;
  assigneeEmail?: string | null;
  assignerName?: string | null;
  assigneeName?: string | null;
  assigneeId?: string | null;
  assigneeIds?: string[] | string | null;
}

// --- GET Task ---
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await context.params;
  const { userId } = await auth();

  if (!taskId || !userId) {
    return NextResponse.json({ error: "Unauthorized or missing task ID" }, { status: 400 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error("❌ Get task failed:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// --- PATCH Task ---
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await context.params;
  const { userId, sessionClaims } = await auth();

  if (!taskId) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: PatchRequestBody = await req.json();

    // Fetch current state for logging
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updateData: Prisma.TaskUpdateInput = { updatedAt: new Date() };
    const user = await currentUser();
    const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Unknown User";

    const allowedFields = [
      "title", "status", "amount", "received", "description",
      "highlightColor", "assignerEmail", "assigneeEmail",
      "assignerName", "assigneeName", "assigneeId", "assigneeIds"
    ];

    const logs: string[] = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field as keyof PatchRequestBody];
        const oldValue = (currentTask as any)[field];

        if (field === "amount" || field === "received") {
          let numValue: number | null = null;
          if (typeof value === "number") numValue = value;
          else if (typeof value === "string" && !isNaN(parseFloat(value))) numValue = parseFloat(value);

          if (numValue !== oldValue) {
            updateData[field] = numValue;
            logs.push(`${field.toUpperCase()} updated from ${oldValue || 0} to ${numValue || 0}`);
          }
        } else if (field === "assigneeIds") {
          const newIds = Array.isArray(value) ? value.map(String) : typeof value === "string" ? [value] : [];
          updateData.assigneeIds = newIds;
          logs.push(`reassigned the task to ${newIds.length > 0 ? newIds.join(", ") : "nobody"}`);
        } else if (value !== oldValue) {
          (updateData as any)[field] = value;
          if (field === "status") {
            const lastChange = await prisma.activity.findFirst({
              where: {
                taskId,
                type: { in: ["STATUS_CHANGE", "TASK_CREATED"] }
              },
              orderBy: { createdAt: "desc" }
            });

            let timeInfo = "";
            if (lastChange) {
              const diffMs = Date.now() - new Date(lastChange.createdAt).getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
              timeInfo = ` (Duration: ${hours}h ${minutes}m)`;
            }
            logs.push(`Status changed from ${oldValue || 'None'} to ${value}${timeInfo}`);
          } else if (field === "title") {
            logs.push(`Title changed to "${value}"`);
          }
        }
      }
    }

    // Custom fields merging
    if (body.customFields !== undefined) {
      const existingCustomFields = (currentTask.customFields as Prisma.JsonObject) || {};
      updateData.customFields = { ...existingCustomFields, ...body.customFields };
    }

    // Execute update
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Log activities
    for (const log of logs) {
      await logActivity({
        taskId,
        type: log.includes("Status") ? "STATUS_CHANGE" : "TASK_UPDATED",
        content: log,
        author: userName,
        authorId: userId
      });
    }

    // 🚀 NEW: Notify ONLY Admin and Master for payment updates
    if (updateData.amount !== undefined || updateData.received !== undefined) {
      const client = await clerkClient();
      const clerkUsersResponse = await client.users.getUserList({ limit: 500 });
      const adminMasterIds = clerkUsersResponse.data
        .filter(u => {
          const role = (u.publicMetadata?.role as string)?.toLowerCase();
          return role === 'admin' || role === 'master';
        })
        .map(u => u.id)
        .filter(id => id !== userId);

      const cf = (updated.customFields as any) || {};
      const taskDetails = `[${cf.shopName || "N/A"}] - ${updated.title}`;
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      await Promise.all(adminMasterIds.map(recipientId =>
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: "PAYMENT_ADDED",
            title: "💳 Payment Update (Table)",
            content: `Payment Update: Total ₹${updated.received || 0} for ${taskDetails}. \nUpdated By: ${userName} \nDate: ${timestamp}`,
            taskId: updated.id
          }
        }).catch(err => console.error("Payment alert error:", err))
      ));
    }

    // Trigger notification if status becomes "done"
    if (updateData.status === "done" && currentTask.status !== "done") {
      const recipientIds = new Set<string>();

      // 1. Add assignee(s)
      if (updated.assigneeIds && updated.assigneeIds.length > 0) {
        updated.assigneeIds.forEach(id => { if (id) recipientIds.add(id); });
      } else if (updated.assigneeId) {
        recipientIds.add(updated.assigneeId);
      }

      // 2. Add creator/assigner
      if (updated.createdByClerkId) {
        recipientIds.add(updated.createdByClerkId);
      }

      // 3. Remove the person who performed the action
      recipientIds.delete(userId);

      const notificationTitle = "✅ Task Completed";
      const notificationContent = `Task "${updated.title}" was completed by ${userName}.`;

      await Promise.all(Array.from(recipientIds).map(recipientId =>
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: "TASK_COMPLETED",
            title: notificationTitle,
            content: notificationContent,
            taskId: updated.id
          }
        }).catch(err => console.error("Completion alert error:", err))
      ));
    }

    return NextResponse.json({ success: true, task: updated }, { status: 200 });
  } catch (err) {
    console.error("❌ Update failed:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// --- DELETE Task ---
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await context.params;
  const { userId } = await auth();

  if (!taskId || !userId) return NextResponse.json({ error: "Unauthorized or missing task ID" }, { status: 400 });

  try {
    await prisma.subtask.deleteMany({ where: { taskId } });
    await prisma.note.deleteMany({ where: { taskId } });
    await prisma.activity.deleteMany({ where: { taskId } });
    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
