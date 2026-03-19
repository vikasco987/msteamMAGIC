import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nowIST = moment().tz("Asia/Kolkata");
    const startOfDay = nowIST.clone().startOf("day").toDate();
    const endOfDay = nowIST.clone().endOf("day").toDate();

    // Fetch all attendance for today using the same logic as the main logs
    const records = await prisma.attendance.findMany({
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
        userId: true
      },
      orderBy: { checkIn: "asc" }
    });

    const early: string[] = [];
    const late: { name: string, latenessStr: string, minutesTotal: number }[] = [];

    records.forEach(r => {
      if (!r.checkIn) return;
      
      const actualCheckIn = moment(r.checkIn).tz("Asia/Kolkata");
      const officeStart = actualCheckIn.clone().hour(10).minute(0).second(0).millisecond(0);
      
      const diffMins = Math.floor(moment.duration(actualCheckIn.diff(officeStart)).asMinutes());
      
      const name = r.employeeName || "Unknown User";

      if (diffMins <= 0) {
        early.push(name);
      } else {
        // Format to match AttendanceTable.tsx
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        let latenessStr = "";
        if (hrs && mins) latenessStr = `${hrs} hr ${mins} min`;
        else if (hrs) latenessStr = `${hrs} hr`;
        else if (mins) latenessStr = `${mins} min`;
        else latenessStr = "Late";

        late.push({
          name,
          latenessStr,
          minutesTotal: diffMins
        });
      }
    });

    // Deduplicate late users (keeping their earliest late check-in)
    const uniqueLateMap = new Map<string, typeof late[0]>();
    late.forEach(l => {
      if (!uniqueLateMap.has(l.name) || l.minutesTotal < uniqueLateMap.get(l.name)!.minutesTotal) {
        uniqueLateMap.set(l.name, l);
      }
    });

    return NextResponse.json({
      early: Array.from(new Set(early)),
      late: Array.from(uniqueLateMap.values()).map(({ name, latenessStr }) => ({ name, latenessStr }))
    });
  } catch (err) {
    console.error("Ticker fetch error:", err);
    return NextResponse.json({ early: [], late: [] }, { status: 500 });
  }
}
