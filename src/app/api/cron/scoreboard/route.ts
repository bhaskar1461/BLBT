import { NextRequest, NextResponse } from 'next/server';
import { scoreboardService } from '@/lib/scoreboardService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Cache for live price lookups during evaluation
    const priceCache = new Map<string, number>();

    const defaultPrices: Record<string, number> = {
      BTCUSDT: 64200,
      ETHUSDT: 3350,
      SOLUSDT: 148,
      BNBUSDT: 585,
      AVAXUSDT: 28.5,
    };

    const getPrice = (sym: string): number => {
      const cleanSym = sym.toUpperCase();
      if (priceCache.has(cleanSym)) return priceCache.get(cleanSym)!;
      return defaultPrices[cleanSym] || 100;
    };

    // Pre-fetch live prices from Binance for major pairs
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT'];
      for (const s of symbols) {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s}`);
        if (res.ok) {
          const d = await res.json();
          const p = parseFloat(d.price);
          if (!isNaN(p) && p > 0) priceCache.set(s, p);
        }
      }
    } catch {}

    const result = scoreboardService.evaluateExpiredCalls(getPrice);

    return NextResponse.json({
      success: true,
      message: 'Public trading call evaluation cycle completed successfully.',
      evaluatedCount: result.evaluatedCount,
      scoredCalls: result.scoredCalls,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in scoreboard cron:', error);
    return NextResponse.json({ error: 'Scoreboard evaluation cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
