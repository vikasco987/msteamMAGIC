import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: formId } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { label, type, options, isRequired, isLocked, showInPublic } = body;

        const lastCol = await prisma.internalColumn.findFirst({
            where: { formId },
            orderBy: { order: "desc" }
        });

        const column = await prisma.internalColumn.create({
            data: {
                formId,
                label,
                type,
                options: options || [],
                order: (lastCol?.order || 0) + 1,
                isRequired: isRequired || false,
                isLocked: isLocked || false,
                showInPublic: showInPublic || false
            }
        });

        return NextResponse.json({ column });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Delete internal column (MASTER only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: formId } = await params;
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Resolve role
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        if (userRole !== "MASTER") {
            return NextResponse.json({ error: "Forbidden: Only MASTER can delete columns" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const columnId = searchParams.get("columnId");

        if (!columnId) return NextResponse.json({ error: "Missing columnId" }, { status: 400 });

        // Delete column and all its values
        await prisma.$transaction([
            prisma.internalValue.deleteMany({ where: { columnId } }),
            prisma.internalColumn.delete({ where: { id: columnId, formId } })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Column Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
