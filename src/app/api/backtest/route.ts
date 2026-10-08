// src/app/api/backtest/route.ts
import { NextResponse } from 'next/server';
import { backtestService, StrategyType, BacktestParams } from '@/lib/backtestService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'forward') {
      const strategies = backtestService.getForwardStrategies();
      return NextResponse.json({ success: true, strategies });
    }

    const presets = backtestService.getPresets();
    return NextResponse.json({
      success: true,
      presets,
      methodology: {
        fees: 'Flat 0.10% deducted on every entry and exit',
        benchmark: 'Authoritative Binance Spot Buy-and-Hold over identical timeframe',
        invariants: 'Permanent benchmark visibility, database-bound metrics, no curve-fitting deception',
      },
    });
  } catch (error) {
    console.error('Failed to get backtest presets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve backtest presets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      strategyType,
      symbol = 'BTCUSDT',
      timeframe = '1d',
      periodDays = 90,
      initialCapital = 10000,
      params = {},
    } = body;

    if (!strategyType) {
      return NextResponse.json(
        { error: 'strategyType is required (ma_crossover, rsi_thresholds, breakouts, dca)' },
        { status: 400 }
      );
    }

    const validStrategies: StrategyType[] = ['ma_crossover', 'rsi_thresholds', 'breakouts', 'dca'];
    if (!validStrategies.includes(strategyType)) {
      return NextResponse.json(
        { error: `Invalid strategyType. Must be one of: ${validStrategies.join(', ')}` },
        { status: 400 }
      );
    }

    const report = await backtestService.runBacktest({
      strategyType: strategyType as StrategyType,
      symbol,
      timeframe,
      periodDays: Number(periodDays),
      initialCapital: Number(initialCapital),
      params: params as BacktestParams,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Backtest execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute backtest' },
      { status: 500 }
    );
  }
}
