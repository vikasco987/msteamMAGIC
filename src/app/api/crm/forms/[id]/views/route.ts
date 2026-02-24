import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const views = await prisma.savedView.findMany({
            where: { formId: params.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(views);
    } catch (error) {
        console.error("GET Views Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, conditions, conjunction } = await req.json();

        const view = await prisma.savedView.create({
            data: {
                name,
                formId: params.id,
                conditions,
                conjunction,
                createdBy: user.id
            }
        });

        return NextResponse.json(view);
    } catch (error) {
        console.error("POST View Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.savedView.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE View Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
