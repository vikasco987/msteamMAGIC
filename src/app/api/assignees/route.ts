import { NextRequest, NextResponse } from "next/server";
import { users } from "@clerk/clerk-sdk-node";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    const promises = ids.map(async (id: string) => {
      try {
        const user = await users.getUser(id);
        return {
          id: user.id,
          name: user.firstName || user.username || "Unnamed",
          email: user.emailAddresses[0]?.emailAddress || "",
          imageUrl: user.imageUrl,
        };
      } catch {
        // Fallback for users not found in Clerk or other errors
        return {
          id,
          name: "Unknown",
          email: "", // We can't determine email if user not found
          imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
        };
      }
    });

    const assignees = await Promise.all(promises);

    return NextResponse.json({ assignees });
  } catch (err) {
    console.error("Error in /api/assignees:", err);
    return NextResponse.json({ error: "Failed to fetch assignees", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}