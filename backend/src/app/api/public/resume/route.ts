import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resume } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const currentResume = await db
      .select()
      .from(resume)
      .where(eq(resume.current, true))
      .limit(1);
    return NextResponse.json(currentResume[0] || null);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}
