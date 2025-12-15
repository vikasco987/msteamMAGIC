import { NextResponse } from 'next/server';
import { prisma } from "../../../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM

  const startDate = new Date(`${month}-01`);
  const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

  const tasks = await prisma.task.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const totalRevenue = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
  const amountReceived = tasks.reduce((sum, t) => sum + (t.received || 0), 0);
  const pendingAmount = totalRevenue - amountReceived;
  const totalSales = tasks.length;

  // Monthly breakdown
  const monthlyDataMap: { [key: string]: number } = {};
  tasks.forEach((t) => {
    const monthKey = new Date(t.createdAt).toISOString().slice(0, 7); // "2025-07"
    monthlyDataMap[monthKey] = (monthlyDataMap[monthKey] || 0) + (t.amount || 0);
  });

  const monthlyData = Object.entries(monthlyDataMap).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return NextResponse.json({
    totalRevenue,
    amountReceived,
    pendingAmount,
    totalSales,
    monthlyData,
  });
}
