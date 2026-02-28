import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await currentUser();
        const userRole = (user?.publicMetadata?.role as string || "GUEST").toUpperCase();
        const isMaster = userRole === "ADMIN" || userRole === "MASTER";

        // Fetch all responses that have remarks
        // We include form details and values to show customer info
        const responses = await prisma.formResponse.findMany({
            where: {
                remarks: { some: {} }
            },
            include: {
                remarks: { orderBy: { createdAt: "desc" } },
                form: {
                    select: {
                        id: true,
                        title: true,
                        fields: true
                    }
                },
                values: true
            },
            orderBy: { submittedAt: "desc" }
        });

        // If not Master, filter by assignment or visibility
        const filtered = isMaster ? responses : responses.filter(res => {
            const assignees = (res as any).assignedTo || [];
            return res.submittedBy === userId || assignees.includes(userId);
        });

        return NextResponse.json({
            success: true,
            data: filtered,
            userRole
        });
    } catch (error) {
        console.error("Follow-up Board API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
