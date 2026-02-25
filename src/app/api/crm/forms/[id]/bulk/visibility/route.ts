import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        const { id: formId } = await params;
        const form = await prisma.dynamicForm.findUnique({
            where: { id: formId },
            select: { createdBy: true }
        });

        const isMaster = user && (user.role === "ADMIN" || user.role === "MASTER");
        const isOwner = form?.createdBy === userId;

        if (!isMaster && !isOwner) {
            return NextResponse.json({ error: "Forbidden: Security protocols can only be updated by Admin or Matrix Owner" }, { status: 403 });
        }

        const { ids, type, visibleToRoles, visibleToUsers } = await req.json();

        if (type === "COLUMN") {
            await prisma.internalColumn.updateMany({
                where: { id: { in: ids } },
                data: { visibleToRoles, visibleToUsers }
            });
        } else if (type === "ROW") {
            await prisma.formResponse.updateMany({
                where: { id: { in: ids } },
                data: { visibleToRoles, visibleToUsers }
            });
        } else if (type === "FORM") {
            const { id } = await params;
            await prisma.dynamicForm.update({
                where: { id },
                data: { visibleToRoles, visibleToUsers }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Bulk Visibility Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
