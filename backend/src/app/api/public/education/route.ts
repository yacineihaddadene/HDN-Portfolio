import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { education } from '@/lib/db/schema';

export async function GET() {
  try {
    const allEducation = await db.select().from(education);
    return NextResponse.json(allEducation);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    );
  }
}
