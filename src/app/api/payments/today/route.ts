// // /app/api/payments/today/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET() {
//   try {
//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const endOfToday = new Date();
//     endOfToday.setHours(23, 59, 59, 999);

//     // Fetch all tasks
//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     type DailyPayment = {
//       taskId: string;
//       taskTitle: string;
//       assignerName: string;
//       received: number;
//       updatedAt: Date;
//       updatedBy: string;
//       fileUrl: string | null;
//     };

//     const paymentsToday: DailyPayment[] = [];

//     tasks.forEach((task) => {
//       const todayPayments = (task.paymentHistory as any[]).filter(
//         (p) => {
//           const updatedAt = new Date(p.updatedAt);
//           return updatedAt >= startOfToday && updatedAt <= endOfToday;
//         }
//       );

//       todayPayments.forEach((p) => {
//         paymentsToday.push({
//           taskId: task.id,
//           taskTitle: task.title,
//           assignerName: p.assignerName || task.assignerName || "Unknown",
//           received: p.received,
//           updatedAt: new Date(p.updatedAt),
//           updatedBy: p.updatedBy,
//           fileUrl: p.fileUrl,
//         });
//       });
//     });

//     // Aggregate total payments by assigner
//     const summaryByAssigner: Record<string, number> = {};
//     paymentsToday.forEach((p) => {
//       summaryByAssigner[p.assignerName] = (summaryByAssigner[p.assignerName] || 0) + p.received;
//     });

//     return NextResponse.json({
//       paymentsToday,
//       summaryByAssigner,
//     });
//   } catch (err: any) {
//     console.error("Error fetching today's payments:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

















// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dateParam = searchParams.get("date"); // YYYY-MM-DD

//     // 🔥 Base date (default = today)
//     const baseDate = dateParam ? new Date(dateParam) : new Date();

//     // 🔥 UTC-safe day range
//     const startOfDay = new Date(baseDate);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(baseDate);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     // Fetch tasks with paymentHistory
//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     type DailyPayment = {
//       taskId: string;
//       taskTitle: string;
//       assignerName: string;
//       received: number;
//       updatedAt: Date;
//       updatedBy: string;
//       fileUrl: string | null;
//     };

//     const paymentsToday: DailyPayment[] = [];
//     const summaryByAssigner: Record<string, number> = {};

//     for (const task of tasks) {
//       if (!Array.isArray(task.paymentHistory)) continue;

//       for (const p of task.paymentHistory as any[]) {
//         if (!p?.updatedAt) continue;

//         const updatedAt = new Date(p.updatedAt);

//         // ✅ CORRECT DATE FILTER
//         if (updatedAt >= startOfDay && updatedAt <= endOfDay) {
//           const assigner =
//             p.assignerName || task.assignerName || "Unknown";

//           const receivedAmount = Number(p.received) || 0;

//           paymentsToday.push({
//             taskId: task.id,
//             taskTitle: task.title,
//             assignerName: assigner,
//             received: receivedAmount,
//             updatedAt,
//             updatedBy: p.updatedBy || "Unknown",
//             fileUrl: p.fileUrl || null,
//           });

//           // ✅ Aggregate by assigner
//           summaryByAssigner[assigner] =
//             (summaryByAssigner[assigner] || 0) + receivedAmount;
//         }
//       }
//     }

//     return NextResponse.json({
//       date: startOfDay.toISOString().slice(0, 10),
//       paymentsToday,
//       summaryByAssigner,
//     });
//   } catch (err: any) {
//     console.error("❌ Error fetching payments:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to fetch payments" },
//       { status: 500 }
//     );
//   }
// }
















// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dateParam = searchParams.get("date"); // YYYY-MM-DD

//     // 🔥 Base date (default = today)
//     const baseDate = dateParam ? new Date(dateParam) : new Date();

//     // 🔥 UTC-safe day range
//     const startOfDay = new Date(baseDate);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(baseDate);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     // Fetch tasks with paymentHistory
//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     type DailyPayment = {
//       paymentId: string; // ✅ Added unique ID
//       taskId: string;
//       taskTitle: string;
//       assignerName: string;
//       received: number;
//       updatedAt: Date;
//       updatedBy: string;
//       fileUrl: string | null;
//     };

//     const paymentsToday: DailyPayment[] = [];
//     const summaryByAssigner: Record<string, number> = {};

//     for (const task of tasks) {
//       if (!Array.isArray(task.paymentHistory)) continue;

//       for (const p of task.paymentHistory as any[]) {
//         if (!p?.updatedAt) continue;

//         const updatedAt = new Date(p.updatedAt);

