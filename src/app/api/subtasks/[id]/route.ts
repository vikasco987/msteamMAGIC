import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: subtaskId } = await context.params;

  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) return NextResponse.json({ error: "Subtask not found" }, { status: 404 });

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed: !subtask.completed },
    });

    const user = await currentUser();
    const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Unknown User";

    // Log Activity
    await logActivity({
      taskId: subtask.taskId,
      type: "SUBTASK_TOGGLED",
      content: `${updatedSubtask.completed ? "completed" : "uncompleted"} subtask: "${subtask.title}"`,
      author: userName,
      authorId: userId
    });

    return NextResponse.json(updatedSubtask);
  } catch (err) {
    console.error("Subtask Update Error:", err);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}
