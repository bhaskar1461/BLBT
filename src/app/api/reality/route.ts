// src/app/api/reality/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { realityService } from '@/lib/realityService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period');
    const period = periodParam === '90' ? 90 : 30;

    const stats = realityService.getRealityStats(period);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to query reality check stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve aggregate reality stats' },
      { status: 500 }
    );
  }
}
