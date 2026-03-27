import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { processRemarkAutomation } from "@/lib/automation";

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
                    followUpStatus: followUpStatus || "scheduled",
                    leadStatus: leadStatus || null,
                    columnId: columnId?.trim() || null,
                    authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                    authorEmail: user.emailAddresses[0].emailAddress,
                    createdById: user.id
                }
            });
        } catch (e: any) {
            if (e.message.includes("columnId")) {
                console.warn("Retrying remark without columnId due to client sync issues...");
                newRemark = await (prisma as any).formRemark.create({
                    data: {
                        responseId: cleanedResponseId,
                        remark,
                        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                        followUpStatus: followUpStatus || "scheduled",
                        authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                        authorEmail: user.emailAddresses[0].emailAddress,
                        createdById: user.id
                    }
                });
            } else {
                throw e;
            }
        }

        // Log action in Activity
        await prisma.formActivity.create({
            data: {
                responseId: cleanedResponseId,
                userId: user.id,
                userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                type: "NOTE_ADDED",
                newValue: remark,
                columnName: columnId ? "Status Update" : "Remark"
            }
        });

        const form = await prisma.dynamicForm.findUnique({
            where: { id: cleanedFormId },
            select: { title: true, visibleToUsers: true }
        });

        const responseObj = await prisma.formResponse.findUnique({
            where: { id: cleanedResponseId },
            select: { assignedTo: true } as any
        });

        const notifyIds = (responseObj as any)?.assignedTo?.length
            ? (responseObj as any).assignedTo
            : (form?.visibleToUsers || []);

        const recipients = notifyIds.filter((uid: string) => uid !== user.id);

        if (recipients.length > 0) {
            // Sequential to avoid createMany issues on some MongoDB versions
            for (const uid of recipients) {
                await prisma.notification.create({
                    data: {
                        userId: uid,
                        type: "CRM_FOLLOWUP",
                        title: `New Follow-up: ${form?.title || 'Form'}`,
                        content: `${user.firstName || 'Staff'} added a remark: "${remark.substring(0, 40)}..."`,
                        formId: cleanedFormId,
                        responseId: cleanedResponseId
                    }
                });
            }
        }

        await processRemarkAutomation({
            responseId: cleanedResponseId,
            remark,
            status: followUpStatus || "scheduled",
            userId: user.id,
            userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Staff",
            formId: cleanedFormId
        });

        // Sync to Internal Values (Manual Upsert for MongoDB robustness)
        const remarkCols = await prisma.internalColumn.findMany({
            where: {
                formId: cleanedFormId,
                label: { in: ["Recent Remark", "Next Follow-up Date", "Follow-up Status", "Lead Status"] }
            }
        });

        const syncToValue = async (colLabel: string, val: string) => {
            const col = remarkCols.find(c => c.label === colLabel);
            if (!col) return;
            
            const existing = await (prisma as any).internalValue.findFirst({
                where: { responseId: cleanedResponseId, columnId: col.id }
            });

            if (existing) {
                await (prisma as any).internalValue.update({
                    where: { id: existing.id },
                    data: { value: val, updatedByName: user.firstName || "System" }
                });
            } else {
                await (prisma as any).internalValue.create({
                    data: { responseId: cleanedResponseId, columnId: col.id, value: val, updatedByName: user.firstName || "System" }
                });
            }
        };

        await syncToValue("Recent Remark", remark);
        if (nextFollowUpDate) await syncToValue("Next Follow-up Date", String(nextFollowUpDate));
        
        if (followUpStatus && !columnId) {
            await syncToValue("Follow-up Status", followUpStatus);
        }

        if (leadStatus) {
            await syncToValue("Lead Status", leadStatus);
        }

        // Sync to specific custom column if provided
        if (columnId && followUpStatus) {
            const existingCustom = await (prisma as any).internalValue.findFirst({
                where: { responseId: cleanedResponseId, columnId: columnId.trim() }
            });
            if (existingCustom) {
                await (prisma as any).internalValue.update({
                    where: { id: existingCustom.id },
                    data: { value: followUpStatus, updatedByName: user.firstName || "System" }
                });
            } else {
                await (prisma as any).internalValue.create({
                    data: { responseId: cleanedResponseId, columnId: columnId.trim(), value: followUpStatus, updatedByName: user.firstName || "System" }
                });
            }
        }

        return NextResponse.json({ success: true, remark: newRemark });
    } catch (error: any) {
        console.error("Remarks API Error:", error); return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string, responseId: string } }
) {
    try {
        const { id, responseId } = await params;
        const { userId } = await auth();

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const remarkId = url.searchParams.get("remarkId");

        if (!remarkId) {
            return NextResponse.json({ error: "Remark ID required" }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser || (dbUser.role !== 'MASTER' && dbUser.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Forbidden: Only Admins can delete remarks" }, { status: 403 });
        }

        await (prisma as any).formRemark.delete({
            where: { id: remarkId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Remarks API Error:", error); return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
