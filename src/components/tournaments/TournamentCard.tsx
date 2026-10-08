// src/components/tournaments/TournamentCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, Clock, Users, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import type { Tournament } from '@/lib/tournamentService';

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: string) => void;
  isRegistered?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  isRegistered = false,
}) => {
  const isUpcoming = tournament.status === 'upcoming';
  const isActive = tournament.status === 'active';
  const isCompleted = tournament.status === 'completed';

  const startDate = new Date(tournament.startsAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const endDate = new Date(tournament.endsAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-panel border border-subtle hover:border-border-card transition-all rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm">
      {/* Top Accent Gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isActive
            ? 'bg-gradient-to-r from-bull to-primary'
            : isUpcoming
            ? 'bg-gradient-to-r from-amber-400 to-amber-600'
            : 'bg-gradient-to-r from-zinc-600 to-zinc-700'
        }`}
      />

      <div className="space-y-3.5">
        {/* Status & Entry Fee Invariant Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                isActive
                  ? 'bg-bull/15 text-bull border border-bull/30'
                  : isUpcoming
                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {tournament.status}
            </span>

            {/* Zero Entry Fee Invariant Badge */}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FREE ENTRY ($0)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <Clock size={13} />
            <span>
              {startDate} – {endDate}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-bull transition-colors">
            {tournament.title}
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
            {tournament.description}
          </p>
        </div>

        {/* Key Rules Matrix */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-surface/80 border border-subtle/60 text-[11px]">
          <div>
            <span className="text-faint block text-[10px]">Starting Balance</span>
            <span className="font-mono font-bold text-white">
              ${tournament.startingBalanceUsdt.toLocaleString()} USDT
            </span>
          </div>
          <div>
            <span className="text-faint block text-[10px]">Risk Cap / Trade</span>
            <span className="font-mono font-bold text-bull">
              {tournament.riskCapPct.toFixed(1)}% Max
            </span>
          </div>
          <div>
            <span className="text-faint block text-[10px]">Ranking Metric</span>
            <span className="font-mono font-bold text-amber-400">
              Risk-Adjusted Score
            </span>
          </div>
        </div>

        {/* Anti-Casino Assurance */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck size={13} className="text-bull shrink-0" />
          <span>No YOLO leverage. Ranked by return divided by max drawdown.</span>
        </div>
      </div>

      {/* Footer & CTA */}
      <div className="mt-5 pt-3.5 border-t border-subtle/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
          <Users size={13} />
          <span>{tournament.participantCount} verified traders</span>
        </div>

        <div className="flex items-center gap-2">
          {onJoin && !isRegistered && !isCompleted && (
            <button
              onClick={() => onJoin(tournament.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Join Free
            </button>
          )}

          {isRegistered && (
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-bull/20 text-bull border border-bull/40">
              ✓ Registered
            </span>
          )}

          <Link
            href={`/tournaments/${tournament.id}`}
            className="btn btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <span>Leaderboard</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
