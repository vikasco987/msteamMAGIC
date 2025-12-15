import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany();

    const monthlyDataMap: { [key: string]: number } = {};

    tasks.forEach((t) => {
      const monthKey = new Date(t.createdAt).toISOString().slice(0, 7); // "2025-07"
      monthlyDataMap[monthKey] = (monthlyDataMap[monthKey] || 0) + (t.amount || 0);
    });

    return NextResponse.json(monthlyDataMap);
  } catch (err) {
    console.error("Error fetching monthly stats:", err);
    return NextResponse.json({ error: "Failed to load monthly stats" }, { status: 500 });
  }
}
