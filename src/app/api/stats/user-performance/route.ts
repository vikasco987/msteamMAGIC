import { NextResponse } from "next/server";
//import { prisma as db } from "../../../../../lib/prisma";
import { prisma as db } from "../../../../../lib/prisma"; // ✅ correct

// Fixed path

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (monthParam) {
      const [year, month] = monthParam.split("-");
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);

      if (!isNaN(y) && !isNaN(m)) {
        startDate = new Date(y, m - 1, 1); // First day of month
        endDate = new Date(y, m, 0, 23, 59, 59, 999); // Last day of month
      }
    }

    const tasks = await db.task.findMany({
      where:
        startDate && endDate
          ? {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {},
    });

    const userStatsMap: Record<string, { email: string; count: number }> = {};

    for (const task of tasks) {
      const email = task.createdByClerkId || "unknown";
      if (!userStatsMap[email]) {
        userStatsMap[email] = {
          email,
          count: 1,
        };
      } else {
        userStatsMap[email].count++;
      }
    }

    const stats = Object.values(userStatsMap).map((u) => ({
      email: u.email,
      taskCount: u.count,
    }));

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user performance" },
      { status: 500 }
    );
  }
}













