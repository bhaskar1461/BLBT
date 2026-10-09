// src/app/sentiment/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Clock,
  Shield,
  Eye,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { sentimentService } from '@/lib/sentimentService';
import { SentimentChart } from '@/components/sentiment/SentimentChart';
import { ShareSentimentButton } from '@/components/sentiment/ShareSentimentButton';
import { formatPrice } from '@/lib/utils';
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

interface SentimentPageProps {
  searchParams: {
    symbol?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SentimentPageProps): Promise<Metadata> {
  const symbol = (searchParams.symbol || 'BTCUSDT').toUpperCase();
  const data = sentimentService.getPublicDelayedSentiment(symbol);
  const ogUrl = `/api/og/sentiment?symbol=${symbol}&long=${data.currentSummary.longPct}&wrong=${data.currentSummary.crowdWrongCount}&total=${data.currentSummary.crowdTotalMovesCount}`;

  return {
    title: `${symbol} Retail Sentiment Index | The Honest Terminal`,
    description: `See what the herd is doing before entering. Retail was ${data.currentSummary.longPct}% long on ${symbol}. Contrarian crowd positioning overlaid against price.`,
    openGraph: {
      title: `${symbol} Sentiment Index — The Honest Terminal`,
      description: `Retail crowd has been wrong ${data.currentSummary.crowdWrongCount} of last ${data.currentSummary.crowdTotalMovesCount} moves on ${symbol}.`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${symbol} Sentiment Index`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Sentiment Index — The Honest Terminal`,
      description: `Retail crowd has been wrong ${data.currentSummary.crowdWrongCount} of last ${data.currentSummary.crowdTotalMovesCount} moves on ${symbol}.`,
      images: [ogUrl],
    },
  };
}

export default function SentimentPage({ searchParams }: SentimentPageProps) {
  const activeSymbol = (searchParams.symbol || 'BTCUSDT').toUpperCase();
  const sentimentData = sentimentService.getPublicDelayedSentiment(activeSymbol);
  const { currentSummary, timeSeries, crowdContrarianStat } = sentimentData;

  const supportedAssets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: '🔶' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="SENT"
        subtitle="AGGREGATE POSITIONING // CONTRARIAN INDEX"
      />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <Compass size={13} className="text-primary" />
            <span>Unfair Advantage Engine • Contrarian Positioning</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            See what the herd is doing. Then consider not being the herd.
          </h1>

          <p className="text-muted text-sm sm:text-base max-w-2xl leading-relaxed">
            Brokers sell your order flow to market makers who trade against you. We aggregate all
            retail positions into a public contrarian index — freely, transparently, and structurally
            anonymized.
          </p>
        </div>

        {/* Honest Findings Callout Banner (Prompt 4.2 verbatim) */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
              ⚠️
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                {currentSummary.headlineInsight}
              </h2>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-xl">
                {crowdContrarianStat}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <ShareSentimentButton
              symbol={activeSymbol}
              longPct={currentSummary.longPct}
            />
          </div>
        </div>

        {/* Asset Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {supportedAssets.map((asset) => {
            const isSelected = asset.symbol === activeSymbol;
            return (
              <Link
                key={asset.symbol}
                href={`/sentiment?symbol=${asset.symbol}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                    : 'bg-card border-subtle text-muted hover:text-white hover:border-cardborder'
                }`}
              >
                <span>{asset.icon}</span>
                <span>{asset.name}</span>
                <span className="font-mono text-[10px] opacity-80">
                  ({asset.symbol.replace('USDT', '')})
                </span>
              </Link>
            );
          })}
        </div>

        {/* Primary Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-card border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-faint tracking-wider">
              Retail Long vs Short
            </span>
            <div className="text-xl font-bold font-mono text-bull mt-1">
              {currentSummary.longPct}% <span className="text-xs text-muted">/</span>{' '}
              <span className="text-bear">{currentSummary.shortPct}%</span>
            </div>
            <div className="w-full bg-bear h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-bull h-full"
                style={{ width: `${currentSummary.longPct}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-faint tracking-wider">
              Crowd vs Price Accuracy
            </span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {currentSummary.crowdAccuracyPct}%
            </div>
            <span className="text-[11px] text-faint mt-1 block">
              Wrong {currentSummary.crowdWrongCount} of {currentSummary.crowdTotalMovesCount} major moves
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-faint tracking-wider">
              Net Retail Positioning
            </span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${formatPrice(Math.abs(currentSummary.netPositioningUsdt), 0)}
            </div>
            <span className="text-[11px] text-bull mt-1 block capitalize font-semibold">
              {currentSummary.flowTrend} Imbalance
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-faint tracking-wider">
              Trader Cohort Sample
            </span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {currentSummary.traderCohortCount} Traders
            </div>
            <span className="text-[11px] text-bull mt-1 block font-mono">
              ✓ Cohort &ge; 25 Invariant Met
            </span>
          </div>
        </div>

        {/* Time-Series Chart Area */}
        <div className="p-5 rounded-2xl bg-card border border-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {activeSymbol} Retail Long % vs Price Over Time
              </h2>
              <p className="text-xs text-faint mt-0.5">
                Notice how retail long exposure typically peaks right before sharp downward liquidations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                24H DELAYED PUBLIC TIER
              </span>
            </div>
          </div>

          <SentimentChart data={timeSeries} symbol={activeSymbol} />
        </div>

        {/* Structural Privacy & Performance Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <Shield size={16} className="text-bull" />
              <span>Structural Privacy Invariant (Non-Promissory)</span>
            </div>
            <p className="text-muted leading-relaxed">
              Every metric on this page is aggregated across a minimum cohort of 25 active traders.
              Zero user IDs or private order histories ever leave the server. No per-user tracking or
              data export exists in our database schema or API layer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-panel border border-subtle space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <Clock size={16} className="text-primary" />
              <span>Real-Time Stream Inside Terminal</span>
            </div>
            <p className="text-muted leading-relaxed">
              This public page is delayed by 24 hours to prevent high-frequency arbitrage. Active traders
              inside the Celsius terminal receive the live, un-delayed sentiment strip directly beside
              the trading chart.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
