// FILE: src/app/api/stats/user-performance/by-assigner/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // format: YYYY-MM

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      // Parse YYYY-MM into start & end of month
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    } else {
      // Default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // ✅ Fetch tasks within selected month
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        assignerName: true,
        assignerEmail: true,
        createdByName: true,
        createdByEmail: true,
        amount: true,
        received: true,
      },
    });

    // ✅ Group by assigner
    const assignerMap: Record<
      string,
      {
        name: string;
        email: string;
        totalRevenue: number;
        amountReceived: number;
        totalSales: number;
      }
    > = {};

    for (const task of tasks) {
      const name = task.assignerName || task.createdByName || "Unknown";
      const email = task.assignerEmail || task.createdByEmail || "";

      const key = email || name;
      if (!assignerMap[key]) {
        assignerMap[key] = {
          name,
          email,
          totalRevenue: 0,
          amountReceived: 0,
          totalSales: 0,
        };
      }

      assignerMap[key].totalRevenue += task.amount || 0;
      assignerMap[key].amountReceived += task.received || 0;
      assignerMap[key].totalSales += 1;
    }

    // ✅ Convert to array & add pending
    const data = Object.values(assignerMap).map((a) => ({
      ...a,
      pendingAmount: a.totalRevenue - a.amountReceived,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in /by-assigner:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigner stats" },
      { status: 500 }
    );
  }
}
