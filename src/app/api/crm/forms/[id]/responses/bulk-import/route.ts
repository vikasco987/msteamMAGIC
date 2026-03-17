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
        
        const isMaster = userRole === "ADMIN" || userRole === "MASTER" || userRole === "PURE_MASTER" || userRole === "TL";
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
            disableActivityLogs?: boolean;
        };

        const { data, matchColumnId, matchExcelHeader, updateColumnMap, isInternalMatch, importMode = 'update', disableActivityLogs = false } = payload;

        if (!data || data.length === 0 || ((importMode === 'update' || importMode === 'upsert') && !matchColumnId)) {
            return NextResponse.json({ error: "Invalid data or match column missing" }, { status: 400 });
        }

        let successCount = 0;
        let createdCount = 0;
        let updatedCount = 0;
        let errors: string[] = [];

        // For faster mapping
        const processedInternalColumns = await prisma.internalColumn.findMany({ where: { formId } });
        const intColMap = new Map(processedInternalColumns.map(c => [c.id, c]));
        const allSystemUsers = await prisma.user.findMany({ select: { clerkId: true, name: true, email: true } });

        // Pre-index users for fast lookup
        const userByName = new Map<string, string>();
        const userByEmail = new Map<string, string>();
        for (const u of allSystemUsers) {
            if (u.name) userByName.set(u.name.toLowerCase().trim(), u.clerkId);
            userByEmail.set(u.email.toLowerCase().trim(), u.clerkId);
        }

        const findUser = (val: string) => {
            const v = val.toLowerCase().trim();
            if (!v) return null;
            const byEmail = userByEmail.get(v);
            if (byEmail) return byEmail;
            const byName = userByName.get(v);
            if (byName) return byName;
            
            // Fuzzy name check (only if really needed, but keep it minimal)
            return allSystemUsers.find(u => (u.name || "").toLowerCase().includes(v))?.clerkId || null;
        };

        // Pre-fetch all target values for matching to avoid N queries and support fuzzy matching
        let allCurrentValues: { responseId: string; value: string }[] = [];
        if (importMode === 'update' || importMode === 'upsert') {
            if (isInternalMatch) {
                allCurrentValues = await prisma.internalValue.findMany({
                    where: { columnId: matchColumnId, response: { formId } },
                    select: { responseId: true, value: true }
                });
            } else {
                allCurrentValues = await prisma.responseValue.findMany({
                    where: { fieldId: matchColumnId, response: { formId } },
                    select: { responseId: true, value: true }
                });
            }
        }

        // Index all current values for ultra-fast $O(1)$ lookups
        const exactMap = new Map<string, string>();
        const normMap = new Map<string, string>();
        const phoneMap = new Map<string, string>();

        for (const v of allCurrentValues) {
            const val = (v.value || "").trim().toLowerCase();
            const norm = val.replace(/[^a-z0-9]/g, "");
            
            if (val && !exactMap.has(val)) exactMap.set(val, v.responseId);
            if (norm && !normMap.has(norm)) normMap.set(norm, v.responseId);
            if (norm.length >= 10 && /^\d+$/.test(norm)) {
                const last10 = norm.slice(-10);
                if (!phoneMap.has(last10)) phoneMap.set(last10, v.responseId);
            }
        }

        // COLLECT ALL MATCHED RESPONSE IDs FIRST (To pre-fetch values)
        const matchedResponseIds: string[] = [];
        if (importMode === 'update' || importMode === 'upsert') {
            for (const row of data) {
                const matchValue = row[matchExcelHeader]?.toString().trim()?.toLowerCase() || "";
                if (!matchValue) continue;

                const norm = matchValue.replace(/[^a-z0-9]/g, "");

                let matchedId = exactMap.get(matchValue);
                if (!matchedId && norm) matchedId = normMap.get(norm);
                if (!matchedId && norm.length >= 10 && /^\d+$/.test(norm)) matchedId = phoneMap.get(norm.slice(-10));
                
                if (matchedId) matchedResponseIds.push(matchedId);
            }
        }

        // PRE-FETCH ALL VALUES FOR THESE RESPONSES
        const [existingInternalValues, existingResponseValues] = await Promise.all([
            prisma.internalValue.findMany({ where: { responseId: { in: matchedResponseIds } } }),
            prisma.responseValue.findMany({ where: { responseId: { in: matchedResponseIds } } })
        ]);

        const intValMap = new Map(existingInternalValues.map(v => [`${v.responseId}_${v.columnId}`, v]));
        const respValMap = new Map(existingResponseValues.map(v => [`${v.responseId}_${v.fieldId}`, v]));

        // Helper to run batches
        // Helper to generate Mongo IDs if needed
        const generateId = () => {
            const timestamp = Math.floor(Date.now() / 1000).toString(16);
            const random = Math.random().toString(16).substring(2, 18);
            return (timestamp + random).substring(0, 24);
        };

        // Helper to run batches
        const BATCH_SIZE = 500;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            
            const internalValuesToCreate: any[] = [];
            const responseValuesToCreate: any[] = [];
            const activitiesToCreate: any[] = [];
            const responsesToCreate: any[] = [];
            const individualOps: any[] = [];

            // 1. Identify what to update and what to create
            const batchItems = await Promise.all(batch.map(async (row, idx) => {
                const rowIndex = i + idx;
                let responseId: string | null = null;
                let isNew = false;

                if (importMode === 'update' || importMode === 'upsert') {
                    const matchValueRaw = row[matchExcelHeader]?.toString().trim() || "";
                    const val = matchValueRaw.toLowerCase();
                    const norm = val.replace(/[^a-z0-9]/g, "");

                    let matchedId = exactMap.get(val);
                    if (!matchedId && norm) matchedId = normMap.get(norm);
                    if (!matchedId && norm.length >= 10 && /^\d+$/.test(norm)) matchedId = phoneMap.get(norm.slice(-10));

                    if (matchedId) {
                        responseId = matchedId;
                    } else if (importMode === 'upsert') {
                        isNew = true;
                        responseId = generateId();
                    } else {
                        errors.push(`Row ${rowIndex + 1}: No match found for "${matchValueRaw}"`);
                        return null;
                    }
                } else {
                    isNew = true;
                    responseId = generateId();
                }

                return { row, responseId, isNew, rowIndex };
            }));

            const validItems = batchItems.filter(item => item !== null) as { row: Record<string, string>; responseId: string; isNew: boolean; rowIndex: number }[];
            
            // 2. Queue Response creations
            for (const item of validItems) {
                if (item.isNew) {
                    responsesToCreate.push({
                        id: item.responseId,
                        formId,
                        submittedBy: user.id,
                        submittedByName: userName,
                        submittedAt: new Date(),
                        assignedTo: [user.id]
                    });
                    createdCount++;
                    if (!disableActivityLogs) {
                        activitiesToCreate.push({
                            responseId: item.responseId, userId: user.id, userName: userName,
                            type: "BULK_IMPORT_CREATE", columnName: "System",
                            oldValue: "None", newValue: "New Record via Bulk Upload"
                        });
                    }
                } else {
                    updatedCount++;
                }

                // 3. Build Column Values
                for (const headerKey in updateColumnMap) {
                    if (importMode === 'update' && headerKey === matchExcelHeader) continue;
                    const mapping = updateColumnMap[headerKey];
                    if (!mapping || item.row[headerKey] === undefined) continue;

                    let valueToMap = item.row[headerKey]?.toString() || "";
                    const colIdToUpdate = mapping.id;
                    const isColInternal = mapping.isInternal;

                    if (colIdToUpdate === "__assigned") {
                        const foundUserId = findUser(valueToMap);
                        if (foundUserId) {
                            individualOps.push(prisma.formResponse.update({
                                where: { id: item.responseId },
                                data: { assignedTo: { set: [foundUserId] } }
                            }));
                        }
                        continue;
                    }

                    if (isColInternal) {
                        const internalCol = intColMap.get(colIdToUpdate);
                        if (internalCol?.type === 'user') {
                            const foundUserId = findUser(valueToMap);
                            if (foundUserId) valueToMap = foundUserId;
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

                        const existing = intValMap.get(`${item.responseId}_${colIdToUpdate}`);
                        if (existing) {
                            if (existing.value !== valueToMap) {
                                individualOps.push(prisma.internalValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                }));
                                if (!disableActivityLogs) {
                                    activitiesToCreate.push({
                                        responseId: item.responseId, userId: user.id, userName: userName,
                                        type: "BULK_IMPORT_UPDATE", columnName: internalCol?.label || headerKey,
                                        oldValue: existing.value || "", newValue: valueToMap
                                    });
                                }
                            }
                        } else {
                            internalValuesToCreate.push({
                                responseId: item.responseId, columnId: colIdToUpdate, value: valueToMap,
                                updatedBy: user.id, updatedByName: userName
                            });
                        }
                    } else {
                        const existing = respValMap.get(`${item.responseId}_${colIdToUpdate}`);
                        if (existing) {
                            if (existing.value !== valueToMap) {
                                individualOps.push(prisma.responseValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap }
                                }));
                                if (!disableActivityLogs) {
                                    activitiesToCreate.push({
                                        responseId: item.responseId, userId: user.id, userName: userName,
                                        type: "BULK_IMPORT_UPDATE", columnName: headerKey,
                                        oldValue: existing.value || "", newValue: valueToMap
                                    });
                                }
                            }
                        } else {
                            responseValuesToCreate.push({
                                responseId: item.responseId, fieldId: colIdToUpdate, value: valueToMap
                            });
                        }
                    }
                }
            }

            // 4. Batch Database Operations
            if (responsesToCreate.length > 0) {
                await prisma.formResponse.createMany({ data: responsesToCreate });
            }
            if (internalValuesToCreate.length > 0) {
                await prisma.internalValue.createMany({ data: internalValuesToCreate });
            }
            if (responseValuesToCreate.length > 0) {
                await prisma.responseValue.createMany({ data: responseValuesToCreate });
            }
            if (activitiesToCreate.length > 0) {
                await prisma.formActivity.createMany({ data: activitiesToCreate });
            }
            if (individualOps.length > 0) {
                // Execute updates in parallel batches to avoid overloading
                const updateBatches = [];
                for (let j = 0; j < individualOps.length; j += 50) {
                    updateBatches.push(prisma.$transaction(individualOps.slice(j, j + 50)));
                }
                await Promise.all(updateBatches);
            }

            successCount += validItems.length;
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
