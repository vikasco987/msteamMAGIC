import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

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

        // Combine both sources, prioritize Admin/Master status
        const dbRole = (dbUser?.role || "GUEST").toUpperCase();
        const userRole = (metaRole || dbRole).toUpperCase();

        const isMaster = userRole === "ADMIN" || userRole === "MASTER" ||
            dbRole === "ADMIN" || dbRole === "MASTER";

        let whereClause = {};
        if (!isMaster) {
            whereClause = {
                OR: [
                    { visibleToRoles: { has: userRole } },
                    { visibleToRoles: { has: dbRole } },
                    { visibleToUsers: { has: userId } },
                    { createdBy: userId }
                ]
            };
        }

        const forms = await prisma.dynamicForm.findMany({
            where: whereClause,
            include: { _count: { select: { responses: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            forms,
            userRole,
            isMaster
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
