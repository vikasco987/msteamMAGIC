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

        const where: any = {
            createdAt: { gte: start, lte: end }
        };

        if (!isPrivileged) {
            where.createdById = { in: [userId, ...teamMemberIds] };
        }

        // 🛡️ MANUAL DATE PARITY BOOST
        // Fetch Internal Values for 'Calling Date' or 'Interaction Date' columns for today
        const internalCols = await prisma.internalColumn.findMany({
            where: { label: { contains: "Calling", mode: 'insensitive' } } // Target calling date columns
        });
        const colIds = internalCols.map(c => c.id);

        // 🛡️ BATTLE-TESTED PERFORMANCE ENGINES
        const [remarks, manualDates] = await Promise.all([
            prisma.formRemark.findMany({ 
                where: { createdAt: { gte: start, lte: end } }
            }),
            prisma.internalValue.findMany({
                where: {
                    columnId: { in: colIds },
                    value: { gte: start.toISOString(), lte: end.toISOString() }
                },
                include: { response: true }
            })
        ]);

        console.log(`Report API: Found ${remarks.length} remarks and ${manualDates.length} manual schedule matches.`);

        // Target valid call statuses (EXHAUSTIVE LIST for JS Filtering)
        const targetStatuses = [
            "CALL AGAIN", "CALL DONE", "RNR", "INVALID NUMBER", "SWITCH OFF", "RNR 2", "RNR3", "INCOMING NOT AVAIABLE", "MEETING", "DUPLICATE", "WRONG NUMBER",
            "CALLED", "NOT INTERESTED", "WALKED IN", "FOLLOW-UP DONE", "MISSED", "CLOSED", "WALK-IN SCHEDULED",
            "INTERESTED", "BUSY", "CONNECTED", "ONBOARDED", "ONBOARDING", "PAYMENT PENDING", "FOLLOW UP", "SCHEDULED", "REJECTED"
        ];

        // Categorize interactions (Master Taxonomy Sync)
        const connectedStatuses = [
            "CALL DONE", "CALL AGAIN", "MEETING", "DUPLICATE", "CONNECTED", "INTERESTED", "BUSY",
            "Call Again", "Call done", "Not interested", "Walk-in scheduled", "Closed", "Follow up done", "Called", "Scheduled", "Follow-up Done", "Walked In",
            "ONBOARDED", "ONBOARDING", "PAYMENT PENDING", "FOLLOW-UP DONE", "WALKED IN"
        ];
        const notConnectedStatuses = [
            "RNR", "RNR 2", "RNR3", "SWITCH OFF", "INVALID NUMBER", "INCOMING NOT AVAIABLE", "WRONG NUMBER", "REJECTED",
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
        const processedResponseIds = new Set<string>(); // 🛡️ GLOBAL INTERACTION REGISTRY

        // 🛡️ STAFF RESOLUTION LAYER: Get all users to map Clerk IDs to Names for manual branches
        const allUsers = await prisma.user.findMany({
            select: { clerkId: true, name: true, email: true }
        });
        const userNameMap = new Map<string, { name: string, email: string }>();
        allUsers.forEach(u => userNameMap.set(u.clerkId, { name: u.name || "Unknown", email: u.email || "" }));

        // 🟢 BRANCH 1: Process System Remarks (Actual Interactions)
        for (const r of remarks) {
            const userId = r.createdById || r.authorEmail || r.authorName || "Unknown";
            const responseId = r.responseId;
            
            processedResponseIds.add(responseId); // Mark as interacted today

            if (!userStatsMap.has(userId)) {
                userStatsMap.set(userId, {
                    name: r.authorName || userNameMap.get(r.createdById!)?.name || "Unknown User",
                    email: r.authorEmail || userNameMap.get(r.createdById!)?.email || "",
                    leadsContacted: new Map()
                });
            }

            const userStats = userStatsMap.get(userId)!;
            
            if (!userStats.leadsContacted.has(responseId)) {
                userStats.leadsContacted.set(responseId, {
                    type: r.columnId ? 'NEW' : 'FOLLOWUP',
                    connected: false,
                    notConnected: false
                });
            }

            const inter = userStats.leadsContacted.get(responseId)!;
            if (r.columnId) inter.type = 'NEW';

            const statusRaw = (r.followUpStatus || "").trim().toUpperCase();
            if (connectedStatuses.some(s => s.trim().toUpperCase() === statusRaw)) {
                inter.connected = true;
            } else if (notConnectedStatuses.some(s => s.trim().toUpperCase() === statusRaw)) {
                inter.notConnected = true;
            }
        }

        // 🔵 BRANCH 2: Process Manual Schedules (Assignment Perspective)
        for (const m of manualDates) {
            const responseId = m.responseId;
            
            // 🛡️ BRANCH SHIELD: If this lead was ALREADY remarked by anyone today, 
            // Branch 1 has already given credit to the actual caller. Skip the owner.
            if (processedResponseIds.has(responseId)) continue; 

            const assignedUserIds = m.response.assignedTo || [];
            if (assignedUserIds.length === 0) continue;

            // REASSIGNMENT FIX: Only the LATEST person in the assignment array is the "Active Owner".
            const targetUid = assignedUserIds[assignedUserIds.length - 1];
            const identity = userNameMap.get(targetUid);
            
            const userId = targetUid; 

            if (!userStatsMap.has(userId)) {
                userStatsMap.set(userId, {
                    name: identity?.name || "Assigned User",
                    email: identity?.email || "",
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
