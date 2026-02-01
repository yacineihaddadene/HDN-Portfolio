import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'portfolio-backend',
    timestamp: new Date().toISOString(),
  });
}
