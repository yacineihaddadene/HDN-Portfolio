import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';

export async function GET() {
  try {
    const allSkills = await db.select().from(skills);
    return NextResponse.json(allSkills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
