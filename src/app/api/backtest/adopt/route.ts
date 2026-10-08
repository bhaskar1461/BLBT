// src/app/api/backtest/adopt/route.ts
import { NextResponse } from 'next/server';
import { backtestService, StrategyType, BacktestParams } from '@/lib/backtestService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      strategyType,
      symbol = 'BTCUSDT',
      timeframe = '1d',
      parameters = {},
      riskPerTradeCapPct = 1.0,
      userId,
    } = body;

    if (!strategyType) {
      return NextResponse.json(
        { error: 'strategyType is required' },
        { status: 400 }
      );
    }

    const forwardStrategy = backtestService.adoptForwardStrategy({
      userId,
      strategyType: strategyType as StrategyType,
      symbol,
      timeframe,
      parameters: parameters as BacktestParams,
      riskPerTradeCapPct: Number(riskPerTradeCapPct),
    });

    return NextResponse.json({
      success: true,
      message: 'Strategy successfully queued for forward execution in paper trading.',
      forwardStrategy,
    });
  } catch (error: any) {
    console.error('Failed to adopt forward strategy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adopt strategy' },
      { status: 500 }
    );
  }
}
