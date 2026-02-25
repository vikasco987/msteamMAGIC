import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const form = await prisma.dynamicForm.findUnique({
            where: { id },
            select: { columnPermissions: true }
        });

        return NextResponse.json(form?.columnPermissions || {});
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user || (user.role !== "ADMIN" && user.role !== "MASTER")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const { roles, users } = await req.json();

        await prisma.dynamicForm.update({
            where: { id },
            data: {
                columnPermissions: {
                    roles: roles || {},
                    users: users || {}
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Column Permissions Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
