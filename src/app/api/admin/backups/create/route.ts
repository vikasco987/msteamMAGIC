import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
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
    
    return new Promise((resolve) => {
      exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup script error: ${error.message}`);
          resolve(NextResponse.json({ 
            error: "Backup failed", 
            details: error.message,
            stderr 
          }, { status: 500 }));
          return;
        }
        
        console.log(`Backup script output: ${stdout}`);
        if (stderr) console.error(`Backup script stderr: ${stderr}`);
        
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
