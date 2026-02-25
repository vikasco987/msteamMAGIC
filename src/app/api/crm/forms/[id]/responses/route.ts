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
        console.log(`[API] Fetching responses for ${formId}, user: ${userId}`);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });
        console.log(`[API] DB User:`, dbUser);
        const userRole = (dbUser?.role || "GUEST").toUpperCase();
        const form = await prisma.dynamicForm.findUnique({
            where: { id: formId },
            include: { fields: { orderBy: { order: "asc" } } }
        });

        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const isFormOwner = form.createdBy === userId;
        const isMaster = userRole === "ADMIN" || userRole === "MASTER" || isFormOwner;

        // Granular Access Control (GAC)
        const gac: any = form.columnPermissions || { roles: {}, users: {} };
        const rolePerms = gac.roles?.[userRole] || {};
        const userPerms = gac.users?.[userId] || {};
        const colAccess = { ...rolePerms, ...userPerms };

        // Form Level Access Control
        const hasFormAccess = isMaster ||
            form.visibleToRoles.includes(userRole) ||
            form.visibleToUsers.includes(userId) ||
            (form.visibleToRoles.length === 0 && form.visibleToUsers.length === 0);

        if (!hasFormAccess) {
            return NextResponse.json({ error: "Forbidden: You do not have access to this matrix" }, { status: 403 });
        }

        console.log(`[API] Access Granted. isMaster: ${isMaster}, isFormOwner: ${isFormOwner}`);

        const allResponses = await prisma.formResponse.findMany({
            where: { formId },
            include: { values: true },
            orderBy: { submittedAt: "asc" }
        });

        // Filter responses in JS for non-masters
        const responses = isMaster ? allResponses : allResponses.filter(res => {
            const roles = res.visibleToRoles || [];
            const users = res.visibleToUsers || [];
            if (roles.length === 0 && users.length === 0) return true; // Public
            return roles.includes(userRole) || users.includes(userId);
        });


        // We also need the internal columns for the form
        let internalColumns = await prisma.internalColumn.findMany({
            where: { formId },
            orderBy: { order: "asc" }
        });

        // Filter columns by GAC for non-masters
        if (!isMaster) {
            // Filter internal columns
            internalColumns = internalColumns.filter(col => {
                const perm = colAccess[col.id];
                if (perm === "hide") return false;

                // Legacy check as fallback
                const roles = col.visibleToRoles || [];
                const users = col.visibleToUsers || [];
                if (roles.length === 0 && users.length === 0) return true;
                return roles.includes(userRole) || users.includes(userId);
            });

            // Filter form fields
            (form as any).fields = (form.fields || []).filter(f => {
                const perm = colAccess[f.id];
                return perm !== "hide";
            });
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
            isMaster,
            clerkId: userId
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

        const { responseId, columnId, value, isInternal, formId } = await req.json();
        const userName = `${user.firstName} ${user.lastName}`;

        // Permissions Check
        const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
        const userRole = (dbUser?.role || "GUEST").toUpperCase();

        const isMaster = userRole === "ADMIN" || userRole === "MASTER";

        if (!isMaster) {
            const form = await prisma.dynamicForm.findUnique({
                where: { id: formId },
                select: { columnPermissions: true, createdBy: true }
            });
            const response = await prisma.formResponse.findUnique({
                where: { id: responseId },
                select: { visibleToUsers: true, visibleToRoles: true, submittedBy: true }
            });

            const isOwner = form?.createdBy === user.id;
            const isSubmitter = response?.submittedBy === user.id;
            const isAssigned = response?.visibleToUsers?.includes(user.id) ||
                response?.visibleToRoles?.includes(userRole);

            if (!isOwner && !isSubmitter && !isAssigned) {
                return NextResponse.json({ error: "Forbidden: You do not have access to this record" }, { status: 403 });
            }

            // Column Level check
            const gac: any = form?.columnPermissions || { roles: {}, users: {} };
            const rolePerm = gac.roles?.[userRole]?.[columnId];
            const userPerm = gac.users?.[user.id]?.[columnId];
            const finalPerm = userPerm || rolePerm;

            // NEW: Default to 'edit' if assigned, unless explicitly set to 'hide' or 'read'
            if (finalPerm === "hide" || finalPerm === "read") {
                return NextResponse.json({ error: "Forbidden: Manual column restrictions active" }, { status: 403 });
            }
        }

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

// Bulk update values (For Excel-like paste)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { updates } = await req.json(); // Array of { responseId, columnId, value, isInternal }
        if (!Array.isArray(updates)) return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });

        const userName = `${user.firstName} ${user.lastName}`;

        // Process updates in a transaction or loop (Prisma transaction is safer)
        await prisma.$transaction(async (tx) => {
            for (const update of updates) {
                const { responseId, columnId, value, isInternal } = update;
                let oldValue = "";
                let colName = "";

                if (isInternal) {
                    const col = await tx.internalColumn.findUnique({ where: { id: columnId } });
                    colName = col?.label || "Unknown Column";

                    const existing = await tx.internalValue.findFirst({
                        where: { responseId, columnId }
                    });

                    oldValue = existing?.value || "";

                    if (existing) {
                        await tx.internalValue.update({
                            where: { id: existing.id },
                            data: { value, updatedBy: user.id, updatedByName: userName }
                        });
                    } else {
                        await tx.internalValue.create({
                            data: { responseId, columnId, value, updatedBy: user.id, updatedByName: userName }
                        });
                    }
                } else {
                    const field = await tx.formField.findUnique({ where: { id: columnId } });
                    colName = field?.label || "Form Field";

                    const existing = await tx.responseValue.findFirst({
                        where: { responseId, fieldId: columnId }
                    });

                    oldValue = existing?.value || "";

                    if (existing) {
                        await tx.responseValue.update({
                            where: { id: existing.id },
                            data: { value }
                        });
                    } else {
                        await tx.responseValue.create({
                            data: { responseId, fieldId: columnId, value }
                        });
                    }
                }

                if (oldValue !== value) {
                    await tx.formActivity.create({
                        data: {
                            responseId,
                            userId: user.id,
                            userName: userName,
                            type: "BULK_UPDATE",
                            columnName: colName,
                            oldValue: oldValue,
                            newValue: value
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true, count: updates.length });
    } catch (error) {
        console.error("PUT Bulk Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Delete response(s) (Admin/Master only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        const userRole = (dbUser?.role || "GUEST").toUpperCase();

        if (userRole !== "ADMIN" && userRole !== "MASTER") {
            return NextResponse.json({ error: "Forbidden: Only Master/Admin can delete data" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const responseId = searchParams.get("responseId");
        const bulk = searchParams.get("bulk"); // comma separated list of IDs

        if (bulk) {
            const ids = bulk.split(",");
            await prisma.formResponse.deleteMany({
                where: { id: { in: ids } }
            });
            return NextResponse.json({ success: true, deleted: ids.length });
        } else if (responseId) {
            await prisma.formResponse.delete({
                where: { id: responseId }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Missing responseId or bulk parameter" }, { status: 400 });
    } catch (error) {
        console.error("DELETE Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
