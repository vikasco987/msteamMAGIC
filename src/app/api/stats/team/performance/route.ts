import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetTlId = searchParams.get("tlId");
    const getTlList = searchParams.get("getTlList") === "true";

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    
    const role = String(clerkUser.publicMetadata?.role || dbUser?.role || "user").toLowerCase();
    const isTL = dbUser?.isTeamLeader || role === 'tl';
    const isPrivileged = ['admin', 'master'].includes(role);

    if (!isTL && !isPrivileged) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // If MASTER asks for the list of TLs
    if (getTlList && isPrivileged) {
        const tls = await prisma.user.findMany({
            where: {
                OR: [
                    { isTeamLeader: true },
                    { role: { equals: "TL", mode: "insensitive" } }
                ]
            },
            select: { clerkId: true, name: true, email: true }
        });
        return NextResponse.json({ tls });
    }

    let teamUserIds: string[] = [];
    let leaderName = "";

    if (targetTlId === "all" && isPrivileged) {
        // Aggregated view for all TLs
        const allTls = await prisma.user.findMany({
            where: {
                OR: [
                    { isTeamLeader: true },
                    { role: { equals: "TL", mode: "insensitive" } }
                ]
            },
            select: { clerkId: true }
        });
        const tlIds = allTls.map(t => t.clerkId);
        const members = await prisma.user.findMany({
            where: { leaderId: { in: tlIds } },
            select: { clerkId: true }
        });
        teamUserIds = [...tlIds, ...members.map(m => m.clerkId)];
        leaderName = "All Teams";
    } else {
        // Individual TL view
        let leaderId = userId;
        if (targetTlId && isPrivileged) {
            leaderId = targetTlId;
        }

        const leaderUser = targetTlId ? await prisma.user.findUnique({ where: { clerkId: leaderId } }) : dbUser;
        const members = await prisma.user.findMany({
            where: { leaderId: leaderId },
            select: { clerkId: true, name: true, email: true }
        });
        
        teamUserIds = [leaderId, ...members.map(m => m.clerkId)];
        leaderName = leaderUser?.name || "Unknown";
    }

    // Fetch details for member performance
    const usersInTeam = await prisma.user.findMany({
        where: { clerkId: { in: teamUserIds } },
        select: { clerkId: true, name: true, email: true }
    });

    const memberMap: Record<string, any> = {};
    usersInTeam.forEach(u => {
        memberMap[u.clerkId] = {
            name: u.name || "Unknown",
            email: u.email || "",
            revenue: 0,
            received: 0,
            sales: 0
        };
    });

    // 2. Fetch Tasks for the whole team (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        OR: [
            { createdByClerkId: { in: teamUserIds } },
            { assigneeId: { in: teamUserIds } },
            { assigneeIds: { hasSome: teamUserIds } }
        ]
      },
      select: {
          createdByClerkId: true,
          assigneeId: true,
          assigneeIds: true,
          amount: true,
          received: true
      }
    });

    // 3. Aggregate stats by member
    tasks.forEach(task => {
        const amount = task.amount || 0;
        const received = task.received || 0;
        
        if (memberMap[task.createdByClerkId]) {
            memberMap[task.createdByClerkId].revenue += amount;
            memberMap[task.createdByClerkId].received += received;
            memberMap[task.createdByClerkId].sales += 1;
        }
    });

    // 4. Calculate Team Totals
    const teamStats = {
        leaderName,
        totalRevenue: tasks.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalReceived: tasks.reduce((sum, t) => sum + (t.received || 0), 0),
        totalSales: tasks.length,
        memberPerformance: Object.values(memberMap).sort((a: any, b: any) => b.revenue - a.revenue)
    };

    return NextResponse.json(teamStats);
  } catch (error) {
    console.error("Error in team performance API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
