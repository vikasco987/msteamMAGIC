// /api/stats/user-performance/week-report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

function getWeekKey(date: Date): string {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  const day = temp.getDay();
  const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(temp.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000"); // higher limit for chart

    const tasks = await prisma.task.findMany({
      select: {
        createdAt: true,
        amount: true,
        received: true,
      },
    });

    const weekMap: Record<
      string,
      { totalRevenue: number; amountReceived: number; totalLeads: number }
    > = {};

    for (const task of tasks) {
      if (!task.createdAt) continue;
      const weekKey = getWeekKey(new Date(task.createdAt));

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { totalRevenue: 0, amountReceived: 0, totalLeads: 0 };
      }

      weekMap[weekKey].totalRevenue += task.amount || 0;
      weekMap[weekKey].amountReceived += task.received || 0;
      weekMap[weekKey].totalLeads += 1;
    }

    let cumulativeTotal = 0;

    const allWeeks = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b)) // oldest first
      .map(([weekStart, stats]) => {
        const start = new Date(weekStart);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        cumulativeTotal += stats.totalRevenue;

        return {
          week: `Week of ${formatDate(weekStart)}`,
          startDate: weekStart,
          endDate: end.toISOString().split("T")[0],
          totalLeads: stats.totalLeads,
          totalRevenue: stats.totalRevenue,
          amountReceived: stats.amountReceived,
          pendingAmount: stats.totalRevenue - stats.amountReceived,
          cumulativeRevenue: cumulativeTotal,
        };
      })
      .reverse(); // newest first

    const total = allWeeks.length;
    const paginated = allWeeks.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ data: paginated, total });
  } catch (error) {
    console.error("Error in week-report:", error);
    return NextResponse.json(
      { error: "Failed to generate week report" },
      { status: 500 }
    );
  }
}
