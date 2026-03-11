import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

export async function GET(req: NextRequest) {
  try {
    if (!uri) {
      return NextResponse.json({ error: "Database URI missing" }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    await client.close();

    // Sort and return names, filtering out system collections if needed
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'))
      .sort();

    return NextResponse.json(collectionNames);
  } catch (error: any) {
    console.error("List collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
