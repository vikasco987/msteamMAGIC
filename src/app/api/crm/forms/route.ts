import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        const userRole = (dbUser?.role || "GUEST").toUpperCase();
        const isMaster = userRole === "ADMIN" || userRole === "MASTER";

        let whereClause = {};
        if (!isMaster) {
            whereClause = {
                OR: [
                    { visibleToRoles: { has: userRole } },
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

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (dbUser?.role !== "ADMIN" && dbUser?.role !== "MASTER") {
            return NextResponse.json({ error: "Forbidden: Only Admin/Master can build forms" }, { status: 403 });
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
