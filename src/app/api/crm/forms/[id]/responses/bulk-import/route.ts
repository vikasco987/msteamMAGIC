import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const maxDuration = 300; // Allow 5 minutes for large bulk imports

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: formId } = await params;
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Requires Master/Admin check
        const metaRole = (user?.publicMetadata?.role as string || "").toUpperCase();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
        const dbRole = (dbUser?.role || "").toUpperCase();
        const userRole = (metaRole || dbRole || "GUEST").toUpperCase();

        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "User";
        
        const isMaster = userRole === "ADMIN" || userRole === "MASTER" || userRole === "PURE_MASTER";
        const isStaff = isMaster || userRole === "TL" || userRole === "SELLER" || userRole === "MANAGER";

        if (!isStaff) {
            console.error(`Forbidden bulk-import attempt by ${user.id} (${userName}) with role ${userRole}`);
            return NextResponse.json({ error: `Forbidden: You do not have permission for bulk operations (Current Role: ${userRole})` }, { status: 403 });
        }

        console.log(`Starting bulk import for form ${formId} by ${userName} (${userRole})`);

        const body = await req.json();
        const payload = body as {
            data: Record<string, string>[];
            matchColumnId: string;
            matchExcelHeader: string;
            updateColumnMap: Record<string, { id: string; isInternal: boolean }>;
            isInternalMatch: boolean;
            importMode?: 'update' | 'create' | 'upsert';
        };

        const { data, matchColumnId, matchExcelHeader, updateColumnMap, isInternalMatch, importMode = 'update' } = payload;

        if (!data || data.length === 0 || ((importMode === 'update' || importMode === 'upsert') && !matchColumnId)) {
            return NextResponse.json({ error: "Invalid data or match column missing" }, { status: 400 });
        }

        let successCount = 0;
        let createdCount = 0;
        let updatedCount = 0;
        let errors: string[] = [];

        // For faster mapping
        const processedInternalColumns = await prisma.internalColumn.findMany({ where: { formId } });
        const allSystemUsers = await prisma.user.findMany({ select: { clerkId: true, name: true, email: true } });

        // Helper to find user by name or email
        const findUser = (val: string) => {
            const v = val.toLowerCase().trim();
            if (!v) return null;
            return allSystemUsers.find(u =>
                (u.name || "").toLowerCase() === v ||
                u.email.toLowerCase() === v ||
                (u.name || "").toLowerCase().includes(v)
            );
        };

        // Pre-fetch all target values for matching to avoid N queries and support fuzzy matching
        let allCurrentValues: { responseId: string; value: string }[] = [];
        if (importMode === 'update') {
            if (isInternalMatch) {
                const recs = await prisma.internalValue.findMany({
                    where: { columnId: matchColumnId, response: { formId } },
                    select: { responseId: true, value: true }
                });
                allCurrentValues = recs;
            } else {
                const recs = await prisma.responseValue.findMany({
                    where: { fieldId: matchColumnId, response: { formId } },
                    select: { responseId: true, value: true }
                });
                allCurrentValues = recs;
            }
        }

        // COLLECT ALL MATCHED RESPONSE IDs FIRST (To pre-fetch values)
        const matchedResponseIds: string[] = [];
        if (importMode === 'update' || importMode === 'upsert') {
            for (const row of data) {
                const matchValue = row[matchExcelHeader]?.toString().trim()?.toLowerCase() || "";
                if (!matchValue) continue;

                const searchNorm = matchValue.replace(/[^a-z0-9]/g, "");

                let matched = allCurrentValues.find(v => (v.value || "").trim().toLowerCase() === matchValue);
                if (!matched && searchNorm) matched = allCurrentValues.find(v => (v.value || "").replace(/[^a-z0-9]/g, "").toLowerCase() === searchNorm);
                if (!matched && searchNorm.length >= 10 && /^\d+$/.test(searchNorm)) {
                    const last10 = searchNorm.slice(-10);
                    matched = allCurrentValues.find(v => {
                        const vNorm = (v.value || "").replace(/[^a-z0-9]/g, "").toLowerCase();
                        return /^\d+$/.test(vNorm) && vNorm.length >= 10 && vNorm.slice(-10) === last10;
                    });
                }
                if (matched) matchedResponseIds.push(matched.responseId);
            }
        }

        // PRE-FETCH ALL VALUES FOR THESE RESPONSES
        const [existingInternalValues, existingResponseValues] = await Promise.all([
            prisma.internalValue.findMany({ where: { responseId: { in: matchedResponseIds } } }),
            prisma.responseValue.findMany({ where: { responseId: { in: matchedResponseIds } } })
        ]);

        const intValMap = new Map(existingInternalValues.map(v => [`${v.responseId}_${v.columnId}`, v]));
        const respValMap = new Map(existingResponseValues.map(v => [`${v.responseId}_${v.fieldId}`, v]));

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const matchValue = importMode === 'update' ? row[matchExcelHeader]?.toString().trim() : null;

            if (importMode === 'update' && !matchValue) {
                errors.push(`Row ${i + 1}: Missing match value`);
                continue;
            }

            try {
                let responseIdToUpdate: string | null = null;

                if (importMode === 'update' || importMode === 'upsert') {
                    const matchValueRaw = row[matchExcelHeader]?.toString().trim() || "";
                    const searchValLower = matchValueRaw.toLowerCase();
                    const searchNorm = searchValLower.replace(/[^a-z0-9]/g, "");

                    let matched = allCurrentValues.find(v => (v.value || "").trim().toLowerCase() === searchValLower);
                    if (!matched && searchNorm) matched = allCurrentValues.find(v => (v.value || "").replace(/[^a-z0-9]/g, "").toLowerCase() === searchNorm);
                    if (!matched && searchNorm.length >= 10 && /^\d+$/.test(searchNorm)) {
                        const last10 = searchNorm.slice(-10);
                        matched = allCurrentValues.find(v => {
                            const vNorm = (v.value || "").replace(/[^a-z0-9]/g, "").toLowerCase();
                            return /^\d+$/.test(vNorm) && vNorm.length >= 10 && vNorm.slice(-10) === last10;
                        });
                    }

                    if (matched) {
                        responseIdToUpdate = matched.responseId;
                    }

                    if (!responseIdToUpdate) {
                        if (((importMode as string) === 'upsert' || (importMode as string) === 'create')) {
                            // Will create below
                        } else {
                            errors.push(`Row ${i + 1}: No match found for "${matchValueRaw}"`);
                            continue;
                        }
                    }
                }

                const rowOps: any[] = [];
                let currentResponseId = responseIdToUpdate;

                // 1. Ensure Response exists
                if (!currentResponseId) {
                    const newResp = await prisma.formResponse.create({
                        data: {
                            formId,
                            submittedBy: user.id,
                            submittedByName: userName,
                            submittedAt: new Date(),
                            assignedTo: [user.id]
                        }
                    });
                    currentResponseId = newResp.id;
                    createdCount++;

                    rowOps.push(prisma.formActivity.create({
                        data: {
                            responseId: currentResponseId,
                            userId: user.id,
                            userName: userName,
                            type: "BULK_IMPORT_CREATE",
                            columnName: "System",
                            oldValue: "None",
                            newValue: "New Record via Bulk Upload"
                        }
                    }));
                } else {
                    updatedCount++;
                }

                // 2. Process Columns for this response
                for (const headerKey in updateColumnMap) {
                    if (importMode === 'update' && headerKey === matchExcelHeader) continue;

                    const mapping = updateColumnMap[headerKey];
                    if (!mapping || row[headerKey] === undefined) continue;

                    let valueToMap = row[headerKey]?.toString() || "";
                    const colIdToUpdate = mapping.id;
                    const isColInternal = mapping.isInternal;

                    // Special Column: Assigned To
                    if (colIdToUpdate === "__assigned") {
                        const foundUser = findUser(valueToMap);
                        if (foundUser) {
                            rowOps.push(prisma.formResponse.update({
                                where: { id: currentResponseId },
                                data: { assignedTo: { set: [foundUser.clerkId] } }
                            }));
                        }
                        continue;
                    }

                    if (isColInternal) {
                        const internalCol = processedInternalColumns.find((c: any) => c.id === colIdToUpdate);
                        if (internalCol?.type === 'user') {
                            const foundUser = findUser(valueToMap);
                            if (foundUser) valueToMap = foundUser.clerkId;
                        }
                        if (internalCol?.type === 'dropdown' && internalCol.options) {
                            const opts = internalCol.options as any[];
                            const matchedOpt = opts.find((o: any) => o.label?.toLowerCase() === valueToMap.toLowerCase());
                            if (matchedOpt) valueToMap = matchedOpt.label;
                        }
                        if (internalCol?.type === 'date' && valueToMap && !isNaN(Number(valueToMap))) {
                            const excelEpoch = new Date(1899, 11, 30);
                            const parsedDate = new Date(excelEpoch.getTime() + Number(valueToMap) * 86400000);
                            if (!isNaN(parsedDate.getTime())) valueToMap = parsedDate.toISOString();
                        }

                        // Use upsert logic if possible or just update/create
                        // To keep it simple and safe (nothing deleted), we'll do individual calls but we can batch them if we want
                        // However, let's stick to a cleaner approach inside the per-row logic for now but optimized
                        
                        // Use the map instead of findFirst to avoid thousands of queries
                        const existing = intValMap.get(`${currentResponseId}_${colIdToUpdate}`);

                        if (existing) {
                            if (existing.value !== valueToMap) {
                                rowOps.push(prisma.internalValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                }));
                                rowOps.push(prisma.formActivity.create({
                                    data: {
                                        responseId: currentResponseId,
                                        userId: user.id,
                                        userName: userName,
                                        type: "BULK_IMPORT_UPDATE",
                                        columnName: internalCol?.label || headerKey,
                                        oldValue: existing.value || "",
                                        newValue: valueToMap
                                    }
                                }));
                            }
                        } else {
                            rowOps.push(prisma.internalValue.create({
                                data: { responseId: currentResponseId, columnId: colIdToUpdate, value: valueToMap, updatedBy: user.id, updatedByName: userName }
                            }));
                        }
                    } else {
                        const existing = respValMap.get(`${currentResponseId}_${colIdToUpdate}`);

                        if (existing) {
                            if (existing.value !== valueToMap) {
                                rowOps.push(prisma.responseValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap }
                                }));
                                rowOps.push(prisma.formActivity.create({
                                    data: {
                                        responseId: currentResponseId,
                                        userId: user.id,
                                        userName: userName,
                                        type: "BULK_IMPORT_UPDATE",
                                        columnName: headerKey,
                                        oldValue: existing.value || "",
                                        newValue: valueToMap
                                    }
                                }));
                            }
                        } else {
                            rowOps.push(prisma.responseValue.create({
                                data: { responseId: currentResponseId, fieldId: colIdToUpdate, value: valueToMap }
                            }));
                        }
                    }
                }

                // Execute all ops for this row in one transaction
                if (rowOps.length > 0) {
                    await prisma.$transaction(rowOps);
                }

                successCount++;
            } catch (err: any) {
                console.error(`Error processing row ${i + 1}:`, err);
                errors.push(`Row ${i + 1}: ${err.message || 'Error processing'}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${successCount} records: ${updatedCount} updated, ${createdCount} created.`,
            errors: errors.length > 0 ? errors : undefined,
            successCount,
            createdCount,
            updatedCount,
            errorCount: errors.length
        });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
