import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // Use requested date or today
        const targetDate = dateParam ? parseISO(dateParam) : new Date();
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

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
            "Invalid Number",
            "Scheduled",
            "Walked In",
            "Follow-up Done",
            "Missed",
            "Closed"
        ];

        const remarks = await prisma.formRemark.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
                followUpStatus: {
                    in: targetStatuses
                }
            },
            select: {
                authorName: true,
                authorEmail: true,
                createdById: true,
                responseId: true,
                followUpStatus: true
            }
        });

        type UserStatusMap = Map<string, { connected: boolean; notConnected: boolean }>;
        const userGroupMap = new Map<string, UserStatusMap>();

        const connectedStatuses = ["Call Again", "Call done", "Not interested", "Walk-in scheduled", "Closed", "Follow up done", "Called", "Scheduled", "Follow-up Done", "Walked In"];
        const notConnectedStatuses = ["RNR", "RNR2 (Checked)", "RNR3", "Switch off", "Invalid Number", "Missed"];

        for (const r of remarks) {
            const userId = r.createdById || r.authorEmail || r.authorName || "Unknown";
            const responseId = r.responseId;

            if (!userGroupMap.has(userId)) {
                userGroupMap.set(userId, new Map());
            }

            const responseMap = userGroupMap.get(userId)!;
            if (!responseMap.has(responseId)) {
                responseMap.set(responseId, { connected: false, notConnected: false });
            }

            const status = responseMap.get(responseId)!;
            if (connectedStatuses.includes(r.followUpStatus || "")) {
                status.connected = true;
            } else if (notConnectedStatuses.includes(r.followUpStatus || "")) {
                status.notConnected = true;
            }
        }

        const report = Array.from(userGroupMap.entries()).map(([userId, responseMap]) => {
            let totalRecords = responseMap.size;
            let connected = 0;
            let notConnected = 0;

            responseMap.forEach(s => {
                if (s.connected) connected++;
                else if (s.notConnected) notConnected++;
            });

            // Need to retrieve user name/email from the first remark found for this user
            const firstRemark = remarks.find(r => (r.createdById || r.authorEmail || r.authorName || "Unknown") === userId);

            return {
                userId,
                name: firstRemark?.authorName || "Unknown User",
                email: firstRemark?.authorEmail || "",
                callCount: totalRecords,
                connectedCount: connected,
                notConnectedCount: notConnected
            };
        });

        // Sort by highest unique call count
        report.sort((a, b) => b.callCount - a.callCount);

        return NextResponse.json({ report });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
