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

        // Get role from Clerk Metadata
        const metaRole = (user?.publicMetadata?.role as string || "user").toUpperCase();

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        // Resolve precise roles
        const dbRole = (dbUser?.role || "GUEST").toUpperCase();
        const userRole = (metaRole || dbRole).toUpperCase();

        // Master sees EVERYTHING
        const isMasterOfAll = userRole === "MASTER" || dbRole === "MASTER";

        // Admin is authorized to build but only sees what's shared or created by them
        const isAdminBuilder = userRole === "ADMIN" || dbRole === "ADMIN";

        let whereClause = {};
        if (!isMasterOfAll) {
            // Non-Master users see:
            // 1. Forms where their role is in visibleToRoles
            // 2. Forms where their ID is in visibleToUsers
            // 3. Forms they created
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

        // Resolve user data for UI mapping
        const allUserIds = Array.from(new Set(forms.flatMap(f => f.visibleToUsers)));
        const usersMap: Record<string, { email: string; name: string; imageUrl: string }> = {};

        if (allUserIds.length > 0) {
            try {
                const clerk = await clerkClient();
                const usersList = await clerk.users.getUserList({ userId: allUserIds, limit: 100 });
                usersList.data.forEach(u => {
                    usersMap[u.id] = {
                        email: u.emailAddresses[0]?.emailAddress || "Unknown",
                        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
                        imageUrl: u.imageUrl || ""
                    };
                });
            } catch (err) {
                console.error("Clerk fetch users mapping error:", err);
            }
        }

        const enrichedForms = forms.map(f => ({
            ...f,
            visibleToUsersData: f.visibleToUsers.map(uid => ({
                id: uid,
                ...(usersMap[uid] || { email: "Unknown", name: "User", imageUrl: "" })
            }))
        }));

        return NextResponse.json({
            forms: enrichedForms,
            userRole,
            isMaster: isMasterOfAll || isAdminBuilder, // This is for frontend to show "Build New" button
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
        const user = await currentUser();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get role and handle authorization
        const metaRole = (user?.publicMetadata?.role as string || "user").toUpperCase();

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });
        const dbRole = (dbUser?.role || "GUEST").toUpperCase();

        const isAuthorized = metaRole === "ADMIN" || metaRole === "MASTER" ||
            dbRole === "ADMIN" || dbRole === "MASTER";

        console.log(`🔐 Authorization Check: User=${userId}, Meta=${metaRole}, DB=${dbRole}, Auth=${isAuthorized}`);

        if (!isAuthorized) {
            return NextResponse.json({
                error: "Forbidden: Only Admin/Master can build forms",
                debug: { metaRole, dbRole, userId }
            }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, fields, visibleToRoles = [], visibleToUsers = [] } = body;

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        const form = await prisma.dynamicForm.create({
            data: {
                title,
                description,
                createdBy: userId,
                createdByName: user?.fullName || user?.firstName || "Unknown",
                visibleToRoles,
                visibleToUsers,
                fields: {
                    create: (fields || []).map((f: any, index: number) => ({
                        label: f.label,
                        type: f.type,
                        placeholder: f.placeholder,
                        required: f.required || false,
                        options: f.options || [],
                        order: index
                    }))
                }
            },
            include: { fields: true }
        });

        return NextResponse.json({ form });
    } catch (error) {
        console.error("POST Form Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
