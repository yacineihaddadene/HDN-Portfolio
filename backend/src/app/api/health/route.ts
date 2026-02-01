import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    service: "portfolio-backend",
    timestamp: new Date().toISOString()
  });
}
