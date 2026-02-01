import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hobbies } from '@/lib/db/schema';

export async function GET() {
  try {
    const allHobbies = await db.select().from(hobbies);
    return NextResponse.json(allHobbies);
  } catch (error) {
    console.error('Error fetching hobbies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hobbies' },
      { status: 500 }
    );
  }
}
