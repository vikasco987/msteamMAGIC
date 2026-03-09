import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rawResult: any = await (prisma as any).$runCommandRaw({
            find: "DynamicForm",
            filter: { pinnedBy: userId }
        });

        const pinnedForms = (rawResult.cursor?.firstBatch || []).map((f: any) => ({
            id: f._id.$oid || f._id,
            title: f.title
        }));

        return NextResponse.json(pinnedForms);
    } catch (error) {
        console.error("FETCH PINNED FORMS ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
