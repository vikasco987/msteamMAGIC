// /api/create-user/route.ts
// import { currentUser } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

import {prisma} from "../../../../lib/prisma";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: user.id }, // Match on Clerk's unique ID
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || "Unnamed",
        role: "user", // Or 'admin', 'seller', etc.
      },
    });
  }

  return new Response("User synced successfully", { status: 200 });
}
