
// import { prisma } from "../../../../../../lib/prisma";




// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../../lib/prisma";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const skip = (page - 1) * limit;

//     const tasks = await prisma.task.findMany({
//       select: {
//         createdAt: true,
//         amount: true,
//         received: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const dayMap: Record<string, { totalRevenue: number; amountReceived: number; totalLeads: number }> = {};

//     for (const task of tasks) {
//       if (!task.createdAt) continue;

//       const dateKey = new Date(task.createdAt).toISOString().split("T")[0]; // "YYYY-MM-DD"
//       if (!dayMap[dateKey]) {
//         dayMap[dateKey] = {
//           totalRevenue: 0,
//           amountReceived: 0,
//           totalLeads: 0,
//         };
//       }

//       dayMap[dateKey].totalRevenue += task.amount || 0;
//       dayMap[dateKey].amountReceived += task.received || 0;
//       dayMap[dateKey].totalLeads += 1;
//     }

//     const allDays = Object.entries(dayMap)
//       .sort(([a], [b]) => b.localeCompare(a)) // Newest first
//       .map(([date, stats]) => ({
//         date,
//         totalRevenue: stats.totalRevenue,
//         amountReceived: stats.amountReceived,
//         pendingAmount: stats.totalRevenue - stats.amountReceived,
//         totalLeads: stats.totalLeads,
//       }));

//     const paginatedData = allDays.slice(skip, skip + limit);

//     return NextResponse.json({
//       data: paginatedData,
//       total: allDays.length,
//       totalPages: Math.ceil(allDays.length / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error("Error in day-report:", error);
//     return NextResponse.json({ error: "Failed to generate day report" }, { status: 500 });
//   }
// }




//recent




// /api/stats/user-performance/day-report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const tasks = await prisma.task.findMany({
      select: {
        createdAt: true,
        amount: true,
        received: true,
      },
    });

    const dayMap: Record<
      string,
      {
        totalRevenue: number;
        amountReceived: number;
        totalLeads: number;
      }
    > = {};

    for (const task of tasks) {
      const dateKey = new Date(task.createdAt).toISOString().slice(0, 10);
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          totalRevenue: 0,
          amountReceived: 0,
          totalLeads: 0,
        };
      }
      dayMap[dateKey].totalRevenue += task.amount || 0;
      dayMap[dateKey].amountReceived += task.received || 0;
      dayMap[dateKey].totalLeads += 1;
    }

    // Sort newest → oldest
    const allDates = Object.entries(dayMap)
      .sort(([a], [b]) => b.localeCompare(a)) // ✅ recent first
      .map(([date, stats], index, arr) => {
        // Calculate cumulative revenue in reverse order
        const prevCumulative =
          index > 0 ? arr[index - 1][1].cumulativeRevenue ?? 0 : 0;
        const currentRevenue = stats.totalRevenue;
        const cumulativeRevenue = prevCumulative + currentRevenue;

        return {
          date,
          totalLeads: stats.totalLeads,
          totalRevenue: stats.totalRevenue,
          amountReceived: stats.amountReceived,
          pendingAmount: stats.totalRevenue - stats.amountReceived,
          cumulativeRevenue,
        };
      });

    const total = allDates.length;
    const paginated = allDates.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ data: paginated, total });
  } catch (error) {
    console.error("Error in day-report:", error);
    return NextResponse.json(
      { error: "Failed to generate day report" },
      { status: 500 }
    );
  }
}
