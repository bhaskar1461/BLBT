import { NextRequest, NextResponse } from 'next/server';
import { benchmarkService } from '@/lib/benchmarkService';
import { serverPaperTrading } from '@/lib/paperTradingService';
import { fromBaseUnits } from '@/lib/tradeUnits';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || 'usr_celsius_demo';
    const periodDays = parseInt(searchParams.get('periodDays') || '30', 10);

    const { account, positions } = await serverPaperTrading.getOrCreateAccount(userId);
    const metrics = serverPaperTrading.getAccountMetrics(account, positions);

    const initialCapital = fromBaseUnits(BigInt(account.initial_balance_units || '1000000000000'));
    const currentEquity = metrics.equity;
    const userRealizedPnl = currentEquity - initialCapital;

    const benchmark = await benchmarkService.compareAgainstBtcBuyAndHoldAsync(
      initialCapital,
      userRealizedPnl,
      periodDays
    );

    return NextResponse.json({
      success: true,
      userId,
      benchmark,
    });
  } catch (error) {
    console.error('Error computing benchmark comparison:', error);
    // Graceful fallback
    const fallback = benchmarkService.compareAgainstBtcBuyAndHold(10000, 0, 30);
    return NextResponse.json({
      success: true,
      userId: 'usr_celsius_demo',
      benchmark: fallback,
    });
  }
}
