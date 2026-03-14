import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';
import path from 'path';

// This API will be triggered by a cron service (Vercel Cron, GitHub Actions, or Cron-job.org)
export async function GET(req: NextRequest) {
  // 1. Security Check (Optional: You can add a secret header/token here)
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For now, we allow it to find the cause, but usually we'd protect it
    console.log("Cron Trigger Received...");
  }

  try {
    // We import the logic directly from the JS file to avoid shell execution
    // Since we are in a Next.js environment, we use the MongoDB URI from env
    const MONGODB_URI = process.env.DATABASE_URL;
    
    if (!MONGODB_URI) throw new Error("DATABASE_URL missing");

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Log the heartbeat so we know the cron is hitting the server
    await db.collection('CronHeartbeat').updateOne(
      { id: 'backup_check' },
      { $set: { lastRun: new Date(), status: 'triggered' } },
      { upsert: true }
    );

    // Now we trigger the backup internal logic
    // We send a POST to our internal create-backup API to actually do the work
    const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
    const backupResponse = await fetch(`${baseUrl}/api/admin/backups/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const result = await backupResponse.json();

    await client.close();

    return NextResponse.json({ 
      message: "Cron trigger processed", 
      backup_result: result,
      server_time: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
