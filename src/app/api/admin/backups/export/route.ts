import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format"); // "json" or "excel"
    const model = searchParams.get("model") || "task"; // Default to task

    // Fetch data based on model - mapping standard names to prisma models
    let data: any[] = [];
    
    if (model === "task") {
      data = await prisma.task.findMany();
    } else if (model === "customer") {
      data = await prisma.customer.findMany();
    } else if (model === "backup") {
      data = await prisma.backup.findMany();
    } else {
        return NextResponse.json({ error: "Invalid model selection" }, { status: 400 });
    }

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=backup_${model}_${new Date().toISOString()}.xlsx`,
        },
      });
    }

    // Default to JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=backup_${model}_${new Date().toISOString()}.json`,
      },
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed", details: error.message }, { status: 500 });
  }
}