//         // ✅ Filter payments by selected date
//         if (updatedAt >= startOfDay && updatedAt <= endOfDay) {
//           const assigner =
//             p.assignerName || task.assignerName || "Unknown";

//           const receivedAmount = Number(p.received) || 0;

//           // ✅ Generate unique paymentId
//           const paymentId = `${task.id}_${updatedAt.getTime()}`;

//           paymentsToday.push({
//             paymentId,
//             taskId: task.id,
//             taskTitle: task.title,
//             assignerName: assigner,
//             received: receivedAmount,
//             updatedAt,
//             updatedBy: p.updatedBy || "Unknown",
//             fileUrl: p.fileUrl || null,
//           });

//           // ✅ Aggregate total by assigner
//           summaryByAssigner[assigner] =
//             (summaryByAssigner[assigner] || 0) + receivedAmount;
//         }
//       }
//     }

//     return NextResponse.json({
//       date: startOfDay.toISOString().slice(0, 10),
//       paymentsToday,
//       summaryByAssigner,
//     });
//   } catch (err: any) {
//     console.error("❌ Error fetching payments:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to fetch payments" },
//       { status: 500 }
//     );
//   }
// }































// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dateParam = searchParams.get("date"); // YYYY-MM-DD

//     // Base date (default = today)
//     const baseDate = dateParam ? new Date(dateParam) : new Date();

//     // UTC-safe day range
//     const startOfDay = new Date(baseDate);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(baseDate);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     // Fetch tasks with paymentHistory
//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     type DailyPayment = {
//       paymentId: string; // Unique ID for delete
//       taskId: string;
//       taskTitle: string;
//       assignerName: string;
//       received: number;      // total received so far
//       deltaReceived: number; // amount received in this entry
//       updatedAt: Date;
//       updatedBy: string;
//       fileUrl: string | null;
//     };

//     const paymentsToday: DailyPayment[] = [];
//     const summaryByAssigner: Record<string, number> = {};

//     for (const task of tasks) {
//       if (!Array.isArray(task.paymentHistory)) continue;

//       // Track running total per assigner for today
//       const runningTotalByAssigner: Record<string, number> = {};

//       for (const p of task.paymentHistory as any[]) {
//         if (!p?.updatedAt) continue;

//         const updatedAt = new Date(p.updatedAt);

//         // Only include payments for selected date
//         if (updatedAt >= startOfDay && updatedAt <= endOfDay) {
//           const assigner = p.assignerName || task.assignerName || "Unknown";
//           const deltaReceived = Number(p.received) || 0;

//           // Running total for this assigner
//           const previousTotal = runningTotalByAssigner[assigner] || 0;
//           const totalReceived = previousTotal + deltaReceived;
//           runningTotalByAssigner[assigner] = totalReceived;

//           // Update overall summary
//           summaryByAssigner[assigner] =
//             (summaryByAssigner[assigner] || 0) + deltaReceived;

//           // Unique paymentId (taskId_timestamp)
//           const paymentId = `${task.id}_${updatedAt.getTime()}`;

//           paymentsToday.push({
//             paymentId,
//             taskId: task.id,
//             taskTitle: task.title,
//             assignerName: assigner,
//             received: totalReceived, // total so far
//             deltaReceived,           // amount updated in this entry
//             updatedAt,
//             updatedBy: p.updatedBy || "Unknown",
//             fileUrl: p.fileUrl || null,
//           });
//         }
//       }
//     }

//     return NextResponse.json({
//       date: startOfDay.toISOString().slice(0, 10),
//       paymentsToday,
//       summaryByAssigner,
//     });
//   } catch (err: any) {
//     console.error("❌ Error fetching payments:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to fetch payments" },
//       { status: 500 }
//     );
//   }
// }





















// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dateParam = searchParams.get("date");

//     const baseDate = dateParam ? new Date(dateParam) : new Date();

//     const startOfDay = new Date(baseDate);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(baseDate);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     const paymentsToday: any[] = [];

//     for (const task of tasks) {
//       if (!Array.isArray(task.paymentHistory)) continue;

//       const history = task.paymentHistory as any[];

//       for (let i = 0; i < history.length; i++) {
//         const p = history[i];
//         if (!p?.updatedAt) continue;

//         const updatedAt = new Date(p.updatedAt);

//         if (updatedAt >= startOfDay && updatedAt <= endOfDay) {
//           const previousReceived =
//             i > 0 ? Number(history[i - 1].received || 0) : 0;

//           const currentReceived = Number(p.received || 0);

//           const amountUpdated =
//             i === 0 ? currentReceived : currentReceived - previousReceived;

//           paymentsToday.push({
//             paymentId: `${task.id}_${updatedAt.getTime()}`,
//             taskId: task.id,
//             taskTitle: task.title,
//             assignerName: p.assignerName || task.assignerName || "Unknown",

