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

        // Fetch user from our DB to get their role
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });
        const userRole = dbUser?.role || "GUEST";
        const isMaster = userRole === "ADMIN" || userRole === "MASTER";

        const responses = await prisma.formResponse.findMany({
            where: {
                formId,
                OR: isMaster ? undefined : [
                    { visibleToRoles: { has: userRole } },
                    { visibleToUsers: { has: userId } },
                    { visibleToRoles: { set: [] }, visibleToUsers: { set: [] } } // Public if no restrictions
                ]
            },
            include: { values: true },
            orderBy: { submittedAt: "desc" }
        });

        const form = await prisma.dynamicForm.findUnique({
            where: { id: formId },
            include: { fields: { orderBy: { order: "asc" } } }
        });

        // We also need the internal columns for the form
        let internalColumns = await prisma.internalColumn.findMany({
            where: { formId },
            orderBy: { order: "asc" }
        });

        // Filter columns for non-masters
        if (!isMaster) {
            internalColumns = internalColumns.filter(col => {
                const roles = col.visibleToRoles || [];
                const users = col.visibleToUsers || [];
                if (roles.length === 0 && users.length === 0) return true;
                return roles.includes(userRole) || users.includes(userId);
            });

            // Filter form fields if any (though currently they don't have permission fields, it's good practice)
            // if (form?.fields) {
            //      ...
            // }
        }

        // And all internal values for these responses
        const internalValues = await prisma.internalValue.findMany({
            where: {
                responseId: { in: responses.map(r => r.id) },
                columnId: { in: internalColumns.map(c => c.id) }
            }
        });

        // And all activities (Audit Trail)
        const activities = await prisma.formActivity.findMany({
            where: { responseId: { in: responses.map(r => r.id) } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            responses,
            form,
            internalColumns,
            internalValues,
            activities,
            userRole,
            isMaster
        });
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
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { responseId, columnId, value, isInternal } = await req.json();
        const userName = `${user.firstName} ${user.lastName}`;

        let oldValue = "";
        let colName = "";

        if (isInternal) {
            const col = await prisma.internalColumn.findUnique({ where: { id: columnId } });
            colName = col?.label || "Unknown Column";

            const existing = await prisma.internalValue.findFirst({
                where: { responseId, columnId }
            });

            oldValue = existing?.value || "";

            if (existing) {
                await prisma.internalValue.update({
                    where: { id: existing.id },
                    data: {
                        value,
                        updatedBy: user.id,
                        updatedByName: userName
                    }
                });
            } else {
                await prisma.internalValue.create({
                    data: {
                        responseId,
                        columnId,
                        value,
                        updatedBy: user.id,
                        updatedByName: userName
                    }
                });
            }
        } else {
            const field = await prisma.formField.findUnique({ where: { id: columnId } });
            colName = field?.label || "Form Field";

            const existing = await prisma.responseValue.findFirst({
                where: { responseId, fieldId: columnId }
            });

            oldValue = existing?.value || "";

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

        // 4️⃣ Create Activity Log
        if (oldValue !== value) {
            await prisma.formActivity.create({
                data: {
                    responseId,
                    userId: user.id,
                    userName: userName,
                    type: "CELL_UPDATE",
                    columnName: colName,
                    oldValue: oldValue,
                    newValue: value
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Response Value Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
