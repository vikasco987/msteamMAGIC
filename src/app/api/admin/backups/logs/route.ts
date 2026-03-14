import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const logPath = path.resolve(process.cwd(), "scripts/backup/backup.log");
    
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: "No logs found yet." });
    }

    const content = fs.readFileSync(logPath, "utf-8");
    // Get last 100 lines
    const lines = content.split("\n").slice(-100).join("\n");
    
    return NextResponse.json({ logs: lines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
