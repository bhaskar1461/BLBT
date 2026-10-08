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

const HolographicCoin = nextDynamic(
  () => import('@/components/3d/HolographicCoin').then((m) => m.HolographicCoin),
  {
    ssr: false,
    loading: () => (
      <div className="w-[150px] h-[150px] rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-xs text-amber-400 font-bold">
        BTC 3D
      </div>
    ),
  }
);

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'The Honest Backtester | Test Dreams Against Reality | Celsius Network',
    description:
      'Preset strategy library (MA crossover, RSI, breakouts, DCA) tested against real Binance historical data with 0.10% fee drag and permanent Buy-and-Hold benchmark comparison.',
    openGraph: {
      title: 'The Honest Backtester — Celsius Network',
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
      title: 'The Honest Backtester — Celsius Network',
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
    <div className="min-h-screen bg-canvas text-main font-sans selection:bg-primary/20">
      {/* Top Header Navigation */}
      <header className="border-b border-subtle bg-panel/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-primary/20">
                °C
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                Celsius Network
              </span>
            </Link>
            <span className="text-faint text-xs font-mono">•</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <span>THE BACKTESTER</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/tournaments"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Tournaments
            </Link>
            <Link
              href="/scoreboard"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              The Scoreboard
            </Link>
            <Link
              href="/sentiment"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Sentiment Index
            </Link>
            <Link
              href="/reality"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              The Reality Check
            </Link>
            <Link
              href="/transparency"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Ledger Proofs
            </Link>
            <Link
              href="/"
              className="btn btn-primary py-1.5 px-3 rounded-lg text-xs font-bold"
            >
              Launch Terminal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section with 3D Hologram */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-surface border border-subtle shadow-xl relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
              <RotateCcw size={13} className="text-emerald-400" />
              <span>Server-Side Backtesting Engine • Zero Curve-Fitting</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Test your trading ideas against reality before risking capital.
            </h1>

            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Most retail backtesters sell fantasy: zero transaction fees, zero slippage, and hidden benchmarks.
              Our engine evaluates strategies against real Binance Spot market data, deducts 0.10% transaction fees on every trade,
              and permanently holds up the buy-and-hold mirror.
            </p>
          </div>

          <div className="hidden sm:flex shrink-0 items-center justify-center p-2 rounded-2xl bg-canvas/60 border border-subtle/80 shadow-inner z-10">
            <HolographicCoin symbol="BTC" size={150} interactive={true} showRings={true} />
          </div>
        </div>

        {/* Backtest Manager: Form + Live Execution + Results */}
        <BacktestManager
          initialPresets={presets}
          initialReport={initialReport}
        />

        {/* Methodology & Truth Invariants Section */}
        <section className="bg-panel border border-subtle rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              The Backtester Invariants
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
            <div className="bg-canvas border border-subtle rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">1. Permanent Buy-and-Hold Mirror</span>
              <p className="text-faint">
                Every result is permanently compared against holding the underlying asset over the exact same period.
                We never collapse or hide when doing nothing beats active trading.
              </p>
            </div>
            <div className="bg-canvas border border-subtle rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">2. Realistic 0.10% Fee Drag</span>
              <p className="text-faint">
                Standard spot maker/taker fees are deducted from gross capital on every single simulated order.
                Turnover has real costs; we show you what the exchange would have collected.
              </p>
            </div>
            <div className="bg-canvas border border-subtle rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">3. Server-Side Execution</span>
              <p className="text-faint">
                Backtests run on the server against authoritative Binance API klines, adhering to our strict performance
                budget (&lt;150KB JS bundle).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-subtle py-8 text-center text-xs text-faint">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &ldquo;The only trading platform that profits from you not losing money.&rdquo;
          </div>
          <div className="flex items-center gap-4">
            <Link href="/scoreboard" className="hover:text-white transition-colors">
              The Scoreboard
            </Link>
            <Link href="/sentiment" className="hover:text-white transition-colors">
              Sentiment
            </Link>
            <Link href="/reality" className="hover:text-white transition-colors">
              The Reality Check
            </Link>
            <Link href="/transparency" className="hover:text-white transition-colors">
              Transparency
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
