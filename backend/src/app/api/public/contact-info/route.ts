import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactInfo } from '@/lib/db/schema';

export async function GET() {
  try {
    const info = await db.select().from(contactInfo).limit(1);
    return NextResponse.json(info[0] || null);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    );
  }
}
