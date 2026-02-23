import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const forms = await prisma.dynamicForm.findMany({
            include: { _count: { select: { responses: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ forms });
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

        const body = await req.json();
        const { title, description, fields } = body;

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        const form = await prisma.dynamicForm.create({
            data: {
                title,
                description,
                createdBy: userId,
                createdByName: user?.fullName || user?.firstName || "Unknown",
                fields: {
                    create: fields.map((f: any, index: number) => ({
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
