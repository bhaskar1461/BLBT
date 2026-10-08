// src/app/api/cron/reality-stats/route.ts
import { NextResponse } from 'next/server';
import { realityService } from '@/lib/realityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats30 = realityService.computeAndCacheStats(30);
    const stats90 = realityService.computeAndCacheStats(90);

    return NextResponse.json({
      success: true,
      message: 'Daily reality check aggregate statistics computed and cached successfully.',
      cachedPeriods: [30, 90],
      sample30: {
        profitablePct: stats30.profitableTradersPct,
        medianPnl: stats30.medianPnlUsdt,
        averagePnl: stats30.averagePnlUsdt,
        activeTraders: stats30.totalActiveTraders,
        updatedAt: stats30.updatedAt,
      },
      sample90: {
        profitablePct: stats90.profitableTradersPct,
        medianPnl: stats90.medianPnlUsdt,
        averagePnl: stats90.averagePnlUsdt,
        activeTraders: stats90.totalActiveTraders,
        updatedAt: stats90.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to run reality stats daily cron:', error);
    return NextResponse.json(
      { error: 'Failed to compute and cache reality stats' },
      { status: 500 }
    );
  }
}
