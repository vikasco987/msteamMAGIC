import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nowIST = moment().tz("Asia/Kolkata");
    const startOfDay = nowIST.clone().startOf("day").toDate();
    const endOfDay = nowIST.clone().endOf("day").toDate();

    // Fetch all attendance for today, excluding 'Absent' status
    const records = await prisma.attendance.findMany({
      where: {
        AND: [
          { status: { not: "Absent" } },
          {
            OR: [
              { date: { gte: startOfDay, lte: endOfDay } },
              { checkIn: { gte: startOfDay, lte: endOfDay } }
            ]
          }
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

    records.forEach(r => {
      if (!r.checkIn) return;
      if (earlyMap.has(r.userId) || lateMap.has(r.userId)) return;
      
      const actualCheckIn = moment(r.checkIn).tz("Asia/Kolkata");
      const officeStart = actualCheckIn.clone().hour(10).minute(0).second(0).millisecond(0);
      
      const diffMins = Math.floor(moment.duration(actualCheckIn.diff(officeStart)).asMinutes());
      const name = r.employeeName || "Unknown User";

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
