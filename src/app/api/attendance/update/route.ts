import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch role from Clerk
    const client = await clerkClient();
    const adminUser = await client.users.getUser(userId);
    const role = adminUser.publicMetadata?.role as string;

    // Only ADMIN or MASTER can update
    if (role !== "ADMIN" && role !== "MASTER") {
      return NextResponse.json({ error: "Admin/Master access only" }, { status: 403 });
    }

    const body = await req.json();
    const {
      attendanceId, // the _id of the record to update
      checkIn,
      checkOut,
      checkInReason,
      checkOutReason,
      status,
      verified,
      remarks,
    } = body;

    if (!attendanceId) {
      return NextResponse.json({ error: "attendanceId is required" }, { status: 400 });
    }

    // Safety check
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
      return NextResponse.json({ error: "Check-out cannot be before check-in" }, { status: 400 });
    }

    const updateData: any = {};
    if (checkIn !== undefined) updateData.checkIn = checkIn ? new Date(checkIn) : null;
    if (checkOut !== undefined) updateData.checkOut = checkOut ? new Date(checkOut) : null;
    if (checkInReason !== undefined) updateData.checkInReason = checkInReason || null;
    if (checkOutReason !== undefined) updateData.checkOutReason = checkOutReason || null;
    if (status !== undefined) updateData.status = status || null;
    if (verified !== undefined) updateData.verified = Boolean(verified);
    if (remarks !== undefined) updateData.remarks = remarks || null;

    const attendance = await (prisma as any).attendance.update({
      where: { id: attendanceId },
      data: updateData,
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("❌ Attendance update failed:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
