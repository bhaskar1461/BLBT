'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Trophy, X, ArrowUpRight, TrendingUp } from 'lucide-react';
import type { WeeklyRecap } from '@/types/trading';
import { formatPrice } from '@/lib/utils';

interface WeeklyRecapBannerProps {
  recap: WeeklyRecap | null;
  onDismiss: () => void;
}

export const WeeklyRecapBanner: React.FC<WeeklyRecapBannerProps> = ({ recap, onDismiss }) => {
  if (!recap) return null;

  const isProfit = recap.netPnl >= 0;

  return (
    <div className="bg-gradient-to-r from-surface via-elevated to-surface border-b border-primary/30 py-2 px-4 flex items-center justify-between text-xs text-main select-none z-30 shadow-md">
      <div className="flex items-center gap-3 overflow-x-auto min-w-0">
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-primary" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white tracking-tight">Weekly Performance Recap:</span>
          <span className="text-muted font-mono">
            {recap.tradesCount} trades • {recap.winRatePct}% win rate •{' '}
            <strong className={isProfit ? 'text-bull' : 'text-bear'}>
              {isProfit ? '+' : ''}${formatPrice(recap.netPnl, 2)} P&L
            </strong>
          </span>
          {recap.bestTradeSymbol && (
            <span className="badge badge-bull text-[10px] hidden sm:inline-flex">
              Best: {recap.bestTradeSymbol}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Link
          href="/leaderboard"
          className="btn text-[11px] py-0.5 px-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded font-semibold flex items-center gap-1"
        >
          <Trophy size={11} />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        <button
          onClick={onDismiss}
          className="text-faint hover:text-white p-1 rounded hover:bg-elevated transition-colors"
          title="Dismiss recap"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
