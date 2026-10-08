import { NextRequest, NextResponse } from 'next/server';

const SYMBOL_REGEX = /^[A-Z0-9]{3,12}$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (symbol) {
    const sym = symbol.toUpperCase();
    if (!SYMBOL_REGEX.test(sym)) {
      return NextResponse.json({ error: 'Invalid symbol format' }, { status: 400 });
    }

    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, {
        next: { revalidate: 2 },
      });
      if (res.ok) {
        const d = await res.json();
        return NextResponse.json({
          symbol: d.symbol,
          lastPrice: parseFloat(d.lastPrice),
          priceChange: parseFloat(d.priceChange),
          priceChangePercent: parseFloat(d.priceChangePercent),
          highPrice: parseFloat(d.highPrice),
          lowPrice: parseFloat(d.lowPrice),
          volume: parseFloat(d.volume),
          quoteVolume: parseFloat(d.quoteVolume),
          lastUpdated: Date.now(),
        });
      }
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch ticker from Binance' }, { status: 502 });
  }

  // All tickers
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, unknown> = {};
      if (Array.isArray(data)) {
        for (const d of data) {
          map[d.symbol] = {
            symbol: d.symbol,
            lastPrice: parseFloat(d.lastPrice),
            priceChange: parseFloat(d.priceChange),
            priceChangePercent: parseFloat(d.priceChangePercent),
            highPrice: parseFloat(d.highPrice),
            lowPrice: parseFloat(d.lowPrice),
            volume: parseFloat(d.volume),
            quoteVolume: parseFloat(d.quoteVolume),
            lastUpdated: Date.now(),
          };
        }
      }
      return NextResponse.json(map, {
        headers: {
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
        },
      });
    }
  } catch {}

  return NextResponse.json({ error: 'Failed to fetch all tickers' }, { status: 502 });
}
