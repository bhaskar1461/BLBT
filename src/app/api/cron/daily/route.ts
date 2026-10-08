// src/app/api/cron/daily/route.ts
import { NextResponse } from 'next/server';
import { transparencyService } from '@/lib/transparencyService';
import { realityService } from '@/lib/realityService';
import { scoreboardService } from '@/lib/scoreboardService';
import { sentimentService } from '@/lib/sentimentService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results: Record<string, unknown> = {};

    // 1. Daily Transparency Ledger Hash Snapshot
    try {
      const snapshot = transparencyService.generateDailySnapshot();
      results.transparency = { success: true, date: snapshot.date, rootHash: snapshot.root_hash };
    } catch (e) {
      results.transparency = { success: false, error: String(e) };
    }

    // 2. Daily Reality Check Aggregate Stats
    try {
      const stats30 = realityService.computeAndCacheStats(30);
      const stats90 = realityService.computeAndCacheStats(90);
      results.reality = {
        success: true,
        profitablePct30: stats30.profitableTradersPct,
        profitablePct90: stats90.profitableTradersPct,
      };
    } catch (e) {
      results.reality = { success: false, error: String(e) };
    }

    // 3. Scoreboard Evaluation
    try {
      const priceCache = new Map<string, number>();
      const defaultPrices: Record<string, number> = {
        BTCUSDT: 64200,
        ETHUSDT: 3350,
        SOLUSDT: 148,
        BNBUSDT: 585,
        AVAXUSDT: 28.5,
      };
      const getPrice = (sym: string): number => {
        const clean = sym.toUpperCase();
        return priceCache.get(clean) || defaultPrices[clean] || 100;
      };
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT'];
      for (const s of symbols) {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s}`);
          if (res.ok) {
            const d = await res.json();
            const p = parseFloat(d.price);
            if (!isNaN(p) && p > 0) priceCache.set(s, p);
          }
        } catch {}
      }
      const evalResult = scoreboardService.evaluateExpiredCalls(getPrice);
      results.scoreboard = { success: true, evaluated: evalResult.evaluatedCount };
    } catch (e) {
      results.scoreboard = { success: false, error: String(e) };
    }

    // 4. Sentiment Snapshots
    try {
      const tracked = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT'];
      tracked.forEach((sym) => sentimentService.aggregateHourlySnapshot(sym));
      results.sentiment = { success: true, trackedCount: tracked.length };
    } catch (e) {
      results.sentiment = { success: false, error: String(e) };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: results,
    });
  } catch (error) {
    console.error('Failed to run daily consolidated cron:', error);
    return NextResponse.json({ error: 'Failed to run daily cron' }, { status: 500 });
  }
}
