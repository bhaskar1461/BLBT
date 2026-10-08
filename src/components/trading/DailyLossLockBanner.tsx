'use client';

import React from 'react';
import { Lock, ShieldAlert, Moon, Calendar } from 'lucide-react';
import type { DailyLossStatus } from '@/lib/lossProtectionService';

interface DailyLossLockBannerProps {
  status: DailyLossStatus;
}

export function DailyLossLockBanner({ status }: DailyLossLockBannerProps) {
  if (!status.isLocked) return null;

  return (
    <div className="p-3.5 bg-card border-b border-bear/40 bg-gradient-to-r from-bear/15 via-card to-bear/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-bear/20 border border-bear/40 flex items-center justify-center text-bear shrink-0 mt-0.5">
          <Moon size={16} />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-bear flex items-center gap-2">
            <span>Trading Locked For Today (UTC)</span>
            <span className="badge badge-bear text-[9px] font-mono px-1.5 py-0">
              CIRCUIT BREAKER HIT
            </span>
          </div>
          <p className="text-xs text-white/90 font-medium leading-relaxed">
            {"You've reached your daily limit. Great traders know when to walk away. The market will be here tomorrow."}
          </p>
          <div className="text-[11px] text-faint flex items-center gap-3 pt-0.5 font-mono">
            <span>Max Cap: {status.maxDailyLossPct}%</span>
            <span>•</span>
            <span>Realized Drawdown: -${status.currentLossUsdt.toFixed(2)}</span>
            <span>•</span>
            <span className="text-muted">Resets automatically at 00:00 UTC</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span className="text-[10px] text-faint font-mono bg-panel px-2.5 py-1 rounded border border-subtle">
          Protection Invariant Active
        </span>
      </div>
    </div>
  );
}
