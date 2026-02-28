import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { users as clerkUsers } from "@clerk/clerk-sdk-node";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const limit = parseInt(searchParams.get("limit") || "100");

        const userList = await clerkUsers.getUserList({
            query,
            limit
        });

        const formattedUsers = userList.map(u => ({
            clerkId: u.id,
            email: u.emailAddresses?.[0]?.emailAddress || "",
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            imageUrl: u.imageUrl || "",
            role: "USER" // Default fallback, as we don't strictly need precise DB roles for the access search list visually
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
