// src/app/tournaments/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  Percent,
  TrendingDown,
  AlertTriangle,
  Zap,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { tournamentService } from '@/lib/tournamentService';
import { TournamentsClientView } from '@/components/tournaments/TournamentsClientView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Risk-Adjusted Tournaments — Community Without Casino Vibes | Celsius Network',
  description:
    'Where discipline beats leverage. Zero entry fees. Ranked strictly by return divided by max drawdown, not raw P&L. Statistically improbable win rates auto-flagged.',
  openGraph: {
    title: 'Risk-Adjusted Tournaments | The Honest Terminal',
    description:
      'Zero entry fees. 1.0% risk cap per trade. Ranked by risk-adjusted return, never raw P&L.',
    images: [
      {
        url: '/api/og/sentiment?symbol=BTCUSDT',
        width: 1200,
        height: 630,
        alt: 'Celsius Tournaments',
      },
    ],
  },
};

export default function TournamentsPage() {
  const tournaments = tournamentService.listTournaments();

  return (
    <div className="min-h-screen bg-canvas text-main font-sans selection:bg-bull/20">
      {/* Top Header Navigation */}
      <header className="border-b border-subtle bg-panel/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bull to-primary flex items-center justify-center font-bold text-black text-sm shadow-md shadow-bull/20">
                °C
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                Celsius Network
              </span>
            </Link>
            <span className="text-faint text-xs font-mono">•</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
              <Trophy size={12} />
              <span>TOURNAMENTS</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/scoreboard"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              The Scoreboard
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
              Reality Check
            </Link>
            <Link
              href="/transparency"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Transparency
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
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-subtle text-xs text-muted font-mono">
            <Trophy size={13} className="text-amber-400" />
            <span>DISCIPLINED COMPETITION // ZERO CASINO VIBES</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Where trading discipline beats reckless YOLO leverage.
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-3xl leading-relaxed">
              Traditional trading competitions reward gamblers who risk 90% drawdowns to hit lucky 100x wins.
              Celsius tournaments flip the incentives: <strong className="text-white">free forever</strong>, enforced <strong className="text-white">1.0% risk cap</strong>, and ranked purely by <strong className="text-bull">risk-adjusted return</strong>.
            </p>
          </div>

          {/* Core Invariants Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Entry Fee</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">$0.00 Free</span>
              <p className="text-[11px] text-muted">No casino pay-to-play paywalls</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Risk Cap / Trade</span>
              <span className="text-base font-extrabold text-bull font-mono">1.0% Max Cap</span>
              <p className="text-[11px] text-muted">Enforced on every order execution</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Ranking Metric</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">Return ÷ Drawdown</span>
              <p className="text-[11px] text-muted">High drawdowns severely penalized</p>
            </div>

            <div className="p-3.5 rounded-xl bg-panel border border-subtle space-y-1">
              <span className="text-[10px] font-mono text-faint uppercase block">Audit Verification</span>
              <span className="text-base font-extrabold text-primary font-mono">Auto-Flag Engine</span>
              <p className="text-[11px] text-muted">Impossible win rates flagged for review</p>
            </div>
          </div>
        </div>

        {/* Client Tournament List and Interactive Modals */}
        <TournamentsClientView tournaments={tournaments} />

        {/* Anti-Casino Education & Transparency Panel */}
        <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="text-amber-400" size={20} />
            <h2 className="text-lg font-bold text-white tracking-tight">
              The Math Behind Risk-Adjusted Scoring
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted leading-relaxed">
            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2.5">
              <span className="text-xs font-bold text-bull block uppercase font-mono">
                The Disciplined Trader (Rank #1)
              </span>
              <div className="font-mono text-xs text-white space-y-1">
                <div>• Net Return: <strong className="text-bull">+14.8%</strong></div>
                <div>• Max Drawdown: <strong className="text-white">2.1%</strong></div>
                <div>• Trades: <strong className="text-white">16 (11W / 5L)</strong></div>
                <div className="pt-1 text-bull font-bold text-sm">
                  Formula: 14.8 ÷ (2.1 + 1.0) = 4.77 Score
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                Maintained strict risk control, never blew up, and achieved steady compounding without roulette risk.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2.5">
              <span className="text-xs font-bold text-bear block uppercase font-mono">
                The Degen Gambler (Rank #3)
              </span>
              <div className="font-mono text-xs text-white space-y-1">
                <div>• Net Return: <strong className="text-bear">+32.0% (Higher raw P&L!)</strong></div>
                <div>• Max Drawdown: <strong className="text-bear">38.4%</strong></div>
                <div>• Trades: <strong className="text-white">18 (10W / 8L)</strong></div>
                <div className="pt-1 text-zinc-400 font-bold text-sm">
                  Formula: 32.0 ÷ (38.4 + 1.0) = 0.81 Score
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                Despite a higher raw dollar return, the 38.4% peak drawdown proves survival was pure luck. Ranked lower.
              </p>
            </div>
          </div>

          {/* Anomaly Flagging Policy */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Statistical Anomaly Detection Invariant</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed text-[11px]">
              Any participant showing a statistically improbable win rate (≥95% across 8+ trades or 100% across 5+ trades) is automatically tagged with <strong className="text-white">FLAGGED FOR REVIEW</strong>. We celebrate losses with equal dignity and refuse to let manipulated bots or retrospective cherry-picking fool the community.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
