import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nowIST = moment().tz("Asia/Kolkata");
    const startIST = nowIST.clone().startOf("day");
    const endIST = nowIST.clone().endOf("day");

    // Fetch all attendance for today
    // We'll check both 'date' (normalized day) and 'checkIn' (actual timestamp)
    const records = await prisma.attendance.findMany({
      where: {
        OR: [
          { date: { gte: startIST.clone().utc().toDate(), lte: endIST.clone().utc().toDate() } },
          { checkIn: { gte: startIST.clone().utc().toDate(), lte: endIST.clone().utc().toDate() } }
        ]
      },
      select: {
        employeeName: true,
        checkIn: true,
        status: true
      },
      orderBy: { checkIn: "asc" }
    });

    const early: string[] = [];
    const late: { name: string, minutesLate: number }[] = [];

    records.forEach(r => {
      if (!r.checkIn) return;
      
      const checkInIST = moment(r.checkIn).tz("Asia/Kolkata");
      const threshold = checkInIST.clone().hour(10).minute(0).second(0);
      
      const diffMinutes = Math.floor(moment.duration(checkInIST.diff(threshold)).asMinutes());
      
      if (diffMinutes <= 0) {
        early.push(r.employeeName || "Unknown User");
      } else {
        late.push({
          name: r.employeeName || "Unknown User",
          minutesLate: diffMinutes
        });
      }
    });

    // Deduplicate late users (taking their earliest late check-in)
    const uniqueLateMap = new Map<string, number>();
    late.forEach(l => {
      if (!uniqueLateMap.has(l.name) || l.minutesLate < uniqueLateMap.get(l.name)!) {
        uniqueLateMap.set(l.name, l.minutesLate);
      }
    });

    return NextResponse.json({
      early: Array.from(new Set(early)), // Unique early names
      late: Array.from(uniqueLateMap.entries()).map(([name, minutesLate]) => ({ name, minutesLate }))
    });
  } catch (err) {
    console.error("Ticker fetch error:", err);
    return NextResponse.json({ early: [], late: [] }, { status: 500 });
  }
}
