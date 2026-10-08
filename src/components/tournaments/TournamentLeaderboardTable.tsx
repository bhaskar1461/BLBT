// src/components/tournaments/TournamentLeaderboardTable.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  ExternalLink,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { TournamentParticipant } from '@/lib/tournamentService';

interface TournamentLeaderboardTableProps {
  participants: TournamentParticipant[];
  currentUserId?: string;
}

export const TournamentLeaderboardTable: React.FC<TournamentLeaderboardTableProps> = ({
  participants,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'clean'>('all');

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'flagged') return p.isFlaggedForReview;
    if (filter === 'clean') return !p.isFlaggedForReview;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Educational Banner: Why Risk-Adjusted Score Matters */}
      <div className="bg-surface/80 border border-subtle rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={16} />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>How Rankings Work: The Anti-Casino Metric</span>
              <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-amber-300">
                Score = Net Return % ÷ (Max Drawdown % + 1.0)
              </span>
            </div>
            <p className="text-muted leading-relaxed max-w-3xl">
              Unlike retail casino brokers that celebrate 100x YOLO gambles, Celsius ranks traders strictly by
              capital preservation and risk-adjusted efficiency. A trader with <span className="text-bull font-semibold">+15% return and 2% drawdown (Score 5.0)</span> beats a gambler with <span className="text-bear font-semibold">+35% return and 40% drawdown (Score 0.85)</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-canvas/60 px-3 py-1.5 rounded-lg border border-subtle shrink-0">
          <ShieldCheck size={13} className="text-bull" />
          <span>Append-Only Ledger Stamped</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search traders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-faint focus:outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              filter === 'all'
                ? 'bg-primary text-black font-bold'
                : 'bg-surface text-muted hover:text-white border border-subtle'
            }`}
          >
            All ({participants.length})
          </button>
          <button
            onClick={() => setFilter('clean')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              filter === 'clean'
                ? 'bg-bull/20 text-bull border border-bull/40 font-bold'
                : 'bg-surface text-muted hover:text-white border border-subtle'
            }`}
          >
            Verified ({participants.filter((p) => !p.isFlaggedForReview).length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              filter === 'flagged'
                ? 'bg-bear/20 text-bear border border-bear/40 font-bold'
                : 'bg-surface text-muted hover:text-white border border-subtle'
            }`}
          >
            Flagged Review ({participants.filter((p) => p.isFlaggedForReview).length})
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="border border-subtle rounded-xl overflow-hidden bg-panel shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-subtle bg-surface/60 text-faint font-mono text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Trader</th>
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
                    <span>Risk-Adj Score</span>
                    <span title="Return % / (Max DD % + 1.0)">
                      <HelpCircle size={12} />
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Net Return %</th>
                <th className="py-3 px-4 text-right">Max Drawdown</th>
                <th className="py-3 px-4 text-center">Record (W / L)</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted">
                    No tournament participants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isUser = p.userId === currentUserId;
                  const isTop3 = p.rank <= 3;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-hover/50 transition-colors ${
                        isUser ? 'bg-primary/5 font-medium' : ''
                      } ${p.isFlaggedForReview ? 'bg-bear/5' : ''}`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center font-mono">
                        {p.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                            🥇
                          </span>
                        ) : p.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-bold text-xs border border-slate-300/30">
                            🥈
                          </span>
                        ) : p.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs border border-amber-600/30">
                            🥉
                          </span>
                        ) : (
                          <span className="text-muted font-bold">#{p.rank}</span>
                        )}
                      </td>

                      {/* Trader Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface border border-subtle flex items-center justify-center text-xs font-bold text-muted overflow-hidden shrink-0">
                            {p.avatarUrl ? (
                              <img
                                src={p.avatarUrl}
                                alt={p.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{p.displayName.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white hover:text-bull transition-colors">
                                {p.displayName}
                              </span>
                              {isUser && (
                                <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-primary/20 text-primary border border-primary/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-faint font-mono">
                              @{p.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Risk-Adjusted Score */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={`text-sm font-extrabold ${
                            isTop3 ? 'text-amber-400' : 'text-white'
                          }`}
                        >
                          {p.riskAdjustedScore.toFixed(2)}
                        </span>
                      </td>

                      {/* Net Return % */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={`font-bold ${
                            p.realizedPnlPct >= 0 ? 'text-bull' : 'text-bear'
                          }`}
                        >
                          {p.realizedPnlPct >= 0 ? '+' : ''}
                          {p.realizedPnlPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Max Drawdown */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            p.maxDrawdownPct > 15
                              ? 'text-bear'
                              : p.maxDrawdownPct > 5
                              ? 'text-amber-400'
                              : 'text-zinc-300'
                          }`}
                        >
                          -{p.maxDrawdownPct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Trades Record (Equal Billing For Losses) */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded border border-subtle text-[11px]">
                          <span className="text-bull font-bold">{p.winningTrades}W</span>
                          <span className="text-faint">/</span>
                          <span className="text-bear font-bold">{p.losingTrades}L</span>
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="font-semibold text-zinc-300">
                          {p.winRatePct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Audit Status & Auto-Flagging */}
                      <td className="py-3 px-4 text-center">
                        {p.isFlaggedForReview ? (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bear/15 text-bear border border-bear/30 font-mono text-[10px] font-bold cursor-help"
                            title={p.flagReason || 'Improbable win rate flagged for administrative review'}
                          >
                            <AlertTriangle size={11} />
                            <span>FLAGGED REVIEW</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bull/10 text-bull border border-bull/20 font-mono text-[10px]">
                            <ShieldCheck size={11} />
                            <span>VERIFIED</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
