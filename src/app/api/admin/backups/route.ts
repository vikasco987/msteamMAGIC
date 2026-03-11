import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json({ error: 'Failed to fetch backup history' }, { status: 500 });
  }
}
