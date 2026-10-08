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

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const summary = scoreboardService.getScoreboardSummary();
  const ogUrl = `/api/og/scoreboard?headline=${encodeURIComponent(summary.headlineFact)}`;

  return {
    title: 'The Scoreboard — Public Trading Call Scoring | Celsius Network',
    description: `Objectively scoring public figure trading calls against real Binance prices upon expiry. ${summary.headlineFact} Neutral. Factual. Undeniable.`,
    openGraph: {
      title: 'The Scoreboard — The Controversy Engine | Celsius Network',
      description: `${summary.headlineFact} Every public call held accountable against real Binance spot execution.`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: 'Celsius Scoreboard Accountability Engine',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Scoreboard — The Controversy Engine | Celsius Network',
      description: `${summary.headlineFact} Verified against real Binance market prices.`,
      images: [ogUrl],
    },
  };
}

export default function ScoreboardPage() {
  const summary = scoreboardService.getScoreboardSummary();

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
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
              <span>THE SCOREBOARD</span>
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
              href="/backtest"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              The Backtester
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
              Ledger Transparency
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
        {/* Hero Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <Scale size={13} className="text-amber-400" />
            <span>Public Call Scoring • The Controversy Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Holding public influencers accountable against real market data.
          </h1>

          <p className="text-muted text-sm sm:text-base max-w-2xl leading-relaxed">
            Anyone can submit a public figure&apos;s trading call. When their stated timeframe expires,
            our engine objectively scores the result against authoritative Binance prices: correct, wrong,
            or undefined — with exact percentage movement.
          </p>
        </div>

        {/* Interactive Viewer & Leaderboard */}
        <ScoreboardViewer initialSummary={summary} />

        {/* Grounding & Ethics Section */}
        <div className="p-6 rounded-2xl bg-panel border border-subtle space-y-3 text-xs leading-relaxed text-muted">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info size={16} className="text-primary" />
            <span>Methodology & Neutrality Invariant</span>
          </div>
          <p>
            The Scoreboard does not exist to mock individuals. It exists to protect retail traders from the
            asymmetry ofdeleted tweets, selective screenshot marketing, and unverified signal channels.
            All price calculations are derived directly from authoritative Binance Spot Kline records at the
            exact minute of call expiration.
          </p>
          <p className="text-faint font-mono text-[11px] pt-1">
            &ldquo;Tone: neutral, factual, undeniable. Never mock — let the numbers do the talking.&rdquo;
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center py-8 border-t border-subtle text-xs text-faint">
        Celsius Network • &ldquo;The only trading platform that profits from you not losing money.&rdquo; • Real Binance Feeds
      </footer>
    </div>
  );
}
