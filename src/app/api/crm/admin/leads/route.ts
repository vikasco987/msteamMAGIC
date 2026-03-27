import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await currentUser();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        
        const userRole = ((user?.publicMetadata?.role as string) || dbUser?.role || "GUEST").toUpperCase();
        const isMaster = ["ADMIN", "MASTER", "TL"].includes(userRole);

        if (!isMaster) {
            return NextResponse.json({ error: "Forbidden: Admin/TL access only" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;
        const search = searchParams.get("search") || "";
        const formId = searchParams.get("formId");
        const assignedTo = searchParams.get("assignedTo");

        // TL Logic: Only see leads assigned to them or their team
        let teamMemberIds: string[] = [];
        if (userRole === "TL") {
            const members = await prisma.user.findMany({
                where: { leaderId: userId },
                select: { clerkId: true }
            });
            teamMemberIds = [userId, ...members.map(m => m.clerkId)];
        }

        const where: any = {
            ...(formId ? { formId } : {}),
            ...(assignedTo ? { assignedTo: { has: assignedTo } } : {}),
            ...(userRole === "TL" ? {
                OR: [
                    { assignedTo: { hasSome: teamMemberIds } },
                    { submittedBy: { in: teamMemberIds } }
                ]
            } : {}),
            ...(search ? {
                OR: [
                    { submittedByName: { contains: search, mode: 'insensitive' } },
                    { values: { some: { value: { contains: search, mode: 'insensitive' } } } },
                    { internalValues: { some: { value: { contains: search, mode: 'insensitive' } } } }
                ]
            } : {})
        };

        const [total, responses] = await Promise.all([
            prisma.formResponse.count({ where }),
            prisma.formResponse.findMany({
                where,
                include: {
                    form: {
                        select: {
                            id: true,
                            title: true,
                            fields: {
                                take: 2, // Take first 2 fields for "Key Info" display
                                orderBy: { order: 'asc' }
                            }
                        }
                    },
                    values: {
                        take: 5
                    },
                    remarks: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { submittedAt: 'desc' },
                skip,
                take: limit
            })
        ]);

        return NextResponse.json({
            responses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin Leads Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Bulk Reassign API
export async function PATCH(req: NextRequest) {
    try {
        const { userId: currentUserId } = await auth();
        if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids, assignedTo } = await req.json(); // ids: string[], assignedTo: string[]
        if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

        const user = await currentUser();
        const dbUser = await prisma.user.findUnique({ where: { clerkId: currentUserId } });
        const userRole = ((user?.publicMetadata?.role as string) || dbUser?.role || "GUEST").toUpperCase();
        
        // Only Admin/TL can bulk reassign
        if (!["ADMIN", "MASTER", "TL"].includes(userRole)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.formResponse.updateMany({
            where: { id: { in: ids } },
            data: { assignedTo: assignedTo }
        });

        // Log activity for each (ideally, but updateMany is faster)
        // For simplicity in a high-density dashboard, we'll just return success

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error("Bulk Assign Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
