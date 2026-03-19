import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nowIST = moment().tz("Asia/Kolkata");
    const startOfDay = nowIST.clone().startOf("day").toDate();
    const endOfDay = nowIST.clone().endOf("day").toDate();

    // 1. Fetch ALL active users from the system
    const allUsers = await prisma.user.findMany({
      select: { clerkId: true, name: true }
    });

    // 2. Fetch all attendance logs for today
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          { checkIn: { gte: startOfDay, lte: endOfDay } }
        ]
      },
      select: {
        employeeName: true,
        checkIn: true,
        status: true,
        userId: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    const earlyMap = new Map<string, string>();
    const lateMap = new Map<string, { name: string, latenessStr: string, minutesTotal: number }>();
    const presentUserIds = new Set<string>();

    // 3. Process existing logs
    attendanceRecords.forEach(r => {
      if (earlyMap.has(r.userId) || lateMap.has(r.userId)) return;
      
      const name = r.employeeName || "Unknown User";

      if (r.status === "Absent") {
          lateMap.set(r.userId, { name, latenessStr: "ABSENT", minutesTotal: 9999 });
          presentUserIds.add(r.userId); // They are "accounted for"
          return;
      }

      if (!r.checkIn) return;
      
      presentUserIds.add(r.userId);
      const actualCheckIn = moment(r.checkIn).tz("Asia/Kolkata");
      const officeStart = actualCheckIn.clone().hour(10).minute(0).second(0).millisecond(0);
      
      const diffMins = Math.floor(moment.duration(actualCheckIn.diff(officeStart)).asMinutes());

      if (diffMins <= 0) {
        earlyMap.set(r.userId, name);
      } else {
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        let latenessStr = "";
        if (hrs && mins) latenessStr = `${hrs} hr ${mins} min`;
        else if (hrs) latenessStr = `${hrs} hr`;
        else if (mins) latenessStr = `${mins} min`;
        else latenessStr = "Late";

        lateMap.set(r.userId, { name, latenessStr, minutesTotal: diffMins });
      }
    });

    // 4. Identify users who have NOT checked in at all
    allUsers.forEach(u => {
      if (!presentUserIds.has(u.clerkId)) {
        lateMap.set(u.clerkId, { 
          name: u.name || "Unknown User", 
          latenessStr: "ABSENT", 
          minutesTotal: 9999 
        });
      }
    });

    return NextResponse.json({
      date: nowIST.format("DD MMM YYYY"),
      early: Array.from(earlyMap.values()),
      late: Array.from(lateMap.values()).map(({ name, latenessStr }) => ({ name, latenessStr }))
    });
  } catch (err) {
    console.error("Ticker fetch error:", err);
    return NextResponse.json({ early: [], late: [] }, { status: 500 });
  }
}
