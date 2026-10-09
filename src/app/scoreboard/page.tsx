// src/app/scoreboard/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { scoreboardService } from '@/lib/scoreboardService';
import { ScoreboardViewer } from '@/components/scoreboard/ScoreboardViewer';
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const summary = scoreboardService.getScoreboardSummary();
  const ogUrl = `/api/og/scoreboard?headline=${encodeURIComponent(summary.headlineFact)}`;

  return {
    title: 'The Scoreboard — Public Trading Call Scoring | Bloomberg Professional',
    description: `Objectively scoring public figure trading calls against real Binance prices upon expiry. ${summary.headlineFact} Neutral. Factual. Undeniable.`,
    openGraph: {
      title: 'The Scoreboard — The Controversy Engine | Bloomberg Professional',
      description: `${summary.headlineFact} Every public call held accountable against real Binance spot execution.`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: 'Bloomberg Professional Scoreboard Accountability Engine',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Scoreboard — The Controversy Engine | Bloomberg Professional',
      description: `${summary.headlineFact} Verified against real Binance market prices.`,
      images: [ogUrl],
    },
  };
}

export default function ScoreboardPage() {
  const summary = scoreboardService.getScoreboardSummary();

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="SCORE"
        subtitle="PUBLIC CALL SCORING // CONTROVERSY ENGINE"
      />

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Hero Section */}
        <div className="border border-[#1a2333] bg-[#05070a] p-6 rounded-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">&lt;SCORE 01&gt;</span>
              <span className="text-[#ff8800] font-bold">PUBLIC INFLUENCER ACCOUNTABILITY ENGINE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#00c176] font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[#00c176] animate-pulse" />
              <span>REAL BINANCE SPOT EXPIRY EXECUTION</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Holding public influencers accountable against real market data.
          </h1>

          <p className="text-xs text-[#8e95a5] max-w-3xl leading-relaxed">
            Anyone can submit a public figure&apos;s trading call. When their stated timeframe expires,
            our engine objectively scores the result against authoritative Binance prices: correct, wrong,
            or undefined — with exact percentage movement.
          </p>
        </div>

        {/* Interactive Viewer & Leaderboard */}
        <ScoreboardViewer initialSummary={summary} />

        {/* Grounding & Ethics Section */}
        <div className="p-5 rounded-sm bg-[#05070a] border border-[#1a2333] space-y-2 text-xs leading-relaxed text-[#8e95a5]">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <span className="text-[#ff8800]">&lt;NOTE&gt;</span>
            <span>METHODOLOGY &amp; NEUTRALITY INVARIANT</span>
          </div>
          <p className="text-[11px]">
            The Scoreboard does not exist to mock individuals. It exists to protect retail traders from the
            asymmetry of deleted tweets, selective screenshot marketing, and unverified signal channels.
            All price calculations are derived directly from authoritative Binance Spot Kline records at the
            exact minute of call expiration.
          </p>
          <p className="text-[#64748b] text-[10px] pt-1">
            &ldquo;Tone: neutral, factual, undeniable. Never mock — let the numbers do the talking.&rdquo;
          </p>
        </div>
      </main>

      {/* Bloomberg Professional Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">BLOOMBERG PROFESSIONAL // THE SCOREBOARD</span>
          <span>&ldquo;THE ONLY TRADING PLATFORM THAT PROFITS FROM YOU NOT LOSING MONEY.&rdquo; • BINANCE VERIFIED</span>
        </div>
      </footer>
    </div>
  );
}
