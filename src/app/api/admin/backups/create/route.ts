import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Run the existing backup script
    const scriptPath = path.resolve(process.cwd(), "scripts/backup/mongodb-backup.js");
    
    // We run it with node
    // We don't wait for it to finish if it takes too long, 
    // but for now let's try to wait and see.
    // If it takes > 30s it might timeout the request.
    
    console.log(`Starting manual backup via script: ${scriptPath}`);

    if (!fs.existsSync(scriptPath)) {
      console.error(`Backup script not found at: ${scriptPath}`);
      return NextResponse.json({ 
        error: "Backup configuration error", 
        details: `Script not found at ${scriptPath}. Please ensure scripts/backup/mongodb-backup.js exists in the project root.`
      }, { status: 500 });
    }
    
    return new Promise((resolve) => {
      exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup script error: ${error.message}`);
          console.error(`Script stderr: ${stderr}`);
          console.error(`Script stdout: ${stdout}`);
          
          resolve(NextResponse.json({ 
            error: "Backup process failed", 
            details: error.message,
            stderr: stderr,
            stdout: stdout
          }, { status: 500 }));
          return;
        }
        
        console.log(`Backup script output: ${stdout}`);
        if (stderr) console.warn(`Backup script warning/stderr: ${stderr}`);
        
        resolve(NextResponse.json({ 
          message: "Backup completed successfully", 
          output: stdout 
        }));
      });
    });

  } catch (error: any) {
    console.error("Manual backup trigger error:", error);
    return NextResponse.json({ error: "Failed to trigger backup", details: error.message }, { status: 500 });
  }
}
