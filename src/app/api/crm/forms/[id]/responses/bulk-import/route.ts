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
        const { data, matchColumnId, updateColumnMap, isInternalMatch } = body as {
            data: Record<string, string>[];
            matchColumnId: string;
            updateColumnMap: Record<string, { id: string; isInternal: boolean }>;
            isInternalMatch: boolean;
        };

        if (!data || data.length === 0 || !matchColumnId) {
            return NextResponse.json({ error: "Invalid data or match column missing" }, { status: 400 });
        }

        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "User";

        let successCount = 0;
        let errors: string[] = [];

        // For faster mapping
        const processedInternalColumns = await prisma.internalColumn.findMany({ where: { formId } });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const matchValue = row[matchColumnId]?.toString().trim();
            if (!matchValue) {
                errors.push(`Row ${i + 1}: Missing match value`);
                continue;
            }

            try {
                // Find response by matchColumn
                let responseIdToUpdate: string | null = null;

                if (isInternalMatch) {
                    const matchRec = await prisma.internalValue.findFirst({
                        where: {
                            columnId: matchColumnId,
                            value: { equals: matchValue, mode: 'insensitive' },
                            response: { formId: formId }
                        },
                        select: { responseId: true }
                    });
                    if (matchRec) responseIdToUpdate = matchRec.responseId;
                } else {
                    const matchRec = await prisma.responseValue.findFirst({
                        where: {
                            fieldId: matchColumnId,
                            value: { equals: matchValue, mode: 'insensitive' },
                            response: { formId: formId }
                        },
                        select: { responseId: true }
                    });
                    if (matchRec) responseIdToUpdate = matchRec.responseId;
                }

                if (!responseIdToUpdate) {
                    errors.push(`Row ${i + 1} (${matchValue}): Record not found in database`);
                    continue;
                }

                // Apply Updates via Transaction
                await prisma.$transaction(async (tx) => {
                    for (const headerKey in updateColumnMap) {
                        if (headerKey === matchColumnId) continue;

                        const mapping = updateColumnMap[headerKey];
                        if (!mapping) continue;

                        // Check if the explicitly mapped header exists on the uploaded row
                        if (row[headerKey] === undefined) continue;

                        let valueToMap = row[headerKey]?.toString() || "";
                        const colIdToUpdate = mapping.id;
                        const isColInternal = mapping.isInternal;

                        let oldValue = "";
                        let colName = headerKey;

                        if (isColInternal) {
                            // Find the column setup
                            const internalCol = processedInternalColumns.find((c: any) => c.id === colIdToUpdate);
                            colName = internalCol?.label || headerKey;

                            // Auto-transform Excel Date (serial number) to ISO if it's a date col
                            if (internalCol?.type === 'date' && valueToMap && !isNaN(Number(valueToMap))) {
                                const excelEpoch = new Date(1899, 11, 30);
                                const parsedDate = new Date(excelEpoch.getTime() + Number(valueToMap) * 86400000);
                                if (!isNaN(parsedDate.getTime())) {
                                    valueToMap = parsedDate.toISOString();
                                }
                            }

                            const existing = await tx.internalValue.findFirst({
                                where: { responseId: responseIdToUpdate, columnId: colIdToUpdate }
                            });
                            oldValue = existing?.value || "";

                            if (existing) {
                                await tx.internalValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                });
                            } else {
                                await tx.internalValue.create({
                                    data: { responseId: responseIdToUpdate!, columnId: colIdToUpdate, value: valueToMap, updatedBy: user.id, updatedByName: userName }
                                });
                            }
                        } else {
                            const existing = await tx.responseValue.findFirst({
                                where: { responseId: responseIdToUpdate!, fieldId: colIdToUpdate }
                            });
                            oldValue = existing?.value || "";

                            if (existing) {
                                await tx.responseValue.update({
                                    where: { id: existing.id },
                                    data: { value: valueToMap }
                                });
                            } else {
                                await tx.responseValue.create({
                                    data: { responseId: responseIdToUpdate!, fieldId: colIdToUpdate, value: valueToMap }
                                });
                            }
                        }

                        // Activity log for column change
                        if (oldValue !== valueToMap) {
                            await tx.formActivity.create({
                                data: {
                                    responseId: responseIdToUpdate!,
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
                console.error(`Error updating row ${i + 1} (${matchValue}):`, err);
                errors.push(`Row ${i + 1} (${matchValue}): ${err.message || 'Error updating'}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${successCount} records.`,
            errors: errors.length > 0 ? errors : undefined,
            successCount,
            errorCount: errors.length
        });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
