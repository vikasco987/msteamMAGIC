// /api/stats/user-performance/by-assignee/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    select: {
      assigneeName: true,
      amount: true,
    },
  });

  const grouped: Record<string, number> = {};

  for (const task of tasks) {
    const name = task.assigneeName || "Unassigned";
    grouped[name] = (grouped[name] || 0) + (task.amount || 0);
  }

  return NextResponse.json(grouped);
}
