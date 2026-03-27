import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const metaRole = (user?.publicMetadata?.role as string || "user").toUpperCase();
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        const dbRole = (dbUser?.role || "GUEST").toUpperCase();
        const userRole = (metaRole || dbRole).toUpperCase();
        const isMasterOfAll = userRole === "MASTER" || dbRole === "MASTER";
        const isAdminBuilder = userRole === "ADMIN" || dbRole === "ADMIN" || userRole === "TL" || dbRole === "TL";

        let whereClause = {};
        if (!isMasterOfAll) {
            whereClause = {
                OR: [
                    { visibleToRoles: { has: userRole } },
                    { visibleToRoles: { has: dbRole } },
                    { visibleToUsers: { has: userId } },
                    { createdBy: userId },
                    { responses: { some: { assignedTo: { has: userId } } } }
                ]
            };
        }

        const forms = await prisma.dynamicForm.findMany({
            where: whereClause,
            include: {
                _count: { select: { responses: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        // 🏎️ FAST MAPPING: Use our own DB instead of Clerk API
        const allUserIds = Array.from(new Set(forms.flatMap(f => f.visibleToUsers || [])));
        const usersMap: Record<string, { email: string; name: string; imageUrl: string }> = {};

        if (allUserIds.length > 0) {
            const dbUsers = await prisma.user.findMany({
                where: { clerkId: { in: allUserIds } },
                select: { clerkId: true, email: true, name: true }
            });

            dbUsers.forEach(u => {
                usersMap[u.clerkId] = {
                    email: u.email || "Unknown",
                    name: u.name || "System User",
                    imageUrl: "" // Image not in DB usually, fallback to avatar UI
                };
            });

            // 🕒 Only fetch from Clerk if strictly necessary and IDs are missing from DB
            const missingIds = allUserIds.filter(id => !usersMap[id]);
            if (missingIds.length > 0) {
                try {
                    const clerk = await clerkClient();
                    const usersList = await clerk.users.getUserList({ userId: missingIds, limit: 100 });
                    usersList.data.forEach(u => {
                        usersMap[u.id] = {
                            email: u.emailAddresses[0]?.emailAddress || "Unknown",
                            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
                            imageUrl: u.imageUrl || ""
                        };
                    });
                } catch (err) {
                    console.error("Clerk fallback mapping skipped:", err);
                }
            }
        }

        const enrichedForms = forms.map(f => ({
            ...f,
            visibleToUsersData: (f.visibleToUsers || []).map(uid => ({
                id: uid,
                ...(usersMap[uid] || { email: "External", name: "Guest User", imageUrl: "" })
            }))
        }));

        return NextResponse.json({
            forms: enrichedForms,
            userRole,
            isMaster: isMasterOfAll || isAdminBuilder,
            isPureMaster: isMasterOfAll
        });

    } catch (error) {
        console.error("GET Forms Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { title, fields, internalColumns, visibleToRoles, visibleToUsers } = await req.json();

        const form = await prisma.dynamicForm.create({
            data: {
                title,
                createdBy: userId,
                visibleToRoles: visibleToRoles || [],
                visibleToUsers: visibleToUsers || [],
                fields: { 
                    create: (fields || []).map((f: any) => {
                        const { id, ...rest } = f; // Strip client-side ID
                        return rest;
                    }) 
                },
                internalColumns: { 
                    create: (internalColumns || []).map((c: any) => {
                        const { id, ...rest } = c; // Strip client-side ID
                        return rest;
                    }) 
                }
            }
        });

        return NextResponse.json(form);
    } catch (error) {
        console.error("POST Forms Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
