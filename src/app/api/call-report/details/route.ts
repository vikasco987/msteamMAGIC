import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: Request) {
    try {
        const { userId: requesterId } = await auth();
        if (!requesterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const dateParam = searchParams.get("date");
        const type = searchParams.get("type") || "COMBINED";

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        const targetDate = dateParam ? parseISO(dateParam) : new Date();
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // 🛡️ MANUAL DATE PARITY BOOST
        // Fetch Internal Values for 'Calling Date' or 'Interaction Date' columns for today
        const internalCols = await prisma.internalColumn.findMany({
            where: { label: { contains: "Calling", mode: 'insensitive' } } // Target calling date columns
        });
        const colIds = internalCols.map(c => c.id);

        const [remarks, manualDates] = await Promise.all([
            prisma.formRemark.findMany({ 
                where: {
                    createdById: userId,
                    createdAt: { gte: start, lte: end }
                }
            }),
            prisma.internalValue.findMany({
                where: {
                    columnId: { in: colIds },
                    value: { gte: start.toISOString(), lte: end.toISOString() },
                    response: { assignedTo: { has: userId } } // Leads assigned to THIS user
                }
            })
        ]);

        console.log(`Details API: Found ${remarks.length} remarks and ${manualDates.length} manual matches for ${userId}`);

        // Target valid call statuses (EXHAUSTIVE LIST for JS Filtering)
        const targetStatuses = [
            "CALL AGAIN", "CALL DONE", "RNR", "INVALID NUMBER", "SWITCH OFF", "RNR 2", "RNR3", "INCOMING NOT AVAIABLE", "MEETING", "DUPLICATE", "WRONG NUMBER",
            "CALLED", "NOT INTERESTED", "WALKED IN", "FOLLOW-UP DONE", "MISSED", "CLOSED", "WALK-IN SCHEDULED",
            "INTERESTED", "BUSY", "CONNECTED", "ONBOARDED", "ONBOARDING", "PAYMENT PENDING", "FOLLOW UP", "SCHEDULED", "REJECTED"
        ];

        // 2. Identify Unique Leads (Response IDs) based on 'type'
        const responseIdInteractions = new Map<string, { type: 'NEW' | 'FOLLOWUP' }>();
        const processedResponseIds = new Set<string>();

        // 🟢 BRANCH 1: System Interactions
        for (const r of remarks) {
            const respId = r.responseId;
            processedResponseIds.add(respId);

            if (!responseIdInteractions.has(respId)) {
                responseIdInteractions.set(respId, { type: 'FOLLOWUP' });
            }
            if (r.columnId) {
                responseIdInteractions.get(respId)!.type = 'NEW';
            }
        }

        // 🔵 BRANCH 2: Manual Schedules (only if not already remarked)
        for (const m of manualDates) {
            const respId = m.responseId;
            if (processedResponseIds.has(respId)) continue;

            if (!responseIdInteractions.has(respId)) {
                responseIdInteractions.set(respId, { type: 'FOLLOWUP' });
            }
        }

        // Filter based on requested type (NEW, FOLLOWUP, or COMBINED)
        const targetResponseIds = Array.from(responseIdInteractions.entries())
            .filter(([_, info]) => {
                if (type === "COMBINED") return true;
                return info.type === type;
            })
            .map(([id]) => id);

        if (targetResponseIds.length === 0) {
            return NextResponse.json({ forms: [] });
        }

        // 3. Fetch full Response details grouped by Form
        const responses = await prisma.formResponse.findMany({
            where: { id: { in: targetResponseIds } },
            include: {
                form: {
                    include: {
                        fields: true,
                        internalColumns: true
                    }
                },
                values: true,
                internalValues: true,
                remarks: {
                    // Fetch LAST remark for context, preferring the one from today
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Group by form to handle different columns
        const groupedByForm: Record<string, any> = {};

        responses.forEach(res => {
            if (!groupedByForm[res.formId]) {
                groupedByForm[res.formId] = {
                    form: res.form,
                    responses: []
                };
            }
            groupedByForm[res.formId].responses.push({
                id: res.id,
                submittedByName: res.submittedByName,
                submittedAt: res.submittedAt,
                lastStatus: res.remarks[0]?.followUpStatus || "N/A",
                lastRemark: res.remarks[0]?.remark || "",
                interactionDate: res.remarks[0]?.createdAt || res.submittedAt, 
                interactedBy: res.remarks[0]?.authorName || "System", // WHO DID THIS?
                values: res.values.map(v => ({ fieldId: v.fieldId, value: v.value })),
                internalValues: res.internalValues.map(v => ({ columnId: v.columnId, value: v.value }))
            });
        });

        return NextResponse.json({
            forms: Object.values(groupedByForm)
        });

    } catch (e: any) {
        console.error("Call report details API error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
