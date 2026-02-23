import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";

// Match TaskTableView role logic exactly
async function getUserRole(userId: string): Promise<string | null> {
    try {
        const user = await users.getUser(userId);
        return (
            (user.publicMetadata as { role?: string })?.role ||
            (user.privateMetadata as { role?: string })?.role ||
            null
        );
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const searchTerm = searchParams.get("searchTerm") || "";
    const filterAssigner = searchParams.get("filterAssigner") || "all";
    const filterTaskStatus = searchParams.get("filterTaskStatus") || "all";
    const filterPriority = searchParams.get("filterPriority") || "all";
    const filterSource = searchParams.get("filterSource") || "all";

    const filterOutcome = searchParams.get("filterOutcome") || "all";
    const filterDate = searchParams.get("filterDate") || "all";

    try {
        const role = await getUserRole(userId);
        const isAdminOrMaster = role === "admin" || role === "master";
        const isSeller = role === "seller";

        let whereClause: any = { amount: { gt: 0 } };

        // Date Filter
        if (filterDate !== "all") {
            const now = new Date();
            let start: Date | undefined;
            if (filterDate === "today") start = new Date(now.setHours(0, 0, 0, 0));
            else if (filterDate === "yesterday") {
                start = new Date(now.setDate(now.getDate() - 1));
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                whereClause.createdAt = { gte: start, lte: end };
                start = undefined; // handled
            }
            else if (filterDate === "last_7") start = new Date(now.setDate(now.getDate() - 7));
            else if (filterDate === "this_month") start = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (filterDate === "this_year") start = new Date(now.getFullYear(), 0, 1);

            if (start) whereClause.createdAt = { gte: start };
        }

        // Outcome Filter (Check latest remark)
        if (filterOutcome !== "all") {
            whereClause.paymentRemarks = {
                some: {
                    contactOutcome: filterOutcome
                }
            };
        }

        // Role-based filtering
        if (!isAdminOrMaster) {
            if (isSeller) {
                whereClause.OR = [
                    { createdByClerkId: userId },
                    { assigneeId: userId },
                    { assigneeIds: { has: userId } }
                ];
            } else {
                return NextResponse.json({ tasks: [], summary: { totalPending: 0, taskCount: 0 }, role, pagination: { page, totalPages: 0 } });
            }
        }

        // Apply filters to whereClause
        if (searchTerm) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    OR: [
                        { title: { contains: searchTerm, mode: "insensitive" } },
                        { shopName: { contains: searchTerm, mode: "insensitive" } },
                        { customerName: { contains: searchTerm, mode: "insensitive" } },
                        { phone: { contains: searchTerm, mode: "insensitive" } },
                        { location: { contains: searchTerm, mode: "insensitive" } }
                    ]
                }
            ];
        }

        if (filterAssigner !== "all") {
            whereClause.assignerName = filterAssigner;
        }
        if (filterTaskStatus !== "all") {
            whereClause.status = filterTaskStatus;
        }
        if (filterPriority !== "all") {
            whereClause.priority = filterPriority;
        }
        if (filterSource !== "all") {
            whereClause["customFields.source"] = filterSource;
        }

        // --- AUTOMATED CHASING LOGIC (Notifications) ---
        // This runs on every dashboard fetch to ensure reminders are fresh
        try {
            // 1. Follow-ups DUE TODAY
            const dueFollowUps = await prisma.paymentRemark.findMany({
                where: {
                    nextFollowUpDate: { lte: new Date() },
                    reminderSent: false,
                    followUpStatus: { not: "completed" }
                },
                include: { task: true }
            });

            if (dueFollowUps.length > 0) {
                await Promise.all(dueFollowUps.map(async (remark) => {
                    const targets = new Set([
                        remark.task.createdByClerkId
                    ].filter(Boolean));

                    for (const tid of targets) {
                        await prisma.notification.create({
                            data: {
                                userId: tid as string,
                                type: "COLLECTION_REMINDER",
                                content: `⏰ COLLECTION DUE: ${remark.task.shopName || remark.task.title}. Follow-up was scheduled for today. Outstanding: ₹${(remark.task.amount || 0) - (remark.task.received || 0)}`,
                                taskId: remark.taskId
                            }
                        });
                    }
                    await prisma.paymentRemark.update({ where: { id: remark.id }, data: { reminderSent: true } });
                }));
            }

            // 2. IGNORED TASKS (No update in 5 days)
            // We only do this for tasks with pending > 0
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

            const ignoredTasks = await prisma.task.findMany({
                where: {
                    amount: { gt: 0 },
                    // Simplified: check if no remark exists at all OR last remark is old
                    OR: [
                        { paymentRemarks: { none: {} } },
                        { paymentRemarks: { none: { createdAt: { gte: fiveDaysAgo } } } }
                    ],
                    // Don't spam: check if we already sent an "ignored" notification recently
                    NOT: {
                        notifications: {
                            some: {
                                type: "COLLECTION_IGNORE_WARNING",
                                createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } // Only once per 24h
                            }
                        }
                    }
                },
                select: { id: true, shopName: true, title: true, createdByClerkId: true }
            });

            if (ignoredTasks.length > 0) {
                await Promise.all(ignoredTasks.map(async (t) => {
                    const targets = new Set([t.createdByClerkId].filter(Boolean));
                    for (const tid of targets) {
                        await prisma.notification.create({
                            data: {
                                userId: tid as string,
                                type: "COLLECTION_IGNORE_WARNING",
                                content: `🚨 IGNORED COLLECTION: ${t.shopName || t.title} has not been updated in over 5 days. Please follow up immediately.`,
                                taskId: t.id
                            }
                        });
                    }
                }));
            }
        } catch (remErr) {
            console.warn("Automated chasing error:", remErr);
        }
        // --- END AUTOMATED CHASING ---

        // We still need the global summary for the dashboard cards
        // This is the part that might be slow if there are 10k tasks
        // But we only fetch IDs/Amounts for calculation
        const allPendingTasks = await prisma.task.findMany({
            where: whereClause,
            select: { amount: true, received: true }
        });

        const pendingList = allPendingTasks.filter(t => (t.amount || 0) - (t.received || 0) > 0);
        const totalPendingAmount = pendingList.reduce((sum, t) => sum + ((t.amount || 0) - (t.received || 0)), 0);
        const totalTaskCount = pendingList.length;

        // Fetch paginated tasks
        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                paymentRemarks: { orderBy: { createdAt: "desc" }, take: 5 },
                activities: { where: { type: "PAYMENT_ADDED" }, orderBy: { createdAt: "desc" }, take: 5 }
            },
            orderBy: { createdAt: "desc" },
            // Note: DB-level pagination might include tasks with pending=0. 
            // We increase limit slightly to compensate or eventually filter in app.
            // For now, let's keep it simple with skip/take on the amount>0 subset.
            skip: skip,
            take: limit
        });

        const recoveryTasks = tasks.map(task => {
            const total = task.amount ?? 0;
            const received = task.received ?? 0;
            const pending = total - received;
            return {
                id: task.id,
                title: task.title,
                shopName: task.shopName,
                customerName: task.customerName,
                phone: task.phone,
                location: task.location,
                email: task.email,
                assigneeName: task.assigneeName,
                assignerName: task.assignerName || task.createdByName || "Admin",
                createdByClerkId: task.createdByClerkId,
                status: task.status,
                priority: task.priority,
                total,
                received,
                pending,
                latestRemark: task.paymentRemarks[0] || null,
                allRemarks: task.paymentRemarks,
                activities: task.activities,
                createdAt: task.createdAt,
                dueDate: task.dueDate,
                customFields: task.customFields,
            };
        }).filter(t => t.pending > 0);

        return NextResponse.json({
            tasks: recoveryTasks,
            role,
            summary: {
                totalPending: totalPendingAmount,
                taskCount: totalTaskCount
            },
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalTaskCount / limit),
                totalItems: totalTaskCount
            }
        });

    } catch (error) {
        console.error("Recovery API Error:", error);
        return NextResponse.json({ error: "Failed to fetch recovery data" }, { status: 500 });
    }
}
