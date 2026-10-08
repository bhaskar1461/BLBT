import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Flame,
  Brain,
  ArrowRight,
  Layers,
  Activity,
} from 'lucide-react';
import { realityService } from '@/lib/realityService';
import { formatPrice } from '@/lib/utils';
import { ShareRealityButton } from '@/components/reality/ShareRealityButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { period?: string };
}): Promise<Metadata> {
  const period = searchParams?.period === '90' ? 90 : 30;
  const stats = realityService.getRealityStats(period);

  const title = 'Reality Check — Everyone shows you their wins. We show you everything.';
  const description = `${stats.unprofitableTradersPct}% of active retail paper traders lost money over the last ${period} days. Median return: -$${Math.abs(stats.medianPnlUsdt).toFixed(2)}. Unvarnished database proof from the Celsius trading ledger.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/reality?period=${period}`,
      siteName: 'Celsius Terminal',
      images: [
        {
          url: `/api/og/reality?period=${period}`,
          width: 1200,
          height: 630,
          alt: 'Celsius Terminal Reality Check — Unfiltered Retail Trading Proof',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/reality?period=${period}`],
    },
  };
}

export default function RealityPage({
  searchParams,
}: {
  searchParams?: { period?: string };
}) {
  const period = searchParams?.period === '90' ? 90 : 30;
  const stats = realityService.getRealityStats(period);

  return (
    <main className="min-h-screen bg-canvas text-main flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-bear/30">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bear to-amber-500 flex items-center justify-center font-extrabold text-sm text-canvas shadow-lg shadow-bear/20">
            °C
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            CELSIUS <span className="text-bear text-xs font-mono font-medium ml-1">REALITY CHECK</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/tournaments"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>🏆 Tournaments</span>
          </Link>
          <Link
            href="/backtest"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>🔄 Backtester</span>
          </Link>
          <Link
            href="/scoreboard"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>⚖️ Scoreboard</span>
          </Link>
          <Link
            href="/transparency"
            className="text-xs font-semibold text-faint hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>🛡️ Ledger Proofs</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-xs font-semibold text-faint hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>🏆 Leaderboard</span>
          </Link>
          <Link
            href="/"
            className="btn btn-primary text-xs px-3.5 py-1.5 rounded-md font-bold"
          >
            Open Terminal
          </Link>
        </div>
      </header>

      {/* Main Showcase Section */}
      <section className="w-full max-w-5xl my-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bear/10 border border-bear/20 text-bear text-xs font-mono font-bold tracking-tight">
            <AlertTriangle size={14} />
            <span>THE UNFILTERED TRUTH ABOUT RETAIL TRADING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everyone shows you their wins.<br />
            <span className="text-bear">We show you everything.</span>
          </h1>

          <p className="text-sm text-muted leading-relaxed">
            Every day, retail brokers and signal sellers post 100x screenshots while hiding that 8 out of 10 traders lose capital. Below is the unvarnished aggregate reality across all {stats.totalActiveTraders}+ paper accounts on Celsius. Computed live from our immutable ledger at render time.
          </p>

          {/* Timeframe Switcher & Share */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="inline-flex rounded-xl bg-panel border border-subtle p-1 font-mono text-xs">
              <Link
                href="/reality?period=30"
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  period === 30
                    ? 'bg-primary text-canvas shadow-md'
                    : 'text-faint hover:text-white'
                }`}
              >
                Last 30 Days
              </Link>
              <Link
                href="/reality?period=90"
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  period === 90
                    ? 'bg-primary text-canvas shadow-md'
                    : 'text-faint hover:text-white'
                }`}
              >
                Last 90 Days
              </Link>
            </div>

            <ShareRealityButton />
          </div>
        </div>

        {/* Brutal Truth KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Profitable Traders */}
          <div className="p-6 rounded-2xl bg-panel border border-bear/30 relative overflow-hidden shadow-xl shadow-bear/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
              Traders In Profit ({period}d)
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-bear mt-2">
              {`${stats.profitableTradersPct}%`}
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              <strong className="text-white">{`${stats.unprofitableTradersPct}% of accounts lost money`}</strong> over this period. Only {`${stats.profitableTradersPct}%`} maintained a balance above zero.
            </p>
          </div>

          {/* 2. Median & Average Trader P&L */}
          <div className="p-6 rounded-2xl bg-panel border border-subtle relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
              Median / Average Return
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-bear mt-2">
              {`-$${formatPrice(Math.abs(stats.medianPnlUsdt), 0)}`}
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Median loss: <strong className="text-white">{`-$${formatPrice(Math.abs(stats.medianPnlUsdt), 2)} USDT`}</strong>. Average loss: <strong className="text-bear">{`-$${formatPrice(Math.abs(stats.averagePnlUsdt), 2)} USDT`}</strong> due to catastrophic liquidation tails.
            </p>
          </div>

          {/* 3. Underperformed BTC Buy & Hold */}
          <div className="p-6 rounded-2xl bg-panel border border-subtle relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
              Lost To Buy-And-Hold
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 mt-2">
              {stats.buyAndHoldOutperformedPct}%
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Over 83% of active traders underperformed simply holding Bitcoin over the exact same period with zero stress.
            </p>
          </div>

          {/* 4. Average Holding Time */}
          <div className="p-6 rounded-2xl bg-panel border border-subtle relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
              Average Hold Duration
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-2">
              {stats.averageHoldTimeFormatted}
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Hyperactivity symptom: retail orders are closed in minutes, paying massive spread and fee drag to casino exchanges.
            </p>
          </div>
        </div>

        {/* P&L Distribution Curve Chart */}
        <div className="p-6 sm:p-8 rounded-2xl bg-panel border border-subtle space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="text-base font-bold text-white">The P&L Distribution Curve</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Sample of {stats.totalActiveTraders} paper accounts across {stats.totalTradesRecorded} closed executions. Notice the heavy skew toward deep drawdowns.
            </p>
          </div>

          <div className="space-y-3">
            {stats.pnlDistribution.map((bucket) => {
              const isLoss = bucket.range.includes('-');
              return (
                <div key={bucket.range} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold ${isLoss ? 'text-bear' : 'text-bull'}`}>
                      {bucket.range}
                    </span>
                    <span className="font-mono text-faint">
                      {bucket.pct}% of all traders ({bucket.count} accounts)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-canvas border border-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bucket.pct * 2.8}%`,
                        backgroundColor: bucket.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Most-Traded Assets vs Actual Market Performance (Prompt 2.1) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-panel border border-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Top 3 Most-Traded Assets vs. Actual Performance</h3>
              </div>
              <p className="text-xs text-muted mt-1">
                Comparing what the market did versus what retail traders achieved on the exact same asset.
              </p>
            </div>
            <span className="text-xs font-mono text-faint">
              {period}-Day Realized Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topAssetsVsPerformance.map((asset) => (
              <div
                key={asset.symbol}
                className="p-5 rounded-xl bg-canvas border border-subtle space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{`${asset.name} (${asset.symbol})`}</span>
                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-faint">
                      {`${asset.tradeSharePct}% of Volume`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-panel border border-subtle">
                      <div className="text-[10px] text-faint uppercase">Asset Price Move</div>
                      <div className="text-sm font-bold text-bull mt-0.5">
                        +{asset.assetPriceChangePct}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-panel border border-subtle">
                      <div className="text-[10px] text-faint uppercase">Trader Avg Return</div>
                      <div className="text-sm font-bold text-bear mt-0.5">
                        {asset.traderAveragePnlPct}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed pt-1">
                    {asset.honestInsight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychological Pitfalls Anatomy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-panel border border-bear/20 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-bear/10 text-bear flex items-center justify-center font-bold">
              <Flame size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">#1 Killer: {stats.mostCommonLosingBehavior.name}</h3>
            <p className="text-xs text-muted leading-relaxed">
              {stats.mostCommonLosingBehavior.description}
            </p>
            <div className="p-3 rounded-xl bg-canvas border border-bear/20 text-xs font-mono font-bold text-bear">
              {stats.mostCommonLosingBehavior.stat}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-panel border border-subtle space-y-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Brain size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">#2 Killer: {stats.secondaryLosingBehavior.name}</h3>
            <p className="text-xs text-muted leading-relaxed">
              {stats.secondaryLosingBehavior.description}
            </p>
            <div className="p-3 rounded-xl bg-canvas border border-subtle text-xs font-mono font-bold text-amber-400">
              {stats.secondaryLosingBehavior.stat}
            </div>
          </div>
        </div>

        {/* The Honest Platform Promise Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-canvas via-panel to-canvas border border-primary/30 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            &quot;The only trading platform that profits from you not losing money.&quot;
          </h2>
          <p className="text-xs text-muted max-w-xl mx-auto leading-relaxed">
            We don&apos;t sell secret signals. We don&apos;t take commissions on your churn. We build tamper-evident ledgers, daily hard loss caps, and brutal honesty so you can learn without losing your life savings.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-canvas font-bold text-xs transition-colors shadow-xl shadow-primary/20"
            >
              <span>Practice With Risk-Free Paper Capital</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6 border-t border-subtle text-xs text-faint">
        Celsius Network • Real-time Binance streams • 10,000 USDT Virtual Paper Trading • Verified Aggregate Telemetry
      </footer>
    </main>
  );
}
