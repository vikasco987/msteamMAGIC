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
                assignedTo: user?.id ? [user.id] : [],
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
        const rawFormResult: any = await (prisma as any).$runCommandRaw({
            find: "DynamicForm",
            filter: { _id: { $oid: formId } },
            limit: 1
        });

        const rawForm = rawFormResult.cursor?.firstBatch?.[0];
        if (!rawForm) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const [fields, internalColumns] = await Promise.all([
            prisma.formField.findMany({ where: { formId }, orderBy: { order: "asc" } }),
            prisma.internalColumn.findMany({ where: { formId }, orderBy: { order: "asc" } })
        ]);

        const colMap: Record<string, string> = {};
        fields.forEach(f => colMap[f.id] = f.type);
        internalColumns.forEach(c => colMap[c.id] = c.type);

        const form = {
            ...rawForm,
            id: rawForm._id.$oid || rawForm._id,
            fields
        };

        const isFormOwner = form.createdBy === userId;
        const isMasterRole = userRole === "MASTER"; // Ultimate Authority
        const isMaster = isMasterRole || userRole === "ADMIN" || userRole === "TL" || isFormOwner;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
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

        const gac: any = form.columnPermissions || { roles: {}, users: {} };
        const rolePerms = gac.roles?.[userRole] || {};
        const userPerms = gac.users?.[userId] || {};
        const colAccess = { ...rolePerms, ...userPerms };

        // Team Leader Logic: If user is TL, they can see their team's data
        const isTL = dbUser?.isTeamLeader || userRole?.toUpperCase() === 'TL';
        let teamMemberIds: string[] = [];
        if (isTL) {
            const members = await prisma.user.findMany({
                where: { leaderId: userId },
                select: { clerkId: true }
            });
            teamMemberIds = members.map(m => m.clerkId);
        }

        // Construct where clause for filtering based on permissions
        const permissionWhere: any = isMaster ? {} : {
            OR: [
                { assignedTo: { has: userId } },
                { AND: [{ assignedTo: { isEmpty: true } }, { submittedBy: userId }] },
                { visibleToRoles: { has: userRole } },
                { visibleToUsers: { has: userId } },
                ...(isTL && teamMemberIds.length > 0 ? [
                    { assignedTo: { hasSome: teamMemberIds } },
                    { AND: [{ assignedTo: { isEmpty: true } }, { submittedBy: { in: teamMemberIds } }] }
                ] : [])
            ]
        };

        // Group conditions by colId for OR logic within columns
        const groupedConditions = (conditions as any[]).reduce((acc: any, cond: any) => {
            if (!acc[cond.colId]) acc[cond.colId] = [];
            acc[cond.colId].push(cond);
            return acc;
        }, {});

        const advancedFilters: any[] = [];
        Object.entries(groupedConditions).forEach(([colId, conds]: [string, any]) => {
            const columnFilters: any[] = [];
            const colType = colMap[colId] || "text";

            conds.forEach((cond: any) => {
                const { op, val, val2 } = cond;
                if (!op) return;

                const getPrismaOp = (operator: string, value: any, secondValue?: any) => {
                    const isNum = colType === "number" || colType === "currency";
                    const isDate = colType === "date";
                    
                    const castVal = (v: any) => {
                        if (isNum && !isNaN(Number(v))) return String(v); // Keep as string for DB match but logic-aware
                        return v;
                    };

                    switch (operator) {
                        case "equals": return isNum || colType === "dropdown" || colType === "user" ? { equals: castVal(value) } : { equals: value, mode: 'insensitive' as const };
                        case "not_equals": return { not: castVal(value) };
                        case "contains": return { contains: value, mode: 'insensitive' as const };
                        case "starts_with": return { startsWith: value, mode: 'insensitive' as const };
                        case "ends_with": return { endsWith: value, mode: 'insensitive' as const };
                        case "one_of": return { in: (value || "").split(",").map((t: string) => t.trim()).filter(Boolean), mode: 'insensitive' as const };
                        case "is_empty": return { equals: "" };
                        case "is_not_empty": return { not: "" };
                        case "is_true": return { equals: "true" };
                        case "is_false": return { equals: "false" };
                        case "gt": return { gt: castVal(value) };
                        case "lt": return { lt: castVal(value) };
                        case "gte": return { gte: castVal(value) };
                        case "lte": return { lte: castVal(value) };
                        case "between": return { gte: castVal(value), lte: castVal(secondValue) };
                        default: return { contains: value, mode: 'insensitive' as const };
                    }
                };

                if (colId === "__submittedAt") {
                    if (op === "today") {
                        const start = new Date(); start.setHours(0, 0, 0, 0);
                        const end = new Date(); end.setHours(23, 59, 59, 999);
                        columnFilters.push({ submittedAt: { gte: start, lte: end } });
                    } else if (op === "this_week") {
                        const now = new Date();
                        const start = new Date(now.setDate(now.getDate() - now.getDay()));
                        start.setHours(0, 0, 0, 0);
                        columnFilters.push({ submittedAt: { gte: start } });
                    } else if (op === "before" && val) {
                        columnFilters.push({ submittedAt: { lt: new Date(val) } });
                    } else if (op === "after" && val) {
                        columnFilters.push({ submittedAt: { gt: new Date(val) } });
                    } else if (op === "exact_date" && val) {
                        const start = new Date(val); start.setHours(0, 0, 0, 0);
                        const end = new Date(val); end.setHours(23, 59, 59, 999);
                        columnFilters.push({ submittedAt: { gte: start, lte: end } });
                    }
                } else if (colId === "__contributor") {
                    columnFilters.push({ submittedByName: getPrismaOp(op, val, val2) });
                } else if (colId === "__assigned") {
                    if (op === "is_empty" || (op === "equals" && !val)) {
                        columnFilters.push({ AND: [{ OR: [{ assignedTo: { equals: [] } }, { assignedTo: null }] }, { submittedBy: null }] });
                    } else if (op === "is_not_empty") {
                        columnFilters.push({ OR: [{ NOT: { assignedTo: { equals: [] } } }, { NOT: { assignedTo: null } }, { NOT: { submittedBy: null } }] });
                    } else {
                        columnFilters.push({ OR: [{ assignedTo: { has: val } }, { visibleToUsers: { has: val } }, { submittedBy: val }, { submittedByName: { contains: val, mode: 'insensitive' } }] });
                    }
                } else if (colId === "__nextFollowUpDate" || colId === "__followup" || colId === "__followUpStatus" || colId === "__recentRemark") {
                    // Remarks logic
                    if (colId === "__nextFollowUpDate") {
                        if (op === "is_empty") columnFilters.push({ OR: [{ remarks: { none: {} } }, { remarks: { every: { nextFollowUpDate: null } } }] });
                        else if (op === "is_not_empty") columnFilters.push({ remarks: { some: { nextFollowUpDate: { not: null } } } });
                        else if (op === "today") {
                            const start = new Date(); start.setHours(0, 0, 0, 0);
                            const end = new Date(); end.setHours(23, 59, 59, 999);
                            columnFilters.push({ remarks: { some: { nextFollowUpDate: { gte: start, lte: end } } } });
                        } else if (op === "exact_date" && val) {
                            const start = new Date(val); start.setHours(0, 0, 0, 0);
                            const end = new Date(val); end.setHours(23, 59, 59, 999);
                            columnFilters.push({ remarks: { some: { nextFollowUpDate: { gte: start, lte: end } } } });
                        } else if (op === "before" && val) {
                            columnFilters.push({ remarks: { some: { nextFollowUpDate: { lt: new Date(val) } } } });
                        } else if (op === "after" && val) {
                            columnFilters.push({ remarks: { some: { nextFollowUpDate: { gt: new Date(val) } } } });
                        }
                    } else if (colId === "__followUpStatus") {
                        if (op === "is_empty") columnFilters.push({ OR: [{ remarks: { none: {} } }, { remarks: { every: { followUpStatus: "" } } }] });
                        else columnFilters.push({ remarks: { some: { followUpStatus: getPrismaOp(op, val, val2) } } });
                    } else if (colId === "__recentRemark" || colId === "__followup") {
                        if (op === "is_empty") columnFilters.push({ remarks: { none: {} } });
                        else columnFilters.push({ remarks: { some: { remark: getPrismaOp(op, val, val2) } } });
                    }
                } else if (!colId.startsWith("__")) {
                    if (op === "is_empty") {
                        columnFilters.push({ OR: [{ AND: [{ values: { none: { fieldId: colId } } }, { internalValues: { none: { columnId: colId } } }] }, { values: { some: { fieldId: colId, value: "" } } }, { internalValues: { some: { columnId: colId, value: "" } } }] });
                    } else if (op === "is_not_empty") {
                        columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: { not: "" } } } }, { internalValues: { some: { columnId: colId, value: { not: "" } } } }] });
                    } else if (colType === "date") {
                        // 📅 MASTER DATE LOGIC FOR CUSTOM COLUMNS
                        const toISO = (d: Date) => d.toISOString().split('T')[0];
                        const now = new Date();

                        if (op === "today") {
                            const str = toISO(now);
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: str } } }, { internalValues: { some: { columnId: colId, value: str } } }] });
                        } else if (op === "yesterday") {
                            const d = new Date(); d.setDate(d.getDate() - 1);
                            const str = toISO(d);
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: str } } }, { internalValues: { some: { columnId: colId, value: str } } }] });
                        } else if (op === "tomorrow") {
                            const d = new Date(); d.setDate(d.getDate() + 1);
                            const str = toISO(d);
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: str } } }, { internalValues: { some: { columnId: colId, value: str } } }] });
                        } else if (op === "this_week") {
                            const start = new Date(now.setDate(now.getDate() - now.getDay()));
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: { gte: toISO(start) } } } }, { internalValues: { some: { columnId: colId, value: { gte: toISO(start) } } } }] });
                        } else if (op === "exact_date" && val) {
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: val } } }, { internalValues: { some: { columnId: colId, value: val } } }] });
                        } else if (op === "before" && val) {
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: { lt: val } } } }, { internalValues: { some: { columnId: colId, value: { lt: val } } } }] });
                        } else if (op === "after" && val) {
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: { gt: val } } } }, { internalValues: { some: { columnId: colId, value: { gt: val } } } }] });
                        } else if (op === "between" && val && val2) {
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: { gte: val, lte: val2 } } } }, { internalValues: { some: { columnId: colId, value: { gte: val, lte: val2 } } } }] });
                        } else {
                            // Fallback for equals/equals_date
                            columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: val } } }, { internalValues: { some: { columnId: colId, value: val } } }] });
                        }
                    } else {
                        const c = getPrismaOp(op, val, val2);
                        columnFilters.push({ OR: [{ values: { some: { fieldId: colId, value: c } } }, { internalValues: { some: { columnId: colId, value: c } } }] });
                    }
                }
            });

            if (columnFilters.length > 0) {
                advancedFilters.push({ OR: columnFilters });
            }
        });

        const whereFilter: any = {
            formId,
            ...permissionWhere,
            AND: [
                ...(search ? [{
                    OR: [
                        { submittedByName: { contains: search, mode: 'insensitive' } },
                        { values: { some: { value: { contains: search, mode: 'insensitive' } } } },
                        { internalValues: { some: { value: { contains: search, mode: 'insensitive' } } } },
                        { remarks: { some: { remark: { contains: search, mode: 'insensitive' } } } },
                        { remarks: { some: { followUpStatus: { contains: search, mode: 'insensitive' } } } }
                    ]
                }] : []),
                ...(conjunction === "AND" ? advancedFilters : [{ OR: advancedFilters }])
            ]
        };

        // Resolve OrderBy
        let orderBy: any = { submittedAt: "desc" };
        if (sortBy === "__submittedAt") orderBy = { submittedAt: sortOrder };
        else if (sortBy === "__contributor") orderBy = { submittedByName: sortOrder };
        else {
            // Sorting by dynamic values is extremely hard in Prisma (requires raw SQL or many-to-many join sorting)
            // We'll keep default for now
            orderBy = { submittedAt: sortOrder };
        }

        const [totalResponses, responses, filteredTotalCount] = await Promise.all([
            prisma.formResponse.count({ where: { formId, ...permissionWhere } }),
            prisma.formResponse.findMany({
                where: whereFilter,
                include: {
                    values: true,
                    // @ts-ignore
                    remarks: { orderBy: { createdAt: "desc" } },
                    // @ts-ignore
                    payments: { orderBy: { paymentDate: "desc" } }
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma.formResponse.count({ where: whereFilter }),
        ]);

        const isAssignedToAny = isMaster ? true : responses.some(r => ((r as any).assignedTo || []).includes(userId));

        // Form Level Access Control (Simplified check based on the first few entries or overall flags)
        const hasFormAccess = isMasterRole || isMaster ||
            form.visibleToRoles.includes(userRole) ||
            form.visibleToUsers.includes(userId) ||
            isAssignedToAny ||
            (form.visibleToRoles.length === 0 && form.visibleToUsers.length === 0);

        if (!hasFormAccess) {
            return NextResponse.json({ error: "Forbidden: You do not have access to this matrix" }, { status: 403 });
        }

        console.log(`[API] Access Granted. isMasterRole: ${isMasterRole}, isMaster: ${isMaster}`);

        // We also need the internal columns for the form (Done in Promise.all above)
        let processedInternalColumns = [...internalColumns];


        // Filter columns by GAC for non-masters
        if (!isMasterRole) {
            // Filter internal columns
            processedInternalColumns = processedInternalColumns.filter(col => {
                const perm = colAccess[col.id];
                if (perm === "hide") return false;

                // Legacy visibility check
                const roles = col.visibleToRoles || [];
                const users = col.visibleToUsers || [];
                if (roles.length === 0 && users.length === 0) return true;
                return roles.includes(userRole) || users.includes(userId);
            });

            // Filter form fields
            (form as any).fields = (form.fields || []).filter((f: any) => {
                const perm = colAccess[f.id];
                return perm !== "hide";
            });
        }

        // Parallelize all remaining data fetches
        const [internalValues, activities] = await Promise.all([
            prisma.internalValue.findMany({
                where: {
                    responseId: { in: responses.map(r => r.id) },
                    columnId: { in: processedInternalColumns.map(c => c.id) }
                }
            }),
            prisma.formActivity.findMany({
                where: { responseId: { in: responses.map(r => r.id) } },
                orderBy: { createdAt: "desc" }
            })
        ]);

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
            visibleToUsersData: allUserIds.map((uid: string) => ({
                id: uid,
                ...(usersMap[uid] || { email: "Unknown", name: "User", imageUrl: "" })
            }))
        };

        return NextResponse.json({
            responses,
            totalCount: totalResponses,
            filteredCount: filteredTotalCount,
            page,
            limit,
            totalPages: Math.ceil(filteredTotalCount / limit),
            form: enrichedForm,
            internalColumns: processedInternalColumns,
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

        const isMaster = userRole === "ADMIN" || userRole === "MASTER" || userRole === "TL";
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
        let bulk = searchParams.get("bulk"); // comma separated list of IDs

        let ids: string[] = [];
        if (bulk) {
            ids = bulk.split(",");
        } else if (responseId) {
            ids = [responseId];
        } else {
            // Check body for bulk delete
            try {
                const body = await req.json();
                if (body.ids && Array.isArray(body.ids)) {
                    ids = body.ids;
                }
            } catch (e) {
                // No body or invalid json, continue
            }
        }

        if (ids.length > 0) {
            await prisma.formResponse.deleteMany({
                where: {
                    id: { in: ids },
                    formId: formId
                }
            });
            return NextResponse.json({ success: true, deleted: ids.length });
        }

        return NextResponse.json({ error: "Missing responseId or bulk parameter" }, { status: 400 });
    } catch (error) {
        console.error("DELETE Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
