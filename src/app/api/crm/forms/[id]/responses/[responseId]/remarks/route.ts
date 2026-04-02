import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { processRemarkAutomation } from "@/lib/automation";
import { emitMatrixUpdate } from "@/lib/socket-server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string, responseId: string } }
) {
    try {
        const { id, responseId } = await params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const remarks = await (prisma as any).formRemark.findMany({
            where: { responseId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ remarks });
    } catch (error: any) {
        console.error("Remarks API Error:", error); return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string, responseId: string } }
) {
    try {
        const { id, responseId } = await params;
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { remark, nextFollowUpDate, followUpStatus, leadStatus, columnId } = body;

        if (!remark) {
            return NextResponse.json({ error: "Remark text is required" }, { status: 400 });
        }

        const cleanedFormId = id.trim();
        const cleanedResponseId = responseId.trim();

        let newRemark;
        try {
            newRemark = await (prisma as any).formRemark.create({
                data: {
                    responseId: cleanedResponseId,
                    remark,
                    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                    followUpStatus: followUpStatus || null,
                    leadStatus: leadStatus || null,
                    columnId: columnId?.trim() || null,
                    authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                    authorEmail: user.emailAddresses[0].emailAddress,
                    createdById: user.id
                }
            });
        } catch (e: any) {
            if (e.message.includes("columnId")) {
                newRemark = await (prisma as any).formRemark.create({
                    data: {
                        responseId: cleanedResponseId,
                        remark,
                        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                        followUpStatus: followUpStatus || null,
                        authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                        authorEmail: user.emailAddresses[0].emailAddress,
                        createdById: user.id
                    }
                });
            }
        }
        
        // 🚀 CRITICAL PERFORMANCE ENGINE: Mark response as touched
        await prisma.formResponse.update({
            where: { id: cleanedResponseId },
            data: { isTouched: true }
        });

        // Broad-Spectrum Sync (Automation + Lifecycle)
        await Promise.all([
            prisma.formActivity.create({
                data: {
                    responseId: cleanedResponseId, userId: user.id,
                    userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Staff",
                    type: "NOTE_ADDED", newValue: remark, columnName: columnId ? "Status Update" : "Remark"
                }
            }),
            processRemarkAutomation({
                responseId: cleanedResponseId, remark, status: followUpStatus || null,
                userId: user.id, userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Staff", formId: cleanedFormId
            })
        ]);

        // 🛡️ FINANCIAL & TAXONOMY SYNC (STAYING ACCURATE)
        // Fetch ALL internal columns for this form to ensure we find any variations in naming
        const remarkCols = await prisma.internalColumn.findMany({
            where: { formId: cleanedFormId }
        });

        const syncToLabelGroup = async (targetLabels: string[], val: string) => {
            if (!val) return;
            const targetLower = targetLabels.map(l => l.toLowerCase().trim());
            
            // Find all columns that match any of the target labels
            const matchedCols = remarkCols.filter(c => {
                const label = c.label.toLowerCase().trim();
                return targetLower.includes(label);
            });

            for (const col of matchedCols) {
                const existing = await (prisma as any).internalValue.findFirst({ where: { responseId: cleanedResponseId, columnId: col.id } });
                if (existing) {
                    await (prisma as any).internalValue.update({ where: { id: existing.id }, data: { value: val.trim(), updatedByName: user.firstName || "System" } });
                } else {
                    await (prisma as any).internalValue.create({ data: { responseId: cleanedResponseId, columnId: col.id, value: val.trim(), updatedByName: user.firstName || "System" } });
                }
            }
        };

        const followUpStatusTrimmed = (followUpStatus || "").trim();
        const leadStatusTrimmed = (leadStatus || "").trim();
        const syncTasks: Promise<void>[] = [];

        // 🎯 Calling/Follow-up Status Sync
        if (followUpStatusTrimmed) {
            syncTasks.push(syncToLabelGroup(
                ["Calling Status", "CALLING STATUS", "Follow-up Status", "Follow up Status", "Followup Status", "Status", "STATUS"], 
                followUpStatusTrimmed
            ));
        }

        // 🎯 Lead Status Sync
        if (leadStatusTrimmed) {
            syncTasks.push(syncToLabelGroup(
                ["Lead Status", "LEAD STATUS", "Lead Stauts", "L_STATUS"], 
                leadStatusTrimmed
            ));
        }

        // 🎯 Remark Sync: Only actual notes go here, NO status info
        const remarkToSync = (remark || "").replace(/Status interaction:\s*.*/gi, '').trim();
        if (remarkToSync) {
            syncTasks.push(syncToLabelGroup(
                ["Recent Remark", "RECENT REMARK", "Remark", "Remarks", "Interaction Notes", "Note", "Notes"], 
                remarkToSync
            ));
        }
        
        // 🎯 Date Sync
        if (nextFollowUpDate) {
            syncTasks.push(syncToLabelGroup(
                ["Next Follow-up Date", "Next Interaction", "Follow up Date", "CALLING DATE", "NEXT DATE", "Followup Date", "Next Follow up Date"], 
                String(nextFollowUpDate)
            ));
        }
        
        // 📅 CLOCK SYNC (Stamp TODAY's date for calling date columns)
        const todayStr = new Date().toISOString().split('T')[0];
        const callingDateCols = remarkCols.filter(c => {
            const l = c.label.toLowerCase();
            return l.includes("calling date") || l.includes("today calling") || l.includes("last called");
        });
        callingDateCols.forEach(col => {
            syncTasks.push(syncToLabelGroup([col.label], todayStr));
        });

        // Execute all syncs in parallel
        await Promise.all(syncTasks);

        // 🚀 THE FINALE: BROADCAST TO MATRIX ⚡⚡⚡
        console.log("🔥 API HIT HOI");
        // Don't await matrix update if it's not critical for the response return
        emitMatrixUpdate({ 
            formId: cleanedFormId, 
            responseId: cleanedResponseId, 
            type: "REMARK_ADDED" 
        }); 

        return NextResponse.json({ success: true, remark: newRemark });
    } catch (error: any) {
        console.error("Remarks API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string; responseId: string }> }
) {
    try {
        const { id, responseId } = await context.params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const url = new URL(req.url);
        const remarkId = url.searchParams.get("remarkId");
        if (!remarkId) return NextResponse.json({ error: "Remark ID required" }, { status: 400 });
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser || (dbUser.role !== 'MASTER' && dbUser.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const cleanedResponseId = responseId.trim();
        await (prisma as any).formRemark.delete({ where: { id: remarkId } });
        
        // 🚀 SYNC BACK: Check if any remarks remain to reset touched state
        const remainingRemarks = await (prisma as any).formRemark.count({ where: { responseId: cleanedResponseId } });
        if (remainingRemarks === 0) {
            await prisma.formResponse.update({
                where: { id: cleanedResponseId },
                data: { isTouched: false }
            });
        }

        console.log("Triggering Real-time Delete Sync Shard... 🛰️");
        await emitMatrixUpdate(); // Sync on delete too! 🛰️ (MUST AWAIT ON VERCEL)
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Remarks API Error:", error); return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
