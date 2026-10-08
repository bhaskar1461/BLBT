import { NextRequest, NextResponse } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframeParam = searchParams.get('timeframe') || 'all';
    const cleanTimeframe = ['24h', '7d', '30d', 'all'].includes(timeframeParam)
      ? (timeframeParam as '24h' | '7d' | '30d' | 'all')
      : 'all';

    const userId = searchParams.get('userId') || req.headers.get('x-user-id') || 'usr_celsius_demo';

    const leaderboardData = serverPaperTrading.getLeaderboard(cleanTimeframe, userId);

    return NextResponse.json({
      success: true,
      timeframe: cleanTimeframe,
      ...leaderboardData,
    });
  } catch (error) {
    console.error('Leaderboard query error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leaderboard rankings' },
      { status: 500 }
    );
  }
}
