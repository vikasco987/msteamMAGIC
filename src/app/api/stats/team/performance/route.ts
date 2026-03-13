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

    // Determine whose team we are looking at
    let leaderId = userId;
    if (targetTlId && isPrivileged) {
        leaderId = targetTlId;
    }

    // Get the leader's actual DB details (if different from requester)
    const leaderUser = targetTlId ? await prisma.user.findUnique({ where: { clerkId: leaderId } }) : dbUser;

    // 1. Get Team Members
    const members = await prisma.user.findMany({
        where: { leaderId: leaderId },
        select: { clerkId: true, name: true, email: true }
    });
    
    // Add the leader themselves to the "team" for stats
    const teamUserIds = [leaderId, ...members.map(m => m.clerkId)];
    const memberMap: Record<string, any> = {};
    
    // Initialize member map
    memberMap[leaderId] = {
        name: leaderUser?.name || "Team Leader",
        email: leaderUser?.email || "",
        revenue: 0,
        received: 0,
        sales: 0
    };
    
    members.forEach(m => {
        memberMap[m.clerkId] = {
            name: m.name || "Unknown",
            email: m.email || "",
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
        
        // Count for creator
        if (memberMap[task.createdByClerkId]) {
            memberMap[task.createdByClerkId].revenue += amount;
            memberMap[task.createdByClerkId].received += received;
            memberMap[task.createdByClerkId].sales += 1;
        }
    });

    // 4. Calculate Team Totals
    const teamStats = {
        leaderName: leaderUser?.name || "Unknown",
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
