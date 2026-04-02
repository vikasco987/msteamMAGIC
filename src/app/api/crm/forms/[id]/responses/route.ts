import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { emitMatrixUpdate } from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Submit a response (Public or Internal)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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
                assignedTo: [], // 🚀 NEW: Start as unassigned for distribution hub
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

        await emitMatrixUpdate({ formId, responseId: response.id, type: "NEW_SUBMISSION" });
        return NextResponse.json({ success: true, responseId: response.id, response });
    } catch (error) {
        console.error("Submit Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Get all responses + internal data (Admin/Master only)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const perfStart = Date.now();
    try {
        const { id: formId } = await params;
        const { userId } = await auth();
        const { searchParams } = new URL(req.url);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        // 💎 PRO-CORE: Meta-Data Split Strategy
        const includeMeta = searchParams.get("meta") === "true" || !searchParams.get("page");

        // 🚀 THE PARALLEL ENGINE: Core Meta & Perms
        const [form, teamData, internalColumns, colPermissions] = includeMeta ? await Promise.all([
            prisma.dynamicForm.findUnique({
                where: { id: formId },
                include: { fields: true }
            }),
            prisma.user.findMany({
                where: { 
                    OR: [
                        { publicMetadata: { path: ["role"], equals: "STAFF" } },
                        { publicMetadata: { path: ["role"], equals: "TL" } },
                        { publicMetadata: { path: ["role"], equals: "ADMIN" } },
                        { publicMetadata: { path: ["role"], equals: "MASTER" } }
                    ]
                }
            }),
            prisma.internalColumn.findMany({ where: { formId }, orderBy: { order: "asc" } }),
            prisma.columnPermission.findMany({ where: { formId } })
        ]) : [null, null, null, null];

        // Fetch basic form details for permission logic if meta was skipped
        let baseFormMeta = form;
        if (!includeMeta) {
            baseFormMeta = await prisma.dynamicForm.findUnique({
                where: { id: formId },
                select: { id: true, createdBy: true, visibleToRoles: true, visibleToUsers: true, columnPermissions: true }
            }) as any;
        }

        if (!baseFormMeta) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const isFormOwner = baseFormMeta.createdBy === userId;
        const reachedMasterRole = userRole === "MASTER" || userRole === "ADMIN";
        const isMaster = reachedMasterRole || userRole === "TL" || isFormOwner;

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "__submittedAt";
        const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
        const conditionsStr = searchParams.get("conditions") || "[]";
        let conditions: any[] = [];
        try {
            conditions = JSON.parse(conditionsStr);
        } catch (e) {
            console.error("Failed to parse conditions:", e);
        }

        const conjunction = searchParams.get("conjunction") || "AND";
        const includeIdsStr = searchParams.get("includeIds") || "";
        const includeIds = includeIdsStr ? includeIdsStr.split(",").filter(id => !!id) : [];
        
        // Team Leader Logic
        const isTL = dbUser?.isTeamLeader || userRole?.toUpperCase() === 'TL';
        let teamMemberIds: string[] = [];
        if (isTL) {
            const members = await prisma.user.findMany({
                where: { leaderId: userId },
                select: { clerkId: true }
            });
            teamMemberIds = members.map(m => m.clerkId);
        }

        // Define permissions filter
        const permissionWhere: any = isMaster ? {} : {
            OR: [
                { assignedTo: { has: userId } },
                {
                    AND: [
                        { submittedBy: userId },
                        {
                            OR: [
                                { assignedTo: { has: userId } },
                                { assignedTo: { isEmpty: true } },
                                { assignedTo: { equals: [] } }
                            ]
                        }
                    ]
                },
                { visibleToRoles: { has: userRole } },
                { visibleToUsers: { has: userId } },
                ...(isTL && teamMemberIds.length > 0 ? [
                    { assignedTo: { hasSome: teamMemberIds } },
                    { AND: [{ assignedTo: { isEmpty: true } }, { submittedBy: { in: teamMemberIds } }] }
                ] : [])
            ]
        };

        const getPrismaOp = (operator: string, value: any, secondValue?: any) => {
            switch (operator) {
                case "equals":
                case "equals_date":
                    return { equals: value, mode: 'insensitive' };
                case "contains":
                    return { contains: value, mode: 'insensitive' };
                case "greater_than":
                case "after":
                    return { gt: value };
                case "less_than":
                case "before":
                    return { lt: value };
                case "greater_than_or_equal":
                case "gte":
                    return { gte: value };
                case "less_than_or_equal":
                case "lte":
                    return { lte: value };
                default:
                    return { equals: value, mode: 'insensitive' };
            }
        };

        const fields = form?.fields || [];
        const colMap: Record<string, string> = {};
        fields.forEach((f: any) => colMap[f.id] = f.type);
        (internalColumns || []).forEach((c: any) => colMap[c.id] = c.type);

        // Advanced Filter Logic
        const groupedConditions = (conditions as any[]).reduce((acc: any, cond: any) => {
            if (!acc[cond.colId]) acc[cond.colId] = [];
            acc[cond.colId].push(cond);
            return acc;
        }, {});

        const nowParam = searchParams.get("today") || new Date().toISOString().split('T')[0];
        const perspectiveDates = nowParam.split(",").map(d => new Date(d));
        const now = perspectiveDates[0];

        const advancedFilters: any[] = [];
        Object.entries(groupedConditions).forEach(([colId, conds]: [string, any]) => {
            const columnFilters: any[] = [];
            const colType = colMap[colId] || "text";

            conds.forEach((cond: any) => {
                const { op, val, val2 } = cond;
                if (!op) return;

                if (colId === "isTouched") {
                    columnFilters.push({ isTouched: (val === "true" || val === true || val === 1) });
                } else if (colId === "__submittedAt") {
                    if (op === "today") {
                        const dateFilters = perspectiveDates.map(pDate => {
                            const start = new Date(pDate); start.setHours(0, 0, 0, 0);
                            const end = new Date(pDate); end.setHours(23, 59, 59, 999);
                            return { submittedAt: { gte: start, lte: end } };
                        });
                        columnFilters.push({ OR: dateFilters });
                    } else if (op === "before" && val) {
                        columnFilters.push({ submittedAt: { lt: new Date(val) } });
                    } else if (op === "after" && val) {
                        columnFilters.push({ submittedAt: { gt: new Date(val) } });
                    }
                } else if (colId === "__assigned") {
                    if (val === "__UNASSIGNED__" || !val || op === "is_empty") {
                        columnFilters.push({ OR: [{ assignedTo: { isEmpty: true } }, { assignedTo: { equals: [] } }] });
                    } else if (val === "__ONLY_ME__") {
                         columnFilters.push({ OR: [{ assignedTo: { has: userId } }, { submittedBy: userId }] });
                    } else {
                        columnFilters.push({ OR: [{ assignedTo: { has: val } }, { visibleToUsers: { has: val } }, { submittedBy: val }] });
                    }
                } else if (!colId.startsWith("__")) {
                    const pOp = getPrismaOp(op, val, val2);
                    columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: pOp } } }, { internalValues: { some: { columnId: colId, value: pOp } } }] });
                }
            });
            if (columnFilters.length > 0) advancedFilters.push({ OR: columnFilters });
        });

        const finalAndFilters: any[] = [isMaster ? {} : permissionWhere];
        if (search) {
            finalAndFilters.push({
                OR: [
                    { submittedByName: { contains: search, mode: 'insensitive' } },
                    { values: { some: { value: { contains: search, mode: 'insensitive' } } } }
                ]
            });
        }
        if (advancedFilters.length > 0) {
            if (conjunction === "AND") finalAndFilters.push(...advancedFilters);
            else finalAndFilters.push({ OR: advancedFilters });
        }

        const whereFilter: any = { formId, AND: finalAndFilters };

        // Handle includeIds for persistence hub
        if (includeIds.length > 0) {
            const baseConditions = [...finalAndFilters];
            delete whereFilter.AND;
            whereFilter.OR = [
                { AND: baseConditions },
                { id: { in: includeIds } }
            ];
        }

        const orderBy = sortBy === "__submittedAt" ? { submittedAt: sortOrder } : { submittedAt: sortOrder };

        // 🚀 SYNC-OPTIMIZE: Combined count strategy for performance
        const [items, countFiltered, countTotal] = await Promise.all([
            prisma.formResponse.findMany({
                where: whereFilter,
                orderBy,
                skip,
                take: limit
            }),
            prisma.formResponse.count({ where: whereFilter }),
            // 💎 PRO-CORE: Skip heavy total count on every page-turn if filteredCount is available
            includeMeta ? prisma.formResponse.count({ where: { formId, ...isMaster ? {} : permissionWhere } }) : Promise.resolve(0)
        ]);

        const allResponseIds = items.map(r => r.id);

        // Scoped Fetching of Relations (Only for the visible rows)
        const [internalValues, allValues, allRemarks, allPayments] = await Promise.all([
            prisma.internalValue.findMany({ where: { responseId: { in: allResponseIds } } }),
            prisma.responseValue.findMany({ where: { responseId: { in: allResponseIds } } }),
            prisma.formRemark.findMany({ 
                where: { responseId: { in: allResponseIds } }, 
                orderBy: { createdAt: "desc" },
                take: allResponseIds.length * 2 
            } as any),
            prisma.formPayment.findMany({ where: { responseId: { in: allResponseIds } } } as any)
        ]);

        const stitchedResponses = items.map(r => ({
            ...r,
            values: allValues.filter((v: any) => v.responseId === r.id),
            remarks: allRemarks.filter((rm: any) => rm.responseId === r.id),
            payments: allPayments.filter((p: any) => p.responseId === r.id)
        }));

        const allUserIds = (baseFormMeta?.visibleToUsers || []);
        const usersMap: Record<string, any> = {};
        if (includeMeta && allUserIds.length > 0) {
            try {
                const clerk = await clerkClient();
                const usersList = await clerk.users.getUserList({ userId: allUserIds, limit: 100 });
                usersList.data.forEach(u => usersMap[u.id] = { email: u.emailAddresses[0]?.emailAddress, name: `${u.firstName} ${u.lastName}`, imageUrl: u.imageUrl });
            } catch (err) {
                console.error("Clerk fetch error:", err);
            }
        }

        const enrichedForm = includeMeta ? {
            ...form,
            visibleToUsersData: allUserIds.filter((uid: string) => usersMap[uid]).map((uid: string) => ({ id: uid, ...usersMap[uid] }))
        } : null;

        const perfEnd = Date.now();
        return NextResponse.json({
            ...(includeMeta ? {
                form: enrichedForm,
                internalColumns: internalColumns || [],
                teamData: (teamData || []).map(u => ({ clerkId: u.clerkId, email: u.emailAddresses[0]?.emailAddress, firstName: u.firstName, lastName: u.lastName, imageUrl: u.imageUrl, role: (u.publicMetadata as any)?.role || 'STAFF' }))
            } : {}),
            responses: stitchedResponses,
            internalValues,
            totalCount: includeMeta ? countTotal : countFiltered,
            filteredCount: countFiltered,
            page,
            limit,
            isMaster,
            isPureMaster: reachedMasterRole,
            userRole,
            clerkId: userId,
            latency: `${perfEnd - perfStart}ms`
        });
    } catch (error: any) {
        const perfEnd = Date.now();
        console.error("GET Optimized API Error:", error);
        return NextResponse.json({ error: "Sync failed", latency: `${perfEnd - perfStart}ms` }, { status: 500 });
    }
}

