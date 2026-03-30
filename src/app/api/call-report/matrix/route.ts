import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, parseISO, startOfWeek, endOfWeek } from "date-fns";

const MARKETING_FORM_ID = "69b8f819a8a6f09fd11148c7";

export async function GET(req: Request) {
    try {
        const { userId: authUserId } = await auth();
        if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const startParam = searchParams.get("start");
        const endParam = searchParams.get("end");
        const rangeType = searchParams.get("range") || "TODAY";

        let start: Date;
        let end: Date;

        if (rangeType === "TODAY") {
            start = startOfDay(new Date());
            end = endOfDay(new Date());
        } else if (rangeType === "WEEK") {
            start = startOfWeek(new Date(), { weekStartsOn: 1 });
            end = endOfWeek(new Date(), { weekStartsOn: 1 });
        } else if (startParam && endParam) {
            start = startOfDay(parseISO(startParam));
            end = endOfDay(parseISO(endParam));
        } else {
            start = startOfDay(new Date());
            end = endOfDay(new Date());
        }

        // 1. Fetch Users (Staff)
        const staff = await prisma.user.findMany({
            where: { role: { in: ["USER", "TL", "ADMIN", "MASTER", "SELLER", "INTERN", "GUEST", "MANAGER"] } },
            select: { clerkId: true, name: true, email: true }
        });

        // 2. Fetch Follow-up Column
        const followUpCol = await prisma.internalColumn.findFirst({
            where: { formId: MARKETING_FORM_ID, label: { contains: "Follow UP Date", mode: 'insensitive' } }
        });

        // 3. BULK QUERIES (OPTIMIZED CROSS-MODEL)
        const [remarkStats, responsesData, tasksData] = await Promise.all([
            // Remark stats for Today
            prisma.formRemark.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: { createdById: true, followUpStatus: true, responseId: true, columnId: true }
            }),
            // Responses for Activity & Assignment
            prisma.formResponse.findMany({
                where: { formId: MARKETING_FORM_ID },
                select: { id: true, assignedTo: true, submittedBy: true, submittedAt: true, remarks: { take: 1 } }
            }),
            // Task Board Data
            prisma.task.findMany({
                select: { id: true, assigneeIds: true, status: true, isHidden: true }
            })
        ]);

        // 4. Follow-up & Status Processing (GLOBAL)
        const leadsWithStatusUpdates = new Set<string>();
        const followUpResponseIds = new Set<string>();
        
        const allInternalVals = await prisma.internalValue.findMany({
            where: { response: { formId: MARKETING_FORM_ID } },
            select: { responseId: true, columnId: true, value: true }
        });

        allInternalVals.forEach(v => {
            if (v.value && v.value.trim() !== "") {
                leadsWithStatusUpdates.add(v.responseId);
                
                // Specifically check for followups within target range
                if (followUpCol && v.columnId === followUpCol.id) {
                    try {
                        const d = new Date(v.value);
                        if (d >= start && d <= end) followUpResponseIds.add(v.responseId);
                    } catch {}
                }
            }
        });

        // 5. Normalization Maps (Master CRM Integration)
        const connectedStatuses = [
            "CALL DONE", "CALL AGAIN", "MEETING", "DUPLICATE", "CLOSED", "SCHEDULED", "WALK-IN SCHEDULED", 
            "ONBOARDING", "CONNECTED", "FOLLOW-UP DONE", "INTERESTED", "BUSY", "PAYMENT PENDING", "WALKED IN"
        ];
        const salesStatuses = ["CLOSED", "SALES", "PAID", "ONBOARDING", "ONBOARDED", "DEPOSIT RECEIVED", "PAYMENT DONE"];
        const onbStatuses = ["ONBOARDING", "ONBOARDED", "WALK-IN DONE"];

        // 6. Map Everything per User
        const report = staff.map(user => {
            const uid = user.clerkId;
            
            // PILLAR 1: RED (Assignment & Followups)
            const userLeads = responsesData.filter(r => {
                // ACTIVE OWNERSHIP LOGIC: The lead belongs to the LATEST assignee (last index) 
                // OR the Submitter (only if no active assignment exists).
                const activeAssignee = r.assignedTo.length > 0 ? r.assignedTo[r.assignedTo.length - 1] : null;
                const isCurrentOwner = activeAssignee === uid;
                
                const isSubmitter = r.submittedBy === uid;
                const hasNoAssignment = r.assignedTo.length === 0;

                return isCurrentOwner || (isSubmitter && hasNoAssignment);
            });

            const untouchedCount = userLeads.filter(r => {
                const hasRemarks = r.remarks && r.remarks.length > 0;
                const hasStatus = leadsWithStatusUpdates.has(r.id);
                return !hasRemarks && !hasStatus;
            }).length;

            const pendingCount = userLeads.filter(r => followUpResponseIds.has(r.id)).length;

                // PILLAR 2: GREEN (Daily Engagement Funnels)
                const userCreatedTodayCount = responsesData.filter(r => r.submittedBy === uid && r.submittedAt >= start && r.submittedAt <= end).length;
                const userAssignLeadsTodayCount = userLeads.filter(r => r.submittedAt >= start && r.submittedAt <= end).length;
                
                const userRemarks = remarkStats.filter(r => r.createdById === uid);
                const totalReachout = new Set(userRemarks.map(r => r.responseId)).size;
                
                const connectedRemarks = userRemarks.filter(r => connectedStatuses.includes((r.followUpStatus || "").toUpperCase()));
                const totalConnected = connectedRemarks.length;

                const newCallRemarks = userRemarks.filter(r => r.columnId); // columnId indicates primary status change
                const newReachoutTotal = new Set(newCallRemarks.map(r => r.responseId)).size;
                const newConnectedTotal = newCallRemarks.filter(r => connectedStatuses.includes((r.followUpStatus || "").toUpperCase())).length;

                const followupRemarks = userRemarks.filter(r => !r.columnId);
                const followupCallTotal = followupRemarks.length;
                const followupConnectedTotal = followupRemarks.filter(r => connectedStatuses.includes((r.followUpStatus || "").toUpperCase())).length;

                const onbTotal = userRemarks.filter(r => onbStatuses.includes((r.followUpStatus || "").toUpperCase())).length;
                const salesTotal = userRemarks.filter(r => salesStatuses.includes((r.followUpStatus || "").toUpperCase())).length;

                // PILLAR 3: ORANGE (Task / Team Board)
                const userTasks = tasksData.filter(t => !t.isHidden && (t.assigneeIds as any[]).includes(uid));
                const todoTotal = userTasks.filter(t => t.status === "PENDING" || t.status === "TODO").length;
                const progressTotal = userTasks.filter(t => t.status === "ACTIVE" || t.status === "IN_PROGRESS").length;
                const paymentPendingTotal = userTasks.filter(t => t.status === "PAYMENT_PENDING").length;
                const paymentDoneTotal = userTasks.filter(t => t.status === "COMPLETED" || t.status === "DONE").length;

                return {
                    userId: uid,
                    name: user.name || user.email.split('@')[0],
                    // RED
                    untouched: untouchedCount,
                    pending: pendingCount,
                    // GREEN
                    created: userAssignLeadsTodayCount, // Already handled Assigned leads created today
                    submissionsFilled: userCreatedTodayCount, // NEW: Direct Form Fillings
                    reachout: totalReachout,
                    connected: totalConnected,
                    newReachout: newReachoutTotal,
                    newConnected: newConnectedTotal,
                    followupCalls: followupCallTotal,
                    followupConnected: followupConnectedTotal,
                    onboarding: onbTotal,
                    sales: salesTotal,
                    // ORANGE
                    todo: todoTotal,
                    progress: progressTotal,
                    paymentPending: paymentPendingTotal,
                    paymentDone: paymentDoneTotal,
                    // Combined for header
                    assigned: userLeads.length
                };
            });

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error("Matrix API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
