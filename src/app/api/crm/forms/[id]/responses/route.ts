import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// Submit a response (Public or Internal)
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: formId } = await params;
        const user = await currentUser();
        const body = await req.json();
        const { values } = body; // Map of fieldId -> value string

        const response = await prisma.formResponse.create({
            data: {
                formId,
                submittedBy: user?.id || null,
                submittedByName: user ? `${user.firstName} ${user.lastName}` : "Public User",
                values: {
                    create: Object.entries(values).map(([fieldId, value]) => ({
                        fieldId,
                        value: String(value)
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, responseId: response.id });
    } catch (error) {
        console.error("Submit Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Get all responses for a form (Admin/Master only)
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: formId } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const responses = await prisma.formResponse.findMany({
            where: { formId },
            include: { values: true },
            orderBy: { submittedAt: "desc" }
        });

        return NextResponse.json({ responses });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
