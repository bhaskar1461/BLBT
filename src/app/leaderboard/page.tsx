'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  ArrowLeft,
  Search,
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Share2,
  Clock,
  RefreshCw,
  User,
  Shield,
} from 'lucide-react';
import { storage } from '@/services/storage';
import { formatPrice } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/trading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BloombergUniversalHeader } from '@/components/bloomberg/BloombergUniversalHeader';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [totalTraders, setTotalTraders] = useState(1438);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const user = storage.getUserProfile();

  const fetchLeaderboard = async (tf: '24h' | '7d' | '30d' | 'all') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${tf}&userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
        setCurrentUserRank(data.currentUserRank || null);
        setTotalTraders(data.totalTraders || 1438);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  // Filter rankings by search query
  const filteredRankings = rankings.filter((r) =>
    r.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = rankings.slice(0, 3);
  const isUserInTop50 = rankings.some((r) => r.userId === user.id);

  return (
    <main className="min-h-screen bg-[#000000] text-[#d1d4dc] font-mono selection:bg-[#ff8800]/30 flex flex-col">
      {/* Bloomberg Universal Header */}
      <BloombergUniversalHeader
        activeMnemonic="LEAD"
        subtitle="PAPER TRADING LEADERBOARD // RANKINGS"
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Controls Bar: Timeframe tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-subtle p-3 rounded-xl">
          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border border-subtle">
            {(
              [
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  timeframe === tf.id
                    ? 'bg-elevated text-primary border border-cardborder shadow-sm'
                    : 'text-muted hover:text-main'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                placeholder="Search trader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-8 pr-3 py-1.5 text-xs w-full font-mono bg-canvas"
              />
            </div>
            <button
              onClick={() => fetchLeaderboard(timeframe)}
              disabled={loading}
              className="btn btn-icon p-2 border border-subtle text-faint hover:text-white"
              title="Refresh Leaderboard"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Podium Highlight (Top 3) */}
        {top3.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rank 2 (Silver) */}
            <div className="bg-card border border-subtle hover:border-[#c0c0c0]/50 p-5 rounded-2xl flex flex-col items-center text-center relative overflow-hidden transition-all group order-2 md:order-1">
              <div className="w-10 h-10 rounded-full bg-[#c0c0c0]/15 border border-[#c0c0c0]/40 flex items-center justify-center font-black text-sm text-[#e2e8f0] mb-3 shadow-md shadow-[#c0c0c0]/10">
                #2
              </div>
              <div className="font-extrabold text-base text-white">{top3[1].displayName}</div>
              <div className="text-xl font-black text-bull mt-1 font-mono">
                +{top3[1].realizedPnlPct}%
              </div>
              <div className="text-xs text-faint mt-1">
                +${top3[1].realizedPnl.toLocaleString()} USDT • {top3[1].winRatePct}% Win Rate
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gold">
                <Flame size={13} className="text-[#ff9f1c]" />
                <span className="font-mono">{top3[1].streakDays || 12}d streak</span>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="bg-gradient-to-b from-[#ffd700]/10 via-card to-card border-2 border-[#ffd700]/50 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-xl shadow-[#ffd700]/10 order-1 md:order-2 scale-105 z-10">
              <div className="absolute top-2 right-3 text-lg animate-bounce">👑</div>
              <div className="w-12 h-12 rounded-full bg-[#ffd700]/20 border-2 border-[#ffd700] flex items-center justify-center font-black text-base text-[#ffd700] mb-3 shadow-lg shadow-[#ffd700]/30">
                #1
              </div>
              <div className="font-black text-lg text-white">{top3[0].displayName}</div>
              <div className="text-2xl font-black text-bull mt-1 font-mono">
                +{top3[0].realizedPnlPct}%
              </div>
              <div className="text-xs text-muted mt-1">
                +${top3[0].realizedPnl.toLocaleString()} USDT • {top3[0].winRatePct}% Win Rate
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gold font-bold">
                <Flame size={14} className="text-[#ff9f1c]" />
                <span className="font-mono">{top3[0].streakDays || 14}d visit streak</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-card border border-subtle hover:border-[#cd7f32]/50 p-5 rounded-2xl flex flex-col items-center text-center relative overflow-hidden transition-all group order-3 md:order-3">
              <div className="w-10 h-10 rounded-full bg-[#cd7f32]/15 border border-[#cd7f32]/40 flex items-center justify-center font-black text-sm text-[#cd7f32] mb-3 shadow-md shadow-[#cd7f32]/10">
                #3
              </div>
              <div className="font-extrabold text-base text-white">{top3[2].displayName}</div>
              <div className="text-xl font-black text-bull mt-1 font-mono">
                +{top3[2].realizedPnlPct}%
              </div>
              <div className="text-xs text-faint mt-1">
                +${top3[2].realizedPnl.toLocaleString()} USDT • {top3[2].winRatePct}% Win Rate
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gold">
                <Flame size={13} className="text-[#ff9f1c]" />
                <span className="font-mono">{top3[2].streakDays || 8}d streak</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-subtle bg-elevated/60 text-[11px] text-faint">
                  <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
                  <th className="py-3 px-4 font-bold">Trader</th>
                  <th className="py-3 px-4 font-bold text-right">Realized Return %</th>
                  <th className="py-3 px-4 font-bold text-right">Realized USDT</th>
                  <th className="py-3 px-4 font-bold text-right">Win Rate</th>
                  <th className="py-3 px-4 font-bold text-right">Trades</th>
                  <th className="py-3 px-4 font-bold text-center">Visit Streak</th>
                  <th className="py-3 px-4 font-bold text-center">Stats Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle font-mono">
                {filteredRankings.map((trader) => {
                  const isCurrent = trader.userId === user.id;
                  const isPositive = trader.realizedPnlPct >= 0;

                  return (
                    <tr
                      key={trader.userId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-bull/10 border-l-2 border-l-bull font-bold'
                          : 'hover:bg-elevated/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-black">
                        {trader.rank === 1 ? (
                          <span className="text-[#ffd700] text-sm">🥇 #1</span>
                        ) : trader.rank === 2 ? (
                          <span className="text-[#c0c0c0] text-sm">🥈 #2</span>
                        ) : trader.rank === 3 ? (
                          <span className="text-[#cd7f32] text-sm">🥉 #3</span>
                        ) : (
                          <span className="text-faint">#{trader.rank}</span>
                        )}
                      </td>

                      {/* Trader Name */}
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span>{trader.displayName}</span>
                        {isCurrent && (
                          <Badge variant="bull" className="text-[9px] px-1.5 py-0">
                            YOU
                          </Badge>
                        )}
                      </td>

                      {/* Realized Return % */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-black text-sm ${
                            isPositive ? 'text-bull' : 'text-bear'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {trader.realizedPnlPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Realized USDT */}
                      <td className="py-3 px-4 text-right text-muted">
                        ${trader.realizedPnl.toLocaleString()} USDT
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-white">
                          {trader.winRatePct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Total Trades */}
                      <td className="py-3 px-4 text-right text-faint">
                        {trader.tradesCount}
                      </td>

                      {/* Streak */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-[#ff9f1c]">
                          <Flame size={12} />
                          {trader.streakDays || 1}d
                        </span>
                      </td>

                      {/* Share Card Link */}
                      <td className="py-3 px-4 text-center">
                        <Link href={`/share/stats/${encodeURIComponent(trader.userId)}`}>
                          <button className="btn px-2.5 py-1 text-[11px] bg-elevated hover:bg-hover border border-cardborder rounded text-white flex items-center gap-1 mx-auto">
                            <Share2 size={11} />
                            <span>Card</span>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredRankings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-faint font-sans">
                      No traders found matching &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔒 PINNED USER CARD (Prompt 1 requirement: Pinned at bottom if outside top 50) */}
        {!isUserInTop50 && currentUserRank && (
          <div className="bg-gradient-to-r from-card via-elevated to-card border-2 border-primary/40 p-4 rounded-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-xs">
                #{currentUserRank.rank}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <span>{currentUserRank.displayName}</span>
                  <Badge variant="gold" className="text-[9px]">YOUR RANK</Badge>
                </div>
                <div className="text-xs text-faint mt-0.5">
                  Keep trading to climb into the top 50 leaderboard.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <div className="text-right">
                <span className="text-faint text-[10px] block">RETURN</span>
                <span className="font-bold text-bull">+{currentUserRank.realizedPnlPct}%</span>
              </div>
              <div className="text-right">
                <span className="text-faint text-[10px] block">WIN RATE</span>
                <span className="font-bold text-white">{currentUserRank.winRatePct}%</span>
              </div>
              <Link href={`/share/stats/${encodeURIComponent(user.id)}`}>
                <Button variant="default" size="sm" className="text-xs gap-1">
                  <Share2 size={12} />
                  <span>Share</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
