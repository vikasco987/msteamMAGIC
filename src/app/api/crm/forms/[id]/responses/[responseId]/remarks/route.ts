import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string, responseId: string } }
) {
    try {
        const { id, responseId } = await params;
        const { userId } = await auth();

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const remarks = await prisma.formRemark.findMany({
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

        const newRemark = await prisma.formRemark.create({
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

        await prisma.formRemark.delete({
            where: { id: remarkId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
