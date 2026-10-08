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
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('celsius_dismissed_recap') !== 'false';
    } catch {
      return true;
    }
  });

  if (!recap || isDismissed) return null;

  const isProfit = recap.netPnl >= 0;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('celsius_dismissed_recap', 'true');
    } catch {}
    onDismiss();
  };

  return (
    <div className="bg-[#171b26] border-b border-[#2a2e39] py-1.5 px-3 flex items-center justify-between text-xs text-[#d1d4dc] select-none z-30 shadow-sm">
      <div className="flex items-center gap-2.5 overflow-x-auto min-w-0">
        <div className="w-5 h-5 rounded-full bg-[#2962ff]/20 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-[#2962ff]" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white tracking-tight">Weekly Performance:</span>
          <span className="text-[#787b86] font-mono text-[11px]">
            {recap.tradesCount} trades • {recap.winRatePct}% win rate •{' '}
            <strong className={isProfit ? 'text-[#089981]' : 'text-[#f23645]'}>
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
          className="btn text-[11px] py-0.5 px-2 bg-[#2962ff]/10 hover:bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/30 rounded-[4px] font-semibold flex items-center gap-1"
        >
          <Trophy size={11} />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        <button
          onClick={handleDismiss}
          className="text-[#787b86] hover:text-white p-1 rounded hover:bg-[#2a2e39] transition-colors"
          title="Dismiss recap"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
