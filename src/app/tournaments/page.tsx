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
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Risk-Adjusted Tournaments — Community Without Casino Vibes | Bloomberg Professional',
  description:
    'Where discipline beats leverage. Zero entry fees. Ranked strictly by return divided by max drawdown, not raw P&L. Statistically improbable win rates auto-flagged.',
  openGraph: {
    title: 'Risk-Adjusted Tournaments | Bloomberg Professional',
    description:
      'Zero entry fees. 1.0% risk cap per trade. Ranked by risk-adjusted return, never raw P&L.',
    images: [
      {
        url: '/api/og/sentiment?symbol=BTCUSDT',
        width: 1200,
        height: 630,
        alt: 'Tournaments',
      },
    ],
  },
};

export default function TournamentsPage() {
  const tournaments = tournamentService.listTournaments();

  return (
    <div className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col justify-between">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="TOUR"
        subtitle="RISK-ADJUSTED TOURNAMENTS // ZERO CASINO VIBES"
      />

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 flex-1">
        {/* Hero Section */}
        <div className="border border-[#1a2333] bg-[#05070a] p-6 rounded-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 bg-[#ff8800] text-black font-black text-[10px]">&lt;TOUR 01&gt;</span>
              <span className="text-[#ff8800] font-bold">DISCIPLINED COMPETITION // ZERO CASINO VIBES</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#00c176] font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[#00c176] animate-pulse" />
              <span>ENTRY FEE: $0.00 FOREVER</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Where trading discipline beats reckless YOLO leverage.
          </h1>

          <p className="text-[#8e95a5] text-xs max-w-3xl leading-relaxed">
            Traditional trading competitions reward gamblers who risk 90% drawdowns to hit lucky 100x wins.
            Celsius tournaments flip the incentives: <strong className="text-white">free forever</strong>, enforced <strong className="text-white">1.0% risk cap</strong>, and ranked purely by <strong className="text-[#00c176]">risk-adjusted return</strong>.
          </p>

          {/* Core Invariants Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333] space-y-1">
              <span className="text-[10px] text-[#64748b] uppercase block">Entry Fee</span>
              <span className="text-sm font-bold text-[#00c176]">$0.00 Free</span>
              <p className="text-[10px] text-[#8e95a5]">No casino pay-to-play paywalls</p>
            </div>

            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333] space-y-1">
              <span className="text-[10px] text-[#64748b] uppercase block">Risk Cap / Trade</span>
              <span className="text-sm font-bold text-[#ff8800]">1.0% Max Cap</span>
              <p className="text-[10px] text-[#8e95a5]">Enforced on every order execution</p>
            </div>

            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333] space-y-1">
              <span className="text-[10px] text-[#64748b] uppercase block">Ranking Metric</span>
              <span className="text-sm font-bold text-[#00d8d6]">Return ÷ Drawdown</span>
              <p className="text-[10px] text-[#8e95a5]">High drawdowns severely penalized</p>
            </div>

            <div className="p-3 rounded-sm bg-[#000000] border border-[#1a2333] space-y-1">
              <span className="text-[10px] text-[#64748b] uppercase block">Audit Verification</span>
              <span className="text-sm font-bold text-white">Auto-Flag Engine</span>
              <p className="text-[10px] text-[#8e95a5]">Impossible win rates flagged for review</p>
            </div>
          </div>
        </div>

        {/* Client Tournament List and Interactive Modals */}
        <TournamentsClientView tournaments={tournaments} />

        {/* Anti-Casino Education & Transparency Panel */}
        <div className="bg-[#05070a] border border-[#1a2333] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="text-[#ff8800]" size={18} />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              THE MATH BEHIND RISK-ADJUSTED SCORING
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-[#8e95a5]">
            <div className="p-4 rounded-sm bg-[#000000] border border-[#1a2333] space-y-2">
              <span className="text-xs font-bold text-[#00c176] block uppercase">
                The Disciplined Trader (Rank #1)
              </span>
              <div className="text-xs text-white space-y-1">
                <div>• Net Return: <strong className="text-[#00c176]">+14.8%</strong></div>
                <div>• Max Drawdown: <strong className="text-white">2.1%</strong></div>
                <div>• Trades: <strong className="text-white">16 (11W / 5L)</strong></div>
                <div className="pt-1 text-[#00c176] font-bold text-xs">
                  Formula: 14.8 ÷ (2.1 + 1.0) = 4.77 Score
                </div>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Maintained strict risk control, never blew up, and achieved steady compounding without roulette risk.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-[#000000] border border-[#1a2333] space-y-2">
              <span className="text-xs font-bold text-red-400 block uppercase">
                The Degen Gambler (Rank #3)
              </span>
              <div className="text-xs text-white space-y-1">
                <div>• Net Return: <strong className="text-red-400">+32.0% (Higher raw P&amp;L!)</strong></div>
                <div>• Max Drawdown: <strong className="text-red-400">38.4%</strong></div>
                <div>• Trades: <strong className="text-white">18 (10W / 8L)</strong></div>
                <div className="pt-1 text-[#64748b] font-bold text-xs">
                  Formula: 32.0 ÷ (38.4 + 1.0) = 0.81 Score
                </div>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Despite a higher raw dollar return, the 38.4% peak drawdown proves survival was pure luck. Ranked lower.
              </p>
            </div>
          </div>

          {/* Anomaly Flagging Policy */}
          <div className="p-3.5 rounded-sm bg-[#ff8800]/10 border border-[#ff8800]/30 text-xs text-[#ff8800] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Statistical Anomaly Detection Invariant</span>
            </div>
            <p className="text-[#ff8800]/80 leading-relaxed text-[11px]">
              Any participant showing a statistically improbable win rate (≥95% across 8+ trades or 100% across 5+ trades) is automatically tagged with <strong className="text-white">FLAGGED FOR REVIEW</strong>. We celebrate losses with equal dignity and refuse to let manipulated bots or retrospective cherry-picking fool the community.
            </p>
          </div>
        </div>
      </main>

      {/* Bloomberg Professional Terminal Footer */}
      <footer className="border-t border-[#1a2333] bg-[#000000] py-4 text-center text-[10px] text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#ff8800]">BLOOMBERG PROFESSIONAL // TOURNAMENTS</span>
          <span>&ldquo;THE ONLY TRADING PLATFORM THAT PROFITS FROM YOU NOT LOSING MONEY.&rdquo; • ZERO CASINO VIBES</span>
        </div>
      </footer>
    </div>
  );
}
