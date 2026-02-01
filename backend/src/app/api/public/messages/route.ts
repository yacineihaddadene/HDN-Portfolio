import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { messageSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const [newMessage] = await db
      .insert(messages)
      .values({
        ...validatedData,
        ipAddress,
        userAgent,
      })
      .returning();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
