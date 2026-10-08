import { NextResponse } from 'next/server';
import { serverPaperTrading } from '@/lib/paperTradingService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT'];
    const prices: Record<string, number> = {};

    // Fetch batch prices from Binance
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price', {
        cache: 'no-store',
      });
      if (res.ok) {
        const tickers: { symbol: string; price: string }[] = await res.json();
        for (const t of tickers) {
          if (symbols.includes(t.symbol)) {
            prices[t.symbol] = parseFloat(t.price);
          }
        }
      }
    } catch {}

    // Fallbacks if rate-limited
    if (!prices['BTCUSDT']) prices['BTCUSDT'] = 64250;
    if (!prices['ETHUSDT']) prices['ETHUSDT'] = 3450;
    if (!prices['SOLUSDT']) prices['SOLUSDT'] = 148;

    const result = await serverPaperTrading.checkAndExecuteAdvancedOrders(prices);

    return NextResponse.json({
      success: true,
      message: 'Advanced orders and TP/SL brackets checked against live Binance prices',
      executedOrders: result.executedOrders,
      triggeredBrackets: result.triggeredBrackets,
      checkedPrices: prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron orders execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute advanced orders cron' },
      { status: 500 }
    );
  }
}
