
// // app/api/admin/attendance/update/route.ts

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function POST(req: Request) {
//   try {
//     const { userId: adminId, sessionClaims } = auth();

//     // 🔐 Admin guard
//     if (!adminId || sessionClaims?.role !== "ADMIN") {
//       return NextResponse.json(
//         { error: "Admin access only" },
//         { status: 403 }
//       );
//     }

//     const body = await req.json();

//     const {
//       userId,       // 👤 employee id
//       date,         // 📅 YYYY-MM-DD
//       checkIn,      // ⏱ ISO string | null
//       checkOut,     // ⏱ ISO string | null
//       reason,       // optional
//       remarks,      // optional
//     } = body;

//     // 🧱 Validation
//     if (!userId || !date) {
//       return NextResponse.json(
//         { error: "userId and date are required" },
//         { status: 400 }
//       );
//     }

//     // Normalize date (important for unique constraint)
//     const attendanceDate = new Date(date);
//     attendanceDate.setHours(0, 0, 0, 0);

//     // Optional safety check: checkout after checkin
//     if (checkIn && checkOut) {
//       if (new Date(checkOut) < new Date(checkIn)) {
//         return NextResponse.json(
//           { error: "Check-out cannot be before check-in" },
//           { status: 400 }
//         );
//       }
//     }

//     // 🔄 UPSERT attendance
//     const attendance = await prisma.attendance.upsert({
//       where: {
//         userId_date: {
//           userId,
//           date: attendanceDate,
//         },
//       },
//       update: {
//         checkIn: checkIn ? new Date(checkIn) : null,
//         checkOut: checkOut ? new Date(checkOut) : null,
//         reason: reason || null,
//         remarks: remarks || null,
//       },
//       create: {
//         userId,
//         date: attendanceDate,
//         checkIn: checkIn ? new Date(checkIn) : null,
//         checkOut: checkOut ? new Date(checkOut) : null,
//         reason: reason || null,
//         remarks: remarks || null,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Attendance updated by admin",
//       attendance,
//     });
//   } catch (error) {
//     console.error("❌ Admin attendance update failed:", error);

//     return NextResponse.json(
//       { error: "Failed to update attendance" },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";

export async function POST(req: NextRequest) {
  try {
    // ✅ SAME AUTH STYLE AS WORKING FILE
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔎 Fetch admin from Clerk
    const adminUser = await users.getUser(userId);
    const role = adminUser.publicMetadata?.role;

    // 🛑 Admin guard
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access only" },
        { status: 403 }
      );
    }

    // 📦 Parse body
    const body = await req.json();
    const {
      userId: employeeId,
      date,
      checkIn,
      checkOut,
      reason,
      remarks,
    } = body;

    // 🧱 Validation
    if (!employeeId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    // 🕛 Normalize date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // ⚠️ Safety check
    if (checkIn && checkOut) {
      if (new Date(checkOut) < new Date(checkIn)) {
        return NextResponse.json(
          { error: "Check-out cannot be before check-in" },
          { status: 400 }
        );
      }
    }

    // 🔄 UPSERT attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: employeeId,
          date: attendanceDate,
        },
      },
      update: {
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        reason: reason || null,
        remarks: remarks || null,
      },
      create: {
        userId: employeeId,
        date: attendanceDate,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        reason: reason || null,
        remarks: remarks || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance updated by admin",
      attendance,
    });

  } catch (error) {
    console.error("❌ Admin attendance update failed:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
