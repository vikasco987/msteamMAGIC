import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET() {
  try {
    // ✅ Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // ✅ Fetch only current month sales
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      select: {
        amount: true,
        received: true,
      },
    });

    // ✅ Calculate current month totals
    const totalRevenue = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const amountReceived = tasks.reduce((sum, t) => sum + (t.received || 0), 0);
    const pendingAmount = totalRevenue - amountReceived;
    const totalSales = tasks.length;

    return NextResponse.json({
      totalRevenue,
      amountReceived,
      pendingAmount,
      totalSales,
    });
  } catch (error) {
    console.error("Error fetching current month overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview stats" },
      { status: 500 }
    );
  }
}