// Update a specific value (Cell Inline Edit)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { responseId, columnId, value, isInternal, formId, rowColor, assignedTo } = await req.json();
        const userName = `${user.firstName} ${user.lastName}`;

        // 🟢 ROW LEVEL UPDATE (Like Background Color)
        if (rowColor !== undefined) {
            await (prisma.formResponse as any).update({
                where: { id: responseId },
                data: { rowColor: rowColor === "" ? null : rowColor }
            });
            return NextResponse.json({ success: true, message: "Row color updated" });
        }

        // 🟢 ASSIGNED TO UPDATE (System Column)
        if (assignedTo !== undefined) {
            const resp = await prisma.formResponse.findUnique({ where: { id: responseId } });
            if (!resp) return NextResponse.json({ error: "Response not found" }, { status: 404 });

            await prisma.formResponse.update({
                where: { id: responseId },
                data: { assignedTo: { set: assignedTo } }
            });

            // Activity Log
            await prisma.formActivity.create({
                data: {
                    responseId,
                    userId: user.id,
                    userName: userName,
                    type: "ASSIGNMENT_CHANGE",
                    columnName: "Assigned Users",
                    oldValue: (resp.assignedTo || []).join(", "),
                    newValue: (assignedTo as string[]).join(", ")
                }
            });

            return NextResponse.json({ success: true, message: "Assignments updated" });
        }

        // Permissions Check
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        const isMaster = userRole === "ADMIN" || userRole === "MASTER" || userRole === "TL";

        if (!isMaster) {
            const form = await prisma.dynamicForm.findUnique({
                where: { id: formId },
                select: { columnPermissions: true, createdBy: true }
            });
            const response = await prisma.formResponse.findUnique({
                where: { id: responseId }
            });

            // Access Logic
            const gac: any = form?.columnPermissions || { roles: {}, users: {} };
            const isOwner = form?.createdBy === user.id;
            const isSubmitter = response?.submittedBy === user.id;
            const isAssigned = (response as any)?.assignedTo?.includes(user.id);

            if (!isOwner && !isSubmitter && !isAssigned) {
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
        
        await prisma.formResponse.update({
            where: { id: responseId },
            data: { isTouched: true }
        });

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

        await emitMatrixUpdate({ formId, responseId, columnId, value, type: "CELL_UPDATE" });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Response Value Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Bulk update values (For Excel-like paste)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: formId } = await params;
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { updates } = await req.json(); // Array of { responseId, columnId, value, isInternal }
        if (!Array.isArray(updates)) return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });

        const userName = `${user.firstName} ${user.lastName}`;

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

                await tx.formResponse.update({
                    where: { id: responseId },
                    data: { isTouched: true }
                });

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
        
        await emitMatrixUpdate({ formId, type: "BULK_UPDATE", count: updates.length });
        return NextResponse.json({ success: true, count: updates.length });
    } catch (error) {
        console.error("PUT Bulk Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Delete response(s) (MASTER only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: formId } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await currentUser();
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        const dbRole = (dbUser?.role || "").toUpperCase();

        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();
        const isMasterRole = userRole === "MASTER" || userRole === "ADMIN";

        if (!isMasterRole) {
            return NextResponse.json({
                error: "Forbidden: Only users with MASTER role can delete data in this protocol."
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const responseId = searchParams.get("responseId");
        const bulk = searchParams.get("bulk"); // comma separated list of IDs

        let ids: string[] = [];
        if (bulk) {
            ids = bulk.split(",");
        } else if (responseId) {
            ids = [responseId];
        }

        if (ids.length > 0) {
            await prisma.formResponse.deleteMany({
                where: {
                    id: { in: ids },
                    formId: formId
                }
            });
            await emitMatrixUpdate({ formId, type: "BULK_DELETE", deletedCount: ids.length });
            return NextResponse.json({ success: true, deleted: ids.length });
        }

        return NextResponse.json({ error: "Missing responseId or bulk parameter" }, { status: 400 });
    } catch (error) {
        console.error("DELETE Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
