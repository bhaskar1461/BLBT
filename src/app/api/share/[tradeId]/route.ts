import { NextRequest, NextResponse } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { tradeId: string } }
) {
  try {
    const { tradeId } = params;
    const trade = serverPaperTrading.getClosedTrade(tradeId);

    if (!trade) {
      // Fallback for demo preview
      const fallbackTrade = {
        id: tradeId,
        userId: 'usr_celsius_demo',
        userDisplayName: 'CryptoDegen99',
        symbol: 'BTCUSDT',
        side: 'long',
        entryPrice: 62450,
        exitPrice: 65120,
        quantity: 0.5,
        margin: 31225,
        realizedPnl: 1335,
        realizedPnlPct: 4.27,
        durationFormatted: '4h 00m',
        closedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        trade: fallbackTrade,
        ogImageUrl: `/api/og/trade/${tradeId}`,
        shareUrl: `/share/${tradeId}`,
      });
    }

    return NextResponse.json({
      success: true,
      trade,
      ogImageUrl: `/api/og/trade/${tradeId}`,
      shareUrl: `/share/${tradeId}`,
    });
  } catch (error) {
    console.error('Trade share API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trade share data' }, { status: 500 });
  }
}
