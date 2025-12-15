// app/api/kam/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for JsonValue type

// 1. Define the type for the customFields object
// Removed '[key: string]: any;' to eliminate the 'any' type error.
// This interface now strictly defines the expected properties.
interface CustomFields {
  shopName?: string | null;
  customerName?: string | null;
  packageAmount?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timeline?: string | null;
  // If you have other custom fields, add them here with their specific types.
  // Example: phone?: string | null; email?: string | null;
}

// 2. Define the type for the Task object returned by Prisma with the specific select fields
interface PrismaSelectedTask {
  id: string;
  createdAt: Date; // Prisma returns Date objects for datetime fields
  customFields: Prisma.JsonValue | null; // Prisma returns JSON fields as JsonValue
}

export async function GET() {
  try {
    // Explicitly type the tasks array with PrismaSelectedTask[]
    const tasks: PrismaSelectedTask[] = await prisma.task.findMany({
      where: {
        title: "📂 Account Handling",
      },
      select: {
        id: true,
        createdAt: true,
        customFields: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Correctly access properties from the nested customFields object
    const formattedTasks = tasks.map((task) => {
      // Assert task.customFields to CustomFields | null here
      // This tells TypeScript that although it's JsonValue, we expect it to conform to CustomFields.
      const customFields = task.customFields as CustomFields | null;

      return {
        id: task.id,
        createdAt: task.createdAt,
        customFields: {
          shopName: customFields?.shopName || null,
          customerName: customFields?.customerName || null,
          packageAmount: customFields?.packageAmount || null,
          startDate: customFields?.startDate || null,
          endDate: customFields?.endDate || null,
          timeline: customFields?.timeline || null,
        },
      };
    });

    return NextResponse.json({ tasks: formattedTasks }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch Account Handling tasks:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}