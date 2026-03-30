import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUserForRole = await client.users.getUser(userId);
        const metadataRole = (clerkUserForRole.publicMetadata as any)?.role || (clerkUserForRole.privateMetadata as any)?.role;
        const userRole = String(metadataRole || dbUser?.role || "USER").toUpperCase();
        
        const isTL = (dbUser as any)?.isTeamLeader || userRole === "TL";
        const isPrivileged = userRole === "ADMIN" || userRole === "MASTER";

        let teamMemberIds: string[] = [];
        if (isTL) {
            const members = await prisma.user.findMany({
                where: { leaderId: userId } as any,
                select: { clerkId: true }
            });
            teamMemberIds = members.map(m => m.clerkId);
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // Use requested date or today
        const targetDate = dateParam ? parseISO(dateParam) : new Date();
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // Target valid call statuses
        const targetStatuses = [
            "CALL AGAIN", "CALL DONE", "RNR", "INVALID NUMBER", "SWITCH OFF", "RNR 2", "RNR3", "INCOMING NOT AVAIABLE", "MEETING", "DUPLICATE", "WRONG NUMBER",
            "Called", "Call Again", "Call done", "Not interested", "Walked In", "Follow-up Done", "Missed", "Closed", "Walk-in scheduled"
        ];

        const where: any = {
            createdAt: { gte: start, lte: end },
            followUpStatus: { in: targetStatuses }
        };

        if (!isPrivileged) {
            where.createdById = { in: [userId, ...teamMemberIds] };
        }

        const remarks = await (prisma as any).formRemark.findMany({
            where: where
        });

        console.log(`Report API: Found ${remarks.length} remarks for ${targetDate.toISOString()}`);

        // Categorize interactions
        const connectedStatuses = [
            "CALL DONE", "CALL AGAIN", "MEETING", "DUPLICATE",
            "Call Again", "Call done", "Not interested", "Walk-in scheduled", "Closed", "Follow up done", "Called", "Scheduled", "Follow-up Done", "Walked In"
        ];
        const notConnectedStatuses = [
            "RNR", "RNR 2", "RNR3", "SWITCH OFF", "INVALID NUMBER", "INCOMING NOT AVAIABLE", "WRONG NUMBER",
            "RNR", "RNR2 (Checked)", "RNR3", "Switch off", "Invalid Number", "Missed"
        ];

        type Interaction = {
            type: 'NEW' | 'FOLLOWUP';
            connected: boolean;
            notConnected: boolean;
        };

        type UserStats = {
            name: string;
            email: string;
            leadsContacted: Map<string, Interaction>;
        };

        const userStatsMap = new Map<string, UserStats>();

        for (const r of remarks) {
            const userId = r.createdById || r.authorEmail || r.authorName || "Unknown";
            const responseId = r.responseId;

            if (!userStatsMap.has(userId)) {
                userStatsMap.set(userId, {
                    name: r.authorName || "Unknown User",
                    email: r.authorEmail || "",
                    leadsContacted: new Map()
                });
            }

            const userStats = userStatsMap.get(userId)!;
            
            if (!userStats.leadsContacted.has(responseId)) {
                userStats.leadsContacted.set(responseId, {
                    type: 'FOLLOWUP',
                    connected: false,
                    notConnected: false
                });
            }

            const inter = userStats.leadsContacted.get(responseId)!;

            // 1. DEDUPLICATION LOGIC:
            // If interaction has ANY columnId on this day, categorize as 'NEW' (primary)
            if (r.columnId) {
                inter.type = 'NEW';
            }

            // 2. STATUS CONVERSION (Case-Insensitive Normalization):
            const statusRaw = (r.followUpStatus || "").trim().toUpperCase();
            if (connectedStatuses.some(s => s.trim().toUpperCase() === statusRaw)) {
                inter.connected = true;
            } else if (notConnectedStatuses.some(s => s.trim().toUpperCase() === statusRaw)) {
                inter.notConnected = true;
            }
        }

        // Transform into the 3 report structures
        const finalResults = Array.from(userStatsMap.entries()).map(([userId, user]) => {
            const stats = {
                newCalls: { count: 0, connected: 0, notConnected: 0 },
                followUps: { count: 0, connected: 0, notConnected: 0 },
                combined: { count: 0, connected: 0, notConnected: 0 }
            };

            user.leadsContacted.forEach((inter) => {
                // Combined tracking (Every unique lead)
                stats.combined.count++;
                if (inter.connected) stats.combined.connected++;
                else if (inter.notConnected) stats.combined.notConnected++;

                // Exclusive tracking (Either New or Follow-up)
                if (inter.type === 'NEW') {
                    stats.newCalls.count++;
                    if (inter.connected) stats.newCalls.connected++;
                    else if (inter.notConnected) stats.newCalls.notConnected++;
                } else {
                    stats.followUps.count++;
                    if (inter.connected) stats.followUps.connected++;
                    else if (inter.notConnected) stats.followUps.notConnected++;
                }
            });

            return {
                userId,
                name: user.name,
                email: user.email,
                stats
            };
        });

        const newCallReport = finalResults
            .map(r => ({
                userId: r.userId,
                name: r.name,
                email: r.email,
                callCount: r.stats.newCalls.count,
                connectedCount: r.stats.newCalls.connected,
                notConnectedCount: r.stats.newCalls.notConnected
            }))
            .filter(r => r.callCount > 0)
            .sort((a, b) => b.callCount - a.callCount);

        const followUpReport = finalResults
            .map(r => ({
                userId: r.userId,
                name: r.name,
                email: r.email,
                callCount: r.stats.followUps.count,
                connectedCount: r.stats.followUps.connected,
                notConnectedCount: r.stats.followUps.notConnected
            }))
            .filter(r => r.callCount > 0)
            .sort((a, b) => b.callCount - a.callCount);

        const combinedReport = finalResults
            .map(r => ({
                userId: r.userId,
                name: r.name,
                email: r.email,
                callCount: r.stats.combined.count,
                connectedCount: r.stats.combined.connected,
                notConnectedCount: r.stats.combined.notConnected
            }))
            .filter(r => r.callCount > 0)
            .sort((a, b) => b.callCount - a.callCount);

        return NextResponse.json({ 
            followUpReport, 
            newCallReport, 
            combinedReport,
            totalOperators: combinedReport.length
        });
    } catch (e: any) {
        console.error("Call report API error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
