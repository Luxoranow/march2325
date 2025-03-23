import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Luxora API is running'
    },
    { status: 200 }
  );
}

export const dynamic = 'force-dynamic'; 