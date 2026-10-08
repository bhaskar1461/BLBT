// src/app/tournaments/[id]/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { tournamentService } from '@/lib/tournamentService';
import { TournamentDetailClientView } from '@/components/tournaments/TournamentDetailClientView';

export const dynamic = 'force-dynamic';

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { id } = await params;
  const tournament = tournamentService.getTournament(id);
  if (!tournament) {
    return { title: 'Tournament Not Found | Celsius Network' };
  }

  return {
    title: `${tournament.title} — Risk-Adjusted Tournament | Celsius Network`,
    description: `${tournament.description} Zero entry fees. Ranked strictly by risk-adjusted return.`,
    openGraph: {
      title: `${tournament.title} | The Honest Terminal`,
      description: tournament.description,
      images: [
        {
          url: '/api/og/sentiment?symbol=BTCUSDT',
          width: 1200,
          height: 630,
          alt: tournament.title,
        },
      ],
    },
  };
}

export default async function TournamentDetailPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournament = tournamentService.getTournament(id);

  if (!tournament) {
    notFound();
  }

  const leaderboard = tournamentService.getLeaderboard(id);

  const startDate = new Date(tournament.startsAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDate = new Date(tournament.endsAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-canvas text-main font-sans selection:bg-bull/20">
      {/* Top Header Navigation */}
      <header className="border-b border-subtle bg-panel/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/tournaments"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>All Tournaments</span>
            </Link>
            <span className="text-faint text-xs font-mono">•</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
              <Trophy size={12} />
              <span className="truncate max-w-[200px]">{tournament.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/scoreboard"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Scoreboard
            </Link>
            <Link
              href="/reality"
              className="text-faint hover:text-white transition-colors hidden md:inline"
            >
              Reality Check
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
        {/* Tournament Hero Card */}
        <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Status Badge & Entry Fee */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                  tournament.status === 'active'
                    ? 'bg-bull/15 text-bull border border-bull/30'
                    : tournament.status === 'upcoming'
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {tournament.status}
              </span>

              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ENTRY FEE: $0.00 FREE
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <Calendar size={14} className="text-faint" />
              <span>
                {startDate} – {endDate}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {tournament.title}
            </h1>
            <p className="text-muted text-sm max-w-3xl leading-relaxed">
              {tournament.description}
            </p>
          </div>

          {/* Rules Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-surface border border-subtle space-y-0.5">
              <span className="text-[10px] font-mono text-faint uppercase block">
                Starting Balance
              </span>
              <span className="font-mono font-bold text-sm text-white">
                ${tournament.startingBalanceUsdt.toLocaleString()} USDT
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-subtle space-y-0.5">
              <span className="text-[10px] font-mono text-faint uppercase block">
                Per-Trade Risk Cap
              </span>
              <span className="font-mono font-bold text-sm text-bull">
                {tournament.riskCapPct.toFixed(1)}% Max
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-subtle space-y-0.5">
              <span className="text-[10px] font-mono text-faint uppercase block">
                Max Daily Loss Lock
              </span>
              <span className="font-mono font-bold text-sm text-bear">
                -{tournament.maxDailyLossPct.toFixed(1)}% Hard Stop
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-subtle space-y-0.5">
              <span className="text-[10px] font-mono text-faint uppercase block">
                Eligible Pairs
              </span>
              <span className="font-mono font-bold text-xs text-amber-400">
                {tournament.rules.eligiblePairs.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Client View with Interactive Leaderboard and Modal */}
        <TournamentDetailClientView
          tournament={tournament}
          leaderboard={leaderboard}
        />
      </main>
    </div>
  );
}
