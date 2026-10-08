// src/components/tournaments/TournamentDetailClientView.tsx
'use client';

import React, { useState } from 'react';
import { TournamentLeaderboardTable } from './TournamentLeaderboardTable';
import { JoinTournamentModal } from './JoinTournamentModal';
import { Share2, Trophy, ShieldCheck, Check } from 'lucide-react';
import type { Tournament, TournamentParticipant } from '@/lib/tournamentService';

interface TournamentDetailClientViewProps {
  tournament: Tournament;
  leaderboard: TournamentParticipant[];
  currentUserId?: string;
}

export const TournamentDetailClientView: React.FC<TournamentDetailClientViewProps> = ({
  tournament,
  leaderboard: initialLeaderboard,
  currentUserId = 'usr_celsius_demo',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<TournamentParticipant[]>(initialLeaderboard);
  const [copied, setCopied] = useState(false);

  const isUserRegistered = leaderboard.some((p) => p.userId === currentUserId);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegisteredSuccess = async () => {
    try {
      const res = await fetch(`/api/tournaments?id=${tournament.id}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Failed to refresh leaderboard:', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-panel border border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">
            Total Competitors: <strong className="text-white font-bold">{leaderboard.length}</strong>
          </span>
          <span className="text-faint">•</span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Zero Entry Fees ($0)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface hover:bg-hover border border-subtle text-muted hover:text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check size={13} className="text-bull" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied Link' : 'Share Tournament'}</span>
          </button>

          {!isUserRegistered && tournament.status !== 'completed' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Trophy size={13} />
              <span>Join Competition (Free)</span>
            </button>
          )}

          {isUserRegistered && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bull/15 text-bull border border-bull/30 text-xs font-mono font-bold">
              <ShieldCheck size={14} />
              <span>You are Competing</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <span>Tournament Standings</span>
          </h2>
          <span className="text-xs font-mono text-faint">
            Updated Real-Time • Ledger Hash Stamped
          </span>
        </div>

        <TournamentLeaderboardTable
          participants={leaderboard}
          currentUserId={currentUserId}
        />
      </div>

      {/* Join Modal */}
      <JoinTournamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tournament={tournament}
        onRegisteredSuccess={handleRegisteredSuccess}
      />
    </div>
  );
};
