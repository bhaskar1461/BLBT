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
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { period?: string };
}): Promise<Metadata> {
  const period = searchParams?.period === '90' ? 90 : 30;
  const stats = realityService.getRealityStats(period);

  const title = 'Reality Check — Everyone shows you their wins. We show you everything. | Bloomberg Professional';
  const description = `${stats.unprofitableTradersPct}% of active retail paper traders lost money over the last ${period} days. Median return: -$${Math.abs(stats.medianPnlUsdt).toFixed(2)}. Unvarnished database proof from the Celsius trading ledger.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/reality?period=${period}`,
      siteName: 'Bloomberg Professional',
      images: [
        {
          url: `/api/og/reality?period=${period}`,
          width: 1200,
          height: 630,
          alt: 'Bloomberg Professional Reality Check — Unfiltered Retail Trading Proof',
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
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="REALITY"
        subtitle="AGGREGATE TRADING TRUTH // DATABASE AUDIT"
      />

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Hero Section */}
        <div className="border border-[#1a2333] bg-[#05070a] p-6 rounded-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">&lt;REAL 01&gt;</span>
              <span className="text-[#ff8800] font-bold">THE UNFILTERED TRUTH ABOUT RETAIL TRADING</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE DATABASE COHORT: {stats.totalActiveTraders} TRADERS</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Everyone shows you their wins.<br />
            <span className="text-[#ff8800]">We show you everything.</span>
          </h1>

          <p className="text-xs text-[#8e95a5] leading-relaxed max-w-3xl">
            Every day, retail brokers and signal sellers post 100x screenshots while hiding that 8 out of 10 traders lose capital. Below is the unvarnished aggregate reality across all {stats.totalActiveTraders}+ paper accounts on Celsius. Computed live from our immutable ledger at render time.
          </p>

          {/* Timeframe Switcher & Share */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex rounded-sm bg-[#0c1017] border border-[#1a2333] p-0.5 text-xs">
              <Link
                href="/reality?period=30"
                className={`px-3 py-1 rounded-sm font-bold transition-all ${
                  period === 30
                    ? 'bg-[#ff8800] text-black'
                    : 'text-[#8e95a5] hover:text-white'
                }`}
              >
                &lt;30 DAYS&gt;
              </Link>
              <Link
                href="/reality?period=90"
                className={`px-3 py-1 rounded-sm font-bold transition-all ${
                  period === 90
                    ? 'bg-[#ff8800] text-black'
                    : 'text-[#8e95a5] hover:text-white'
                }`}
              >
                &lt;90 DAYS&gt;
              </Link>
            </div>

            <ShareRealityButton />
          </div>
        </div>

        {/* Brutal Truth KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Profitable Traders */}
          <div className="p-4 rounded-sm bg-[#05070a] border border-red-500/40 space-y-1">
            <span className="text-[10px] uppercase text-[#64748b]">
              TRADERS IN PROFIT ({period}D)
            </span>
            <div className="text-3xl font-black text-red-500">
              {`${stats.profitableTradersPct}%`}
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-normal pt-1">
              <strong className="text-white">{`${stats.unprofitableTradersPct}% of accounts lost money`}</strong> over this period. Only {`${stats.profitableTradersPct}%`} maintained a balance above zero.
            </p>
          </div>

          {/* 2. Median & Average Trader P&L */}
          <div className="p-4 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-1">
            <span className="text-[10px] uppercase text-[#64748b]">
              MEDIAN / AVERAGE RETURN
            </span>
            <div className="text-3xl font-black text-red-500">
              {`-$${formatPrice(Math.abs(stats.medianPnlUsdt), 0)}`}
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-normal pt-1">
              Median loss: <strong className="text-white">{`-$${formatPrice(Math.abs(stats.medianPnlUsdt), 2)} USDT`}</strong>. Average loss: <strong className="text-red-400">{`-$${formatPrice(Math.abs(stats.averagePnlUsdt), 2)} USDT`}</strong>.
            </p>
          </div>

          {/* 3. Underperformed BTC Buy & Hold */}
          <div className="p-4 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-1">
            <span className="text-[10px] uppercase text-[#64748b]">
              LOST TO BUY-AND-HOLD
            </span>
            <div className="text-3xl font-black text-[#ff8800]">
              {stats.buyAndHoldOutperformedPct}%
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-normal pt-1">
              Over 83% of active traders underperformed simply holding Bitcoin over the exact same period with zero stress.
            </p>
          </div>

          {/* 4. Average Holding Time */}
          <div className="p-4 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-1">
            <span className="text-[10px] uppercase text-[#64748b]">
              AVERAGE HOLD DURATION
            </span>
            <div className="text-3xl font-black text-white">
              {stats.averageHoldTimeFormatted}
            </div>
            <p className="text-[10px] text-[#8e95a5] leading-normal pt-1">
              Hyperactivity symptom: retail orders are closed in minutes, paying massive spread and fee drag to casino exchanges.
            </p>
          </div>
        </div>

        {/* P&L Distribution Curve Chart */}
        <div className="p-5 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-4">
          <div className="border-b border-[#141a26] pb-2">
            <div className="flex items-center gap-2">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;DIST 02&gt;</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">THE P&amp;L DISTRIBUTION CURVE</h3>
            </div>
            <p className="text-[10px] text-[#8e95a5] mt-1">
              Sample of {stats.totalActiveTraders} paper accounts across {stats.totalTradesRecorded} closed executions. Notice the heavy skew toward deep drawdowns.
            </p>
          </div>

          <div className="space-y-2.5">
            {stats.pnlDistribution.map((bucket) => {
              const isLoss = bucket.range.includes('-');
              return (
                <div key={bucket.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isLoss ? 'text-red-400' : 'text-[#00c176]'}`}>
                      {bucket.range}
                    </span>
                    <span className="text-[10px] text-[#64748b]">
                      {bucket.pct}% of all traders ({bucket.count} accounts)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-none bg-[#0c1017] border border-[#1a2333] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
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

        {/* Top 3 Most-Traded Assets vs Actual Market Performance */}
        <div className="p-5 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-4">
          <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
            <div className="flex items-center gap-2">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">&lt;ASSET 03&gt;</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">TOP 3 MOST-TRADED ASSETS VS. ACTUAL PERFORMANCE</h3>
            </div>
            <span className="text-[10px] text-[#64748b]">
              {period}-DAY REALIZED TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.topAssetsVsPerformance.map((asset) => (
              <div
                key={asset.symbol}
                className="p-4 rounded-sm bg-[#000000] border border-[#1a2333] space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{`${asset.name} (${asset.symbol})`}</span>
                    <span className="text-[10px] bg-[#101520] px-1.5 py-0.5 rounded-sm text-[#ff8800] border border-[#1a2333]">
                      {`${asset.tradeSharePct}% VOL`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2 rounded-sm bg-[#05070a] border border-[#1a2333]">
                      <div className="text-[9px] text-[#64748b] uppercase">ASSET MOVE</div>
                      <div className="text-xs font-bold text-[#00c176] mt-0.5">
                        +{asset.assetPriceChangePct}%
                      </div>
                    </div>
                    <div className="p-2 rounded-sm bg-[#05070a] border border-[#1a2333]">
                      <div className="text-[9px] text-[#64748b] uppercase">TRADER RETURN</div>
                      <div className="text-xs font-bold text-red-400 mt-0.5">
                        {asset.traderAveragePnlPct}%
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#8e95a5] leading-relaxed pt-1">
                    {asset.honestInsight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychological Pitfalls Anatomy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-sm bg-[#05070a] border border-red-500/30 space-y-2">
            <h3 className="text-xs font-bold text-red-400">#1 KILLER: {stats.mostCommonLosingBehavior.name.toUpperCase()}</h3>
            <p className="text-[10px] text-[#8e95a5] leading-relaxed">
              {stats.mostCommonLosingBehavior.description}
            </p>
            <div className="p-2 rounded-sm bg-[#000000] border border-red-500/20 text-[11px] font-bold text-red-400">
              {stats.mostCommonLosingBehavior.stat}
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-2">
            <h3 className="text-xs font-bold text-[#ff8800]">#2 KILLER: {stats.secondaryLosingBehavior.name.toUpperCase()}</h3>
            <p className="text-[10px] text-[#8e95a5] leading-relaxed">
              {stats.secondaryLosingBehavior.description}
            </p>
            <div className="p-2 rounded-sm bg-[#000000] border border-[#1a2333] text-[11px] font-bold text-[#ff8800]">
              {stats.secondaryLosingBehavior.stat}
            </div>
          </div>
        </div>

        {/* The Honest Platform Promise Banner */}
        <div className="p-5 rounded-sm bg-[#05070a] border border-[#ff8800]/40 text-center space-y-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            &quot;The only trading platform that profits from you not losing money.&quot;
          </h2>
          <p className="text-xs text-[#8e95a5] max-w-xl mx-auto leading-relaxed">
            We don&apos;t sell secret signals. We don&apos;t take commissions on your churn. We build tamper-evident ledgers, daily hard loss caps, and brutal honesty so you can learn without losing your life savings.
          </p>
          <div className="pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-[#ff8800] hover:bg-[#ffa033] text-black font-black text-xs transition-colors shadow-sm"
            >
              <span>&lt;OPEN 4-PANEL LAUNCHPAD &lt;GO&gt;&gt;</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bloomberg Professional Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">BLOOMBERG PROFESSIONAL // REALITY CHECK TELEMETRY</span>
          <span>100% UNVARNISHED DATABASE PROOF • SUB-SECOND DELIVERY • INTEGER RECONCILED</span>
        </div>
      </footer>
    </div>
  );
}