//             // ✅ main columns
//             received: currentReceived,        // total received till now
//             amountUpdated: amountUpdated,     // 🔥 newly added amount

//             updatedAt,
//             updatedBy: p.updatedBy || "Unknown",
//             fileUrl: p.fileUrl || null,
//           });
//         }
//       }
//     }

//     return NextResponse.json({
//       date: startOfDay.toISOString().slice(0, 10),
//       paymentsToday,
//     });
//   } catch (err: any) {
//     console.error("❌ Error fetching payments:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch payments" },
//       { status: 500 }
//     );
//   }
// }














// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dateParam = searchParams.get("date");

//     const baseDate = dateParam ? new Date(dateParam) : new Date();

//     const startOfDay = new Date(baseDate);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(baseDate);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     const tasks = await prisma.task.findMany({
//       select: {
//         id: true,
//         title: true,
//         assignerName: true,
//         paymentHistory: true,
//       },
//     });

//     const paymentsToday: any[] = [];
//     const summaryByAssigner: Record<string, number> = {}; // ✅ ADD THIS

//     for (const task of tasks) {
//       if (!Array.isArray(task.paymentHistory)) continue;

//       const history = task.paymentHistory as any[];

//       for (let i = 0; i < history.length; i++) {
//         const p = history[i];
//         if (!p?.updatedAt) continue;

//         const updatedAt = new Date(p.updatedAt);

//         if (updatedAt >= startOfDay && updatedAt <= endOfDay) {
//           const previousReceived =
//             i > 0 ? Number(history[i - 1].received || 0) : 0;

//           const currentReceived = Number(p.received || 0);

//           const amountUpdated =
//             i === 0 ? currentReceived : currentReceived - previousReceived;

//           const assigner =
//             p.assignerName || task.assignerName || "Unknown";

//           // ✅ push row data
//           paymentsToday.push({
//             paymentId: `${task.id}_${updatedAt.getTime()}`,
//             taskId: task.id,
//             taskTitle: task.title,
//             assignerName: assigner,

//             received: currentReceived,        // total till now
//             amountUpdated: amountUpdated,     // + / -

//             updatedAt,
//             updatedBy: p.updatedBy || "Unknown",
//             fileUrl: p.fileUrl || null,
//           });

//           // ✅ ADD TOTAL FOR ASSIGNER (boxes above table)
//           summaryByAssigner[assigner] =
//             (summaryByAssigner[assigner] || 0) + amountUpdated;
//         }
//       }
//     }

//     return NextResponse.json({
//       date: startOfDay.toISOString().slice(0, 10),
//       paymentsToday,
//       summaryByAssigner, // ✅ THIS FIXES YOUR ISSUE
//     });
//   } catch (err: any) {
//     console.error("❌ Error fetching payments:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch payments" },
//       { status: 500 }
//     );
//   }
// }














import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const baseDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(baseDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(baseDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        assignerName: true,
        paymentHistory: true,
      },
    });

    const paymentsToday: any[] = [];
    const summaryByAssigner: Record<string, number> = {};
    let totalUpdatedAmount = 0; // 🔥 NEW

    for (const task of tasks) {
      if (!Array.isArray(task.paymentHistory)) continue;

      const history = task.paymentHistory as any[];

      for (let i = 0; i < history.length; i++) {
        const p = history[i];
        if (!p?.updatedAt) continue;

        const updatedAt = new Date(p.updatedAt);
        if (updatedAt < startOfDay || updatedAt > endOfDay) continue;

        const previousReceived =
          i > 0 ? Number(history[i - 1].received || 0) : 0;

        const currentReceived = Number(p.received || 0);

        const amountUpdated =
          i === 0 ? currentReceived : currentReceived - previousReceived;

        const assigner =
          p.assignerName || task.assignerName || "Unknown";

        paymentsToday.push({
          paymentId: `${task.id}_${updatedAt.getTime()}`,
          taskId: task.id,
          taskTitle: task.title,
          assignerName: assigner,

          received: currentReceived,     // total till now
          amountUpdated,                 // 🔥 change only

          updatedAt,
          updatedBy: p.updatedBy || "Unknown",
          fileUrl: p.fileUrl || null,
        });

        // ✅ assigner-wise total
        summaryByAssigner[assigner] =
          (summaryByAssigner[assigner] || 0) + amountUpdated;

        // ✅ overall total updated
        totalUpdatedAmount += amountUpdated;
      }
    }

    return NextResponse.json({
      date: startOfDay.toISOString().slice(0, 10),
      paymentsToday,
      summaryByAssigner,
      totalUpdatedAmount, // 🔥 SEND TO FRONTEND
    });
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
