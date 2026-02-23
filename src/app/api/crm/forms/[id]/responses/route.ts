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

// Get all responses + internal data (Admin/Master only)
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

        const form = await prisma.dynamicForm.findUnique({
            where: { id: formId },
            include: { fields: { orderBy: { order: "asc" } } }
        });

        // We also need the internal columns for the form
        const internalColumns = await prisma.internalColumn.findMany({
            where: { formId },
            orderBy: { order: "asc" }
        });

        // And all internal values for these responses
        const internalValues = await prisma.internalValue.findMany({
            where: { responseId: { in: responses.map(r => r.id) } }
        });

        return NextResponse.json({ responses, form, internalColumns, internalValues });
    } catch (error) {
        console.error("GET Responses Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Update a specific value (Cell Inline Edit)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { responseId, columnId, value, isInternal } = await req.json();

        if (isInternal) {
            await prisma.internalValue.upsert({
                where: {
                    // Using a unique composite if we had it, but since we don't, we'll find and update or create
                    // Prisma MongoDB doesn't support easy composite unique indexes on nested models sometimes
                    // Let's use findFirst then update/create
                },
                // Refined approach: find if exists
            } as any);

            const existing = await prisma.internalValue.findFirst({
                where: { responseId, columnId }
            });

            if (existing) {
                await prisma.internalValue.update({
                    where: { id: existing.id },
                    data: { value }
                });
            } else {
                await prisma.internalValue.create({
                    data: { responseId, columnId, value }
                });
            }
        } else {
            // Update regular response value
            const existing = await prisma.responseValue.findFirst({
                where: { responseId, fieldId: columnId }
            });
            if (existing) {
                await prisma.responseValue.update({
                    where: { id: existing.id },
                    data: { value }
                });
            } else {
                await prisma.responseValue.create({
                    data: { responseId, fieldId: columnId, value }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Response Value Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
