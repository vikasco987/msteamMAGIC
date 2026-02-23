import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
