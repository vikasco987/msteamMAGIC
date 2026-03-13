import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    
    const role = String(clerkUser.publicMetadata?.role || dbUser?.role || "user").toLowerCase();
    const isTL = dbUser?.isTeamLeader || role === 'tl';
    const isPrivileged = ['admin', 'master'].includes(role);

    if (!isTL && !isPrivileged) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // 1. Get Team Members
    // If Admin/Master, they might want to see a specific TL's team, but for now we default to the requester.
    // Actually, let's allow passing a tlId if privileged.
    
    let members = [];
    if (isPrivileged) {
        // For now, if admin, show all users as a "super team"? 
        // Or just let them see the current TL's team.
        members = await prisma.user.findMany({
            where: { leaderId: userId },
            select: { clerkId: true, name: true, email: true }
        });
    } else {
        members = await prisma.user.findMany({
            where: { leaderId: userId },
            select: { clerkId: true, name: true, email: true }
        });
    }
    
    // Add the leader themselves to the "team" for stats
    const teamUserIds = [userId, ...members.map(m => m.clerkId)];
    const memberMap: Record<string, any> = {};
    
    // Initialize member map
    memberMap[userId] = {
        name: dbUser?.name || "Team Leader",
        email: dbUser?.email || "",
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
        
        // Note: Avoiding double counting if same person is creator and assignee
        // But if different members are involved, we might want to split or just attribute to creator/assignee.
        // For now, let's attribute to the "creator" as the main seller/assigner in this context.
    });

    // 4. Calculate Team Totals
    const teamStats = {
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
