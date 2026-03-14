import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

// Using require for the legacy script
const { runBackup } = require("../../../../../../scripts/backup/mongodb-backup");

export async function GET(req: NextRequest) {
  try {
    const MONGODB_URI = process.env.DATABASE_URL;
    if (!MONGODB_URI) throw new Error("DATABASE_URL missing");

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Log the heartbeat
    await db.collection('CronHeartbeat').updateOne(
      { id: 'backup_check' },
      { $set: { lastRun: new Date(), status: 'triggered' } },
      { upsert: true }
    );

    console.log("Starting production backup logic...");
    
    // Call the logic directly! No exec, no fetch.
    await runBackup();

    await client.close();

    return NextResponse.json({ 
      message: "Cron trigger processed and backup completed", 
      server_time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Cron Trigger Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
