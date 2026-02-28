import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
            },
            include: {
                values: true
            }
        });

        return NextResponse.json({ success: true, responseId: response.id, response });
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

        const user = await currentUser();
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        console.log(`[API] Resolved Role: ${userRole} (Clerk: ${metaRole}, DB: ${dbRole})`);
        const form = await prisma.dynamicForm.findUnique({
            where: { id: formId },
            include: { fields: { orderBy: { order: "asc" } } }
        });

        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const isFormOwner = form.createdBy === userId;
        const isMasterRole = userRole === "MASTER"; // Ultimate Authority
        const isMaster = isMasterRole || userRole === "ADMIN" || isFormOwner;

        // Granular Access Control (GAC)
        const gac: any = form.columnPermissions || { roles: {}, users: {} };
        const rolePerms = gac.roles?.[userRole] || {};
        const userPerms = gac.users?.[userId] || {};
        const colAccess = { ...rolePerms, ...userPerms };
        const allResponses = await prisma.formResponse.findMany({
            where: { formId },
            include: {
                values: true,
                // @ts-ignore - Prisma types might need generation
                remarks: { orderBy: { createdAt: "desc" } }
            },
            orderBy: { submittedAt: "asc" }
        });

        const isAssignedToAny = allResponses.some(r => ((r as any).assignedTo || []).includes(userId));

        // Form Level Access Control
        const hasFormAccess = isMasterRole || isMaster ||
            form.visibleToRoles.includes(userRole) ||
            form.visibleToUsers.includes(userId) ||
            isAssignedToAny ||
            (form.visibleToRoles.length === 0 && form.visibleToUsers.length === 0);

        if (!hasFormAccess) {
            return NextResponse.json({ error: "Forbidden: You do not have access to this matrix" }, { status: 403 });
        }

        console.log(`[API] Access Granted. isMasterRole: ${isMasterRole}, isMaster: ${isMaster}`);

        // Filter responses: Admins, Masters, and Owners bypass all row-level checks.
        // Others only see rows they submitted, are assigned to, or are explicitly shared with them.
        const responses = isMaster ? allResponses : allResponses.filter(res => {
            const roles = res.visibleToRoles || [];
            const users = res.visibleToUsers || [];
            const assignees = (res as any).assignedTo || [];

            // Condition 1: Submitter/Creator always sees their own record
            if (res.submittedBy === userId) return true;

            // Condition 2: Explicitly Assigned users can see it
            if (assignees.includes(userId)) return true;

            // Condition 3: Legacy or explicit visibility permissions
            if (roles.includes(userRole) || users.includes(userId)) return true;

            return false;
        });

        // We also need the internal columns for the form
        let internalColumns = await prisma.internalColumn.findMany({
            where: { formId },
            orderBy: { order: "asc" }
        });

        // Filter columns by GAC for non-masters
        if (!isMasterRole) {
            // Filter internal columns
            internalColumns = internalColumns.filter(col => {
                const perm = colAccess[col.id];
                if (perm === "hide") return false;

                // Legacy visibility check
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

        // Resolve user data for UI mapping
        const allUserIds = form.visibleToUsers || [];
        const usersMap: Record<string, { email: string; name: string; imageUrl: string }> = {};

        if (allUserIds.length > 0) {
            try {
                const clerk = await clerkClient();
                const usersList = await clerk.users.getUserList({ userId: allUserIds, limit: 100 });
                usersList.data.forEach(u => {
                    usersMap[u.id] = {
                        email: u.emailAddresses[0]?.emailAddress || "Unknown",
                        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
                        imageUrl: u.imageUrl || ""
                    };
                });
            } catch (err) {
                console.error("Clerk fetch users mapping error:", err);
            }
        }

        const enrichedForm: any = {
            ...form,
            visibleToUsersData: allUserIds.map(uid => ({
                id: uid,
                ...(usersMap[uid] || { email: "Unknown", name: "User", imageUrl: "" })
            }))
        };

        return NextResponse.json({
            responses,
            form: enrichedForm,
            internalColumns,
            internalValues,
            activities,
            userRole,
            isMaster: isMaster,
            isPureMaster: isMasterRole, // Specifically for deletion and absolute power
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
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        const isMaster = userRole === "ADMIN" || userRole === "MASTER";

        if (!isMaster) {
            const form = await prisma.dynamicForm.findUnique({
                where: { id: formId },
                select: { columnPermissions: true, createdBy: true }
            });
            const response = await prisma.formResponse.findUnique({
                where: { id: responseId }
            });

            // Column Level check first
            const gac: any = form?.columnPermissions || { roles: {}, users: {} };
            const rolePerm = gac.roles?.[userRole]?.[columnId];
            const userPerm = gac.users?.[user.id]?.[columnId];
            const finalPerm = userPerm || rolePerm;

            const isOwner = form?.createdBy === user.id;
            const isSubmitter = response?.submittedBy === user.id;
            const isAssigned = response?.visibleToUsers?.includes(user.id) ||
                response?.visibleToRoles?.includes(userRole) ||
                (response as any)?.assignedTo?.includes(user.id);

            // Access Logic:
            // 1. If GAC explicitly says 'edit' -> ALLOW
            // 2. If Owner, Submitter, or Assigned -> ALLOW (unless GAC says hide/read)
            if (finalPerm === "edit") {
                // Allowed by GAC
            } else if (isOwner || isSubmitter || isAssigned) {
                if (finalPerm === "hide" || finalPerm === "read") {
                    return NextResponse.json({ error: "Forbidden: Manual column restrictions active" }, { status: 403 });
                }
            } else {
                return NextResponse.json({ error: "Forbidden: You do not have access to this record" }, { status: 403 });
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

        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        const isMaster = userRole === "ADMIN" || userRole === "MASTER";
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

// Delete response(s) (MASTER only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        const { id: formId } = await params;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await currentUser();
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        const dbRole = (dbUser?.role || "").toUpperCase();

        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();
        const isMasterRole = userRole === "MASTER";

        if (!isMasterRole) {
            console.warn(`[API] DELETE Forbidden. userRole: ${userRole}, clerkId: ${userId}`);
            return NextResponse.json({
                error: "Forbidden: Only users with MASTER role can delete data in this protocol.",
                debug: { resolvedRole: userRole, clerkMetaRole: metaRole, dbRole: dbRole, userId }
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const responseId = searchParams.get("responseId");
        const bulk = searchParams.get("bulk"); // comma separated list of IDs

        if (bulk) {
            const ids = bulk.split(",");
            await prisma.formResponse.deleteMany({
                where: {
                    id: { in: ids },
                    formId: formId
                }
            });
            return NextResponse.json({ success: true, deleted: ids.length });
        } else if (responseId) {
            await prisma.formResponse.deleteMany({
                where: {
                    id: responseId,
                    formId: formId
                }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Missing responseId or bulk parameter" }, { status: 400 });
    } catch (error) {
        console.error("DELETE Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
