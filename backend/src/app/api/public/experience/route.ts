import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workExperience } from '@/lib/db/schema';

export async function GET() {
  try {
    const allExperience = await db.select().from(workExperience);
    return NextResponse.json(allExperience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
}
