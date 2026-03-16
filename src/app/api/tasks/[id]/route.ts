import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { users as clerkUsers } from "@clerk/clerk-sdk-node";
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

    // --- 🔄 FIELD SYNC LOGIC ---
    
    // 1. Sync Assignee IDs
    if (updateData.assigneeId && !updateData.assigneeIds) {
      updateData.assigneeIds = [updateData.assigneeId as string];
    }

    // 2. Sync Assignee Details if assigneeIds changed
    if (updateData.assigneeIds !== undefined) {
      const ids = updateData.assigneeIds as string[];
      if (ids && ids.length > 0) {
        try {
          const client = await clerkClient();
          const leadUser = await client.users.getUser(ids[0]);
          updateData.assigneeId = leadUser.id;
          updateData.assigneeName = `${leadUser.firstName || ""} ${leadUser.lastName || ""}`.trim() || leadUser.username || "Unknown";
          updateData.assigneeEmail = leadUser.emailAddresses[0]?.emailAddress || "Unknown";
          
          // Also handle the case where they are in customFields
          if (updateData.customFields === undefined) {
            const cf = { ...(currentTask.customFields as any || {}) };
            let cfChanged = false;
            if (cf.assigneeName !== undefined) { cf.assigneeName = updateData.assigneeName; cfChanged = true; }
            if (cf.assigneeEmail !== undefined) { cf.assigneeEmail = updateData.assigneeEmail; cfChanged = true; }
            if (cf.assigneeId !== undefined) { cf.assigneeId = updateData.assigneeId; cfChanged = true; }
            if (cfChanged) updateData.customFields = cf;
          }
        } catch (err) {
          console.error("Failed to sync lead user on reassignment:", err);
        }
      } else {
        updateData.assigneeId = null;
        updateData.assigneeName = null;
        updateData.assigneeEmail = null;
      }
    }

    // 3. Sync Other Redundant Fields (Top-level <-> customFields)
    const syncableFields = [
      "phone", "email", "shopName", "location", "accountNumber", "ifscCode", 
      "restId", "customerName", "packageAmount", "startDate", "endDate", "timeline"
    ];
    
    const existingCF = { ...(currentTask.customFields as any || {}) };
    let cfNeedsUpdate = false;
    
    for (const f of syncableFields) {
      if ((updateData as any)[f] !== undefined && existingCF[f] !== undefined) {
        existingCF[f] = (updateData as any)[f];
        cfNeedsUpdate = true;
      }
    }
    
    if (cfNeedsUpdate && updateData.customFields === undefined) {
      updateData.customFields = existingCF;
    } else if (cfNeedsUpdate && updateData.customFields !== undefined) {
      updateData.customFields = { ...(updateData.customFields as any), ...existingCF };
    }

    // Execution Logic
    if (body.customFields !== undefined) {
      const existingCustomFields = (currentTask.customFields as Prisma.JsonObject) || {};
      updateData.customFields = { ...existingCustomFields, ...body.customFields, ...(updateData.customFields as any || {}) };
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
      console.log("DEBUG: Payment update detected. Fetching admins from Clerk...");

      const allClerkUsers = await clerkUsers.getUserList({ limit: 500 });
      const adminMasterIds = allClerkUsers
        .filter(u => {
          const role = ((u.publicMetadata?.role as string) || (u.privateMetadata?.role as string) || "").toLowerCase();
          return role === "admin" || role === "master";
        })
        .map(u => u.id)
        .filter(id => id !== userId);

      console.log(`DEBUG: Found ${adminMasterIds.length} recipient admins from Clerk:`, adminMasterIds);

      const cf = (updated.customFields as any) || {};
      const taskDetails = `[${cf.shopName || "N/A"}] - ${updated.title}`;
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      if (adminMasterIds.length === 0) {
        console.log("DEBUG: No recipients for notification. (Check Clerk user metadata roles)");
      }

      await Promise.all(adminMasterIds.map(async recipientId => {
        try {
          const notif = await prisma.notification.create({
            data: {
              userId: recipientId,
              type: "PAYMENT_ADDED",
              content: `💳 PAYMENT UPDATE: Total ₹${updated.received || 0} for ${taskDetails}. \nUpdated By: ${userName} \nDate: ${timestamp}`,
              taskId: updated.id
            } as any
          });
          console.log(`DEBUG: Notification ${notif.id} created for Admin ${recipientId}`);
        } catch (err) {
          console.error(`DEBUG: Failed to create notification for ${recipientId}:`, err);
        }
      }));
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

      // 2. Add creator (The person who needs to be notified)
      if (currentTask.createdByClerkId) {
        recipientIds.add(currentTask.createdByClerkId);
      }

      // 3. Remove the person who performed the action
      recipientIds.delete(userId);

      const cf = (updated.customFields as any) || {};
      const shopName = cf.shopName || "N/A";
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      const notificationTitle = "✅ Task Completed";
      const notificationContent = `Task Finished: "${updated.title}"\nShop: ${shopName}\nCompleted By: ${userName}\nDate: ${timestamp}`;

      await Promise.all(Array.from(recipientIds).map(recipientId =>
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: "TASK_COMPLETED",
            title: notificationTitle,
            content: notificationContent,
            taskId: updated.id
          } as any
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
