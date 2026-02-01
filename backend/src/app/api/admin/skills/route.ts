import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';
import { skillSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const allSkills = await db.select().from(skills);
    return NextResponse.json(allSkills);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message?.includes('Forbidden') ? 403 : 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validatedData = skillSchema.parse(body);

    const [newSkill] = await db.insert(skills).values(validatedData).returning();
    return NextResponse.json(newSkill, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Forbidden') ? 403 : 401 }
      );
    }
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
