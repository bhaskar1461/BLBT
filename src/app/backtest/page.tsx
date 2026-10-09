// src/app/backtest/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  RotateCcw,
  Activity,
  Award,
  Shield,
  Layers,
  TrendingDown,
  Percent,
  Compass,
} from 'lucide-react';
import nextDynamic from 'next/dynamic';
import { backtestService } from '@/lib/backtestService';
import { BacktestManager } from '@/components/backtest/BacktestManager';
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

const HolographicCoin = nextDynamic(
  () => import('@/components/3d/HolographicCoin').then((m) => m.HolographicCoin),
  {
    ssr: false,
    loading: () => (
      <div className="w-[120px] h-[120px] rounded-full bg-[#ff8800]/10 border border-[#ff8800]/20 flex items-center justify-center font-mono text-xs text-[#ff8800] font-bold">
        BTC 3D
      </div>
    ),
  }
);

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'The Honest Backtester | Bloomberg Professional',
    description:
      'Preset strategy library (MA crossover, RSI, breakouts, DCA) tested against real Binance historical data with 0.10% fee drag and permanent Buy-and-Hold benchmark comparison.',
    openGraph: {
      title: 'The Honest Backtester — Bloomberg Professional',
      description:
        'Test trading strategies against real Binance Spot market history. Every result features the mandatory Buy-and-Hold benchmark comparison.',
      images: [
        {
          url: '/api/og/backtest?strategy=MA+Crossover',
          width: 1200,
          height: 630,
          alt: 'The Honest Backtester',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Honest Backtester — Bloomberg Professional',
      description:
        'Every backtest accounts for 0.10% exchange fee drag and permanent BTC buy-and-hold benchmark comparisons.',
    },
  };
}

export default async function BacktestPage() {
  const presets = backtestService.getPresets();

  // Pre-render a default backtest report on server for instant first paint
  const initialReport = await backtestService.runBacktest({
    strategyType: 'ma_crossover',
    symbol: 'BTCUSDT',
    timeframe: '1d',
    periodDays: 90,
    initialCapital: 10000,
    params: {
      fastPeriod: 9,
      slowPeriod: 21,
      maType: 'SMA',
    },
  });

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="BTST"
        subtitle="SERVER BACKTESTING // ZERO CURVE-FITTING"
      />

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-sm bg-[#05070a] border border-[#1a2333] relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">&lt;BTST 01&gt;</span>
              <span className="text-[#ff8800] font-bold">SERVER-SIDE BACKTESTING ENGINE • ZERO CURVE-FITTING</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Test your trading ideas against reality before risking capital.
            </h1>

            <p className="text-[#8e95a5] text-xs leading-relaxed">
              Most retail backtesters sell fantasy: zero transaction fees, zero slippage, and hidden benchmarks.
              Our engine evaluates strategies against real Binance Spot market data, deducts 0.10% transaction fees on every trade,
              and permanently holds up the buy-and-hold mirror.
            </p>
          </div>

          <div className="hidden sm:flex shrink-0 items-center justify-center p-2 rounded-sm bg-[#000000] border border-[#1a2333] z-10">
            <HolographicCoin symbol="BTC" size={120} interactive={true} showRings={true} />
          </div>
        </div>

        {/* Backtest Manager: Form + Live Execution + Results */}
        <BacktestManager
          initialPresets={presets}
          initialReport={initialReport}
        />

        {/* Methodology & Truth Invariants Section */}
        <section className="bg-[#05070a] border border-[#1a2333] rounded-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#00c176]" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">
              THE BACKTESTER INVARIANTS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#000000] border border-[#1a2333] rounded-sm p-3 space-y-1">
              <span className="font-bold text-[#ff8800]">1. Permanent Buy-and-Hold Mirror</span>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Every result is permanently compared against holding the underlying asset over the exact same period.
                We never collapse or hide when doing nothing beats active trading.
              </p>
            </div>
            <div className="bg-[#000000] border border-[#1a2333] rounded-sm p-3 space-y-1">
              <span className="font-bold text-[#00c176]">2. Realistic 0.10% Fee Drag</span>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Standard spot maker/taker fees are deducted from gross capital on every single simulated order.
                Turnover has real costs; we show you what the exchange would have collected.
              </p>
            </div>
            <div className="bg-[#000000] border border-[#1a2333] rounded-sm p-3 space-y-1">
              <span className="font-bold text-white">3. Server-Side Execution</span>
              <p className="text-[10px] text-[#8e95a5] leading-normal">
                Backtests run on the server against authoritative Binance API klines, adhering to our strict performance
                budget (&lt;150KB JS bundle).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Bloomberg Professional Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">BLOOMBERG PROFESSIONAL // THE BACKTESTER</span>
          <span>&ldquo;THE ONLY TRADING PLATFORM THAT PROFITS FROM YOU NOT LOSING MONEY.&rdquo; • BINANCE KLINES</span>
        </div>
      </footer>
    </div>
  );
}
