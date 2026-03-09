import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // Use requested date or today
        const targetDate = dateParam ? dayjs(dateParam).toDate() : new Date();
        const startOfDay = dayjs(targetDate).startOf("day").toDate();
        const endOfDay = dayjs(targetDate).endOf("day").toDate();

        // Target valid call statuses
        const targetStatuses = [
            "Called",
            "Call Again",
            "Call done",
            "Not interested",
            "RNR",
            "RNR2 (Checked)",
            "RNR3",
            "Switch off",
            "Invalid Number"
        ];

        const remarks = await prisma.formRemark.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                followUpStatus: {
                    in: targetStatuses
                }
            },
            select: {
                authorName: true,
                authorEmail: true,
                createdById: true,
                responseId: true
            }
        });

        // Group by User
        // 1 row = 1 call max per user. If a user made 10 remarks on the same response in a single day, it's 1 call.
        
        type UserStats = {
            id: string;
            name: string;
            email: string;
            uniqueResponses: Set<string>;
        };

        const userMap = new Map<string, UserStats>();

        for (const r of remarks) {
            const userId = r.createdById || r.authorEmail || r.authorName || "Unknown";
            
            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    id: userId,
                    name: r.authorName || "Unknown User",
                    email: r.authorEmail || "",
                    uniqueResponses: new Set<string>()
                });
            }

            // Ensure unique responses only
            userMap.get(userId)!.uniqueResponses.add(r.responseId);
        }

        const report = Array.from(userMap.values()).map(u => ({
            userId: u.id,
            name: u.name,
            email: u.email,
            callCount: u.uniqueResponses.size
        }));

        // Sort by highest call count
        report.sort((a, b) => b.callCount - a.callCount);

        return NextResponse.json({ report });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
