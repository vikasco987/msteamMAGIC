// // src/app/api/seller/stats/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function GET(req: Request) {
//   try {
   
//     const { userId } = await auth();

//     if (!userId) {
//       console.error("❌ Unauthorized request - no userId from Clerk");
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const month = searchParams.get("month"); // YYYY-MM

//     if (!month) {
//       return NextResponse.json(
//         { error: "Month query param required (YYYY-MM)" },
//         { status: 400 }
//       );
//     }

//     const startDate = new Date(`${month}-01T00:00:00.000Z`);
//     const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

//     // Fetch tasks for this seller
//     const tasks = await prisma.task.findMany({
//       where: {
//         createdByClerkId: userId, // ✅ only seller’s tasks
//         createdAt: {
//           gte: startDate,
//           lt: endDate,
//         },
//       },
//       select: {
//         amount: true,
//         received: true,
//         createdAt: true,
//       },
//     });

//     if (!tasks || tasks.length === 0) {
//       console.warn(`⚠️ No tasks found for sellerId=${userId}, month=${month}`);
//     }

//     // Debug log
//     console.log(`📦 Tasks for seller ${userId} in ${month}:`, tasks);

//     // Revenue calculations
//     const totalRevenue = tasks.reduce((sum, t) => sum + (t.amount ?? 0), 0);
//     const totalReceived = tasks.reduce((sum, t) => sum + (t.received ?? 0), 0);
//     const pendingAmount = totalRevenue - totalReceived;

//     return NextResponse.json(
//       {
//         sellerId: userId,
//         month,
//         totalRevenue,
//         totalReceived,
//         pendingAmount,
//         taskCount: tasks.length,
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("🔥 Error in /api/seller/stats:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: error.message },
//       { status: 500 }
//     );
//   }
// }














import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth(); // ⚡️ no need for await here

    if (!userId) {
      console.error("❌ Unauthorized request - no userId from Clerk");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM

    if (!month) {
      return NextResponse.json(
        { error: "Month query param required (YYYY-MM)" },
        { status: 400 }
      );
    }

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch tasks created by this seller for the month
    const tasks = await prisma.task.findMany({
      where: {
        createdByClerkId: userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        received: true,
        createdAt: true,
      },
    });

    if (!tasks.length) {
      console.warn(`⚠️ No tasks found for sellerId=${userId}, month=${month}`);
    } else {
      console.log(`📦 Found ${tasks.length} tasks for seller ${userId} in ${month}`);
    }

    // Revenue calculations
    const totalRevenue = tasks.reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const totalReceived = tasks.reduce((sum, t) => sum + (t.received ?? 0), 0);
    const pendingRevenue = totalRevenue - totalReceived;
    const totalSales = tasks.length;

    return NextResponse.json(
      {
        sellerId: userId,
        month,
        totalRevenue,
        totalReceived,
        pendingRevenue,
        totalSales,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 Error in /api/seller/stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
