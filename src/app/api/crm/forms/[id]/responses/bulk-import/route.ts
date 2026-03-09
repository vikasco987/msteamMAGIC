import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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

        if (userRole !== "ADMIN" && userRole !== "MASTER" && userRole !== "PURE_MASTER") {
            return NextResponse.json({ error: "Forbidden: Only admins can bulk update responses" }, { status: 403 });
        }

        const body = await req.json();
        const { data, matchColumnId, matchExcelHeader, updateColumnMap, isInternalMatch, importMode = 'update' } = body as {
            data: Record<string, string>[];
            matchColumnId: string;
            matchExcelHeader: string;
            updateColumnMap: Record<string, { id: string; isInternal: boolean }>;
            isInternalMatch: boolean;
            importMode?: 'update' | 'create';
        };

        if (!data || data.length === 0 || (importMode === 'update' && !matchColumnId)) {
            return NextResponse.json({ error: "Invalid data or match column missing" }, { status: 400 });
        }

        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "User";

        let successCount = 0;
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

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const matchValue = importMode === 'update' ? row[matchExcelHeader]?.toString().trim() : null;

            if (importMode === 'update' && !matchValue) {
                errors.push(`Row ${i + 1}: Missing match value`);
                continue;
            }

            try {
                let responseIdToUpdate: string | null = null;

                if (importMode === 'update') {
                    // Smart Fuzzy Matching logic for Phone/Emails with spaces
                    const searchValLower = matchValue!.toLowerCase();
                    const searchNorm = searchValLower.replace(/[^a-z0-9]/g, "");

                    // 1. Exact match (ignoring case and outer spaces)
                    let matched = allCurrentValues.find(v => (v.value || "").trim().toLowerCase() === searchValLower);

                    // 2. Normalised match (no spaces/symbols)
                    if (!matched && searchNorm) {
                        matched = allCurrentValues.find(v => (v.value || "").replace(/[^a-z0-9]/g, "").toLowerCase() === searchNorm);
                    }

                    // 3. Fallback for Phone Numbers (if at least 10 digits, match last 10 digits precisely, ignoring +91 etc)
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
                        errors.push(`Row ${i + 1} (${matchValue}): Record not found in database`);
                        continue;
                    }
                }

                // Apply Updates via Transaction
                await prisma.$transaction(async (tx) => {
                    let finalResponseId = responseIdToUpdate;

                    if (importMode === 'create') {
                        // Create new response
                        const newResp = await tx.formResponse.create({
                            data: {
                                formId,
                                submittedBy: user.id,
                                submittedByName: userName,
                                submittedAt: new Date(),
                                assignedTo: [user.id]
                            }
                        });
                        finalResponseId = newResp.id;

                        // Activity log for row creation
                        await tx.formActivity.create({
                            data: {
                                responseId: finalResponseId,
                                userId: user.id,
                                userName: userName,
                                type: "BULK_IMPORT_CREATE",
                                columnName: "System",
                                oldValue: "None",
                                newValue: "New Record via Bulk Upload"
                            }
                        });
                    }

                    for (const headerKey in updateColumnMap) {
                        if (importMode === 'update' && headerKey === matchExcelHeader) continue;

                        const mapping = updateColumnMap[headerKey];
                        if (!mapping) continue;

                        // Check if the explicitly mapped header exists on the uploaded row
                        if (row[headerKey] === undefined) continue;

                        let valueToMap = row[headerKey]?.toString() || "";
                        const colIdToUpdate = mapping.id;
                        const isColInternal = mapping.isInternal;

                        let oldValue = "";
                        let colName = headerKey;

                        // Special Column: Assigned To
                        if (colIdToUpdate === "__assigned") {
                            const foundUser = findUser(valueToMap);
                            if (foundUser) {
                                await tx.formResponse.update({
                                    where: { id: finalResponseId! },
                                    data: { assignedTo: { set: [foundUser.clerkId] } }
                                });
                            }
                            continue; // Move to next field
                        }

                        if (isColInternal) {
                            // Find the column setup
                            const internalCol = processedInternalColumns.find((c: any) => c.id === colIdToUpdate);
                            colName = internalCol?.label || headerKey;

                            // Handle user type column
                            if (internalCol?.type === 'user') {
                                const foundUser = findUser(valueToMap);
                                if (foundUser) valueToMap = foundUser.clerkId;
                            }

                            // Handle Dropdown label matching if options are present
                            if (internalCol?.type === 'dropdown' && internalCol.options) {
                                const opts = internalCol.options as any[];
                                const matchedOpt = opts.find((o: any) => o.label?.toLowerCase() === valueToMap.toLowerCase());
                                if (matchedOpt) valueToMap = matchedOpt.label;
                            }

                            // Auto-transform Excel Date (serial number) to ISO if it's a date col
                            if (internalCol?.type === 'date' && valueToMap && !isNaN(Number(valueToMap))) {
                                const excelEpoch = new Date(1899, 11, 30);
                                const parsedDate = new Date(excelEpoch.getTime() + Number(valueToMap) * 86400000);
                                if (!isNaN(parsedDate.getTime())) {
                                    valueToMap = parsedDate.toISOString();
                                }
                            }

                            if (importMode === 'create') {
                                await tx.internalValue.create({
                                    data: { responseId: finalResponseId!, columnId: colIdToUpdate, value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                });
                            } else {
                                const existing = await tx.internalValue.findFirst({
                                    where: { responseId: finalResponseId!, columnId: colIdToUpdate }
                                });
                                oldValue = existing?.value || "";

                                if (existing) {
                                    await tx.internalValue.update({
                                        where: { id: existing.id },
                                        data: { value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                    });
                                } else {
                                    await tx.internalValue.create({
                                        data: { responseId: finalResponseId!, columnId: colIdToUpdate, value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                    });
                                }
                            }
                        } else {
                            if (importMode === 'create') {
                                await tx.responseValue.create({
                                    data: { responseId: finalResponseId!, fieldId: colIdToUpdate, value: valueToMap }
                                });
                            } else {
                                const existing = await tx.responseValue.findFirst({
                                    where: { responseId: finalResponseId!, fieldId: colIdToUpdate }
                                });
                                oldValue = existing?.value || "";

                                if (existing) {
                                    await tx.responseValue.update({
                                        where: { id: existing.id },
                                        data: { value: valueToMap }
                                    });
                                } else {
                                    await tx.responseValue.create({
                                        data: { responseId: finalResponseId!, fieldId: colIdToUpdate, value: valueToMap }
                                    });
                                }
                            }
                        }

                        // Activity log for column change
                        if (importMode === 'update' && oldValue !== valueToMap) {
                            await tx.formActivity.create({
                                data: {
                                    responseId: finalResponseId!,
                                    userId: user.id,
                                    userName: userName,
                                    type: "BULK_IMPORT_UPDATE",
                                    columnName: colName,
                                    oldValue: oldValue,
                                    newValue: valueToMap
                                }
                            });
                        }
                    }
                });

                successCount++;
            } catch (err: any) {
                console.error(`Error processing row ${i + 1}:`, err);
                errors.push(`Row ${i + 1}: ${err.message || 'Error processing'}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${successCount} records.`,
            errors: errors.length > 0 ? errors : undefined,
            successCount,
            errorCount: errors.length
        });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
