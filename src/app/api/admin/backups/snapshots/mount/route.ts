import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();
    const MONGODB_URI = process.env.DATABASE_URL;
    const S3_BUCKET = process.env.AWS_S3_BACKUP_BUCKET;

    if (!MONGODB_URI || !S3_BUCKET || !fileName) {
      return NextResponse.json({ error: "Missing configuration or filename" }, { status: 400 });
    }

    // 1. Create a unique Temp DB Name
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const tempDbName = `snap_${sanitizedName}`;

    // 2. Local paths
    const tempDir = path.join(process.cwd(), "tmp-mounts");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const localFilePath = path.join(tempDir, fileName);

    console.log(`📡 Mounting snapshot: ${fileName} as ${tempDbName}`);

    // 3. Download from S3
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: `backups/${fileName}`,
    });

    const response = await s3Client.send(getCommand);
    const stream = response.Body as any;
    const fileWriter = fs.createWriteStream(localFilePath);
    
    await new Promise((resolve, reject) => {
      stream.pipe(fileWriter);
      stream.on("error", reject);
      fileWriter.on("finish", resolve);
    });

    console.log("✅ Downloaded. Now restoring to ghost database...");

    // 4. Mongorestore to temporary database
    // Extract original DB name from URI (usually clickup_clone)
    const urlParts = MONGODB_URI.split("/");
    const originalDbName = urlParts[3]?.split("?")[0] || "clickup_clone";

    // Try to find mongorestore path
    let restoreCmd = "mongorestore";
    const commonPaths = ["/usr/local/bin/mongorestore", "/opt/homebrew/bin/mongorestore"];
    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        restoreCmd = p;
        break;
      }
    }

    // Command to restore the archive into a NEW namespace
    const command = `${restoreCmd} --uri="${MONGODB_URI}" --archive="${localFilePath}" --gzip --nsInclude="${originalDbName}.*" --nsFrom="${originalDbName}.*" --nsTo="${tempDbName}.*" --drop`;

    await execPromise(command);

    // 5. Cleanup local file
    fs.unlinkSync(localFilePath);

    console.log(`🏁 Snapshot mounted successfully. DB: ${tempDbName}`);
    return NextResponse.json({ success: true, tempDbName });

  } catch (error: any) {
    console.error("Mount error:", error);
    return NextResponse.json({ error: "Mounting failed", details: error.message }, { status: 500 });
  }
}
