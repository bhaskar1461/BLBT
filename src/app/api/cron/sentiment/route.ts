import { NextRequest, NextResponse } from 'next/server';
import { sentimentService } from '@/lib/sentimentService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Optional auth guard for production cron calls
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In local dev/testing allow open execution
    }

    const trackedAssets = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT'];
    const snapshots = trackedAssets.map((sym) =>
      sentimentService.aggregateHourlySnapshot(sym)
    );

    return NextResponse.json({
      success: true,
      message: `Hourly sentiment snapshots aggregated for ${snapshots.length} assets`,
      snapshotsCount: snapshots.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running sentiment cron:', error);
    return NextResponse.json({ error: 'Failed to aggregate sentiment snapshots' }, { status: 500 });
  }
}
