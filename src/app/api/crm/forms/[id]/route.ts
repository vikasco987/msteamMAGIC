import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();

        let userRole = null;
        if (userId) {
            const dbUser = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { role: true }
            });
            userRole = dbUser?.role || null;
        }

        const form = await prisma.dynamicForm.findUnique({
            where: { id },
            include: { fields: { orderBy: { order: "asc" } } }
        });

        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        return NextResponse.json({ form, userRole });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, description, isPublished, fields } = body;

        // Simple update for metadata
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (isPublished !== undefined) updateData.isPublished = isPublished;

        const form = await prisma.dynamicForm.update({
            where: { id },
            data: updateData
        });

        // Optional: Re-create fields if provided
        if (fields) {
            // Delete old fields and create new ones is simplest for dynamic builder
            await prisma.formField.deleteMany({ where: { formId: id } });
            await prisma.formField.createMany({
                data: fields.map((f: any, index: number) => ({
                    formId: id,
                    label: f.label,
                    type: f.type,
                    placeholder: f.placeholder,
                    required: f.required || false,
                    options: f.options || [],
                    order: index
                }))
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await prisma.dynamicForm.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
