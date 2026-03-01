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
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
        const { remark, nextFollowUpDate, followUpStatus } = body;

        if (!remark) {
            return NextResponse.json({ error: "Remark text is required" }, { status: 400 });
        }

        const newRemark = await (prisma as any).formRemark.create({
            data: {
                responseId,
                remark,
                nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                followUpStatus: followUpStatus || "scheduled",
                authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                authorEmail: user.emailAddresses[0].emailAddress,
                createdById: user.id
            }
        });

        // Also add standard FormActivity to log this action
        await prisma.formActivity.create({
            data: {
                responseId,
                userId: user.id,
                userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0].emailAddress.split('@')[0],
                type: "NOTE_ADDED",
                newValue: remark
            }
        });

        // Get the form to find authorized users to notify
        const form = await prisma.dynamicForm.findUnique({
            where: { id },
            select: { title: true, visibleToUsers: true }
        });

        const response = await prisma.formResponse.findUnique({
            where: { id: responseId },
            select: { assignedTo: true } as any
        });

        // Notify assigned users or all authorized users
        const notifyIds = (response as any)?.assignedTo?.length
            ? (response as any).assignedTo
            : (form?.visibleToUsers || []);

        // Filter out the current user who is making the remark
        const recipients = notifyIds.filter((uid: string) => uid !== user.id);

        if (recipients.length > 0) {
            await prisma.notification.createMany({
                data: recipients.map((uid: string) => ({
                    userId: uid,
                    type: "CRM_FOLLOWUP",
                    title: `New Follow-up: ${form?.title || 'CRM Form'}`,
                    content: `${user.firstName || 'A team member'} added a remark: "${remark.substring(0, 50)}${remark.length > 50 ? '...' : ''}"`,
                    formId: id,
                    responseId: responseId
                }))
            });
        }

        // 🚀 CENTRAL AUTOMATION ENGINE: Escalations & Trigger Events
        await processRemarkAutomation({
            responseId,
            remark,
            status: followUpStatus || "scheduled",
            userId: user.id,
            userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Staff",
            formId: id
        });

        // SYNC TO CRM TABLE (Update Internal Values)
        const remarkCols = await prisma.internalColumn.findMany({
            where: {
                formId: id,
                label: { in: ["Recent Remark", "Next Follow-up Date", "Follow-up Status"] }
            }
        });

        const remarkCol = remarkCols.find(c => c.label === "Recent Remark");
        const followupCol = remarkCols.find(c => c.label === "Next Follow-up Date");
        const statusCol = remarkCols.find(c => c.label === "Follow-up Status");

        if (remarkCol) {
            await (prisma as any).internalValue.upsert({
                where: { responseId_columnId: { responseId, columnId: remarkCol.id } } as any,
                update: { value: remark, updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" },
                create: { responseId, columnId: remarkCol.id, value: remark, updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" }
            });
        }

        if (followupCol && nextFollowUpDate) {
            await (prisma as any).internalValue.upsert({
                where: { responseId_columnId: { responseId, columnId: followupCol.id } } as any,
                update: { value: String(nextFollowUpDate), updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" },
                create: { responseId, columnId: followupCol.id, value: String(nextFollowUpDate), updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" }
            });
        }

        if (statusCol && followUpStatus) {
            await (prisma as any).internalValue.upsert({
                where: { responseId_columnId: { responseId, columnId: statusCol.id } } as any,
                update: { value: followUpStatus, updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" },
                create: { responseId, columnId: statusCol.id, value: followUpStatus, updatedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "System" }
            });
        }

        return NextResponse.json({ success: true, remark: newRemark });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
