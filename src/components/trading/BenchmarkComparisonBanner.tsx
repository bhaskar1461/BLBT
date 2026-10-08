'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import type { BenchmarkComparison } from '@/lib/benchmarkService';

interface BenchmarkComparisonBannerProps {
  userId?: string;
  periodDays?: number;
  initialData?: BenchmarkComparison;
  variant?: 'banner' | 'pill' | 'card';
  className?: string;
}

export function BenchmarkComparisonBanner({
  userId = 'usr_celsius_demo',
  periodDays = 30,
  initialData,
  variant = 'banner',
  className = '',
}: BenchmarkComparisonBannerProps) {
  const [benchmark, setBenchmark] = useState<BenchmarkComparison | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setBenchmark(initialData);
      return;
    }

    let isMounted = true;
    fetch(`/api/benchmark?userId=${userId}&periodDays=${periodDays}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.benchmark && isMounted) {
          setBenchmark(data.benchmark);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, periodDays, initialData]);

  const userPct = benchmark?.userPnlPct ?? 0;
  const btcPct = benchmark?.btcPnlPct ?? 14.8;
  const userBeatBtc = benchmark?.userBeatBtc ?? false;

  const btcFormatted = btcPct >= 0 ? `+${btcPct.toFixed(1)}%` : `${btcPct.toFixed(1)}%`;
  const userFormatted = userPct >= 0 ? `+${userPct.toFixed(1)}%` : `${userPct.toFixed(1)}%`;
  const statement = `Same capital in BTC buy-and-hold over the same period: ${btcFormatted}. You: ${userFormatted}.`;

  if (variant === 'pill') {
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
          userBeatBtc
            ? 'bg-bull/10 border-bull/30 text-bull'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        } ${className}`}
        title={statement}
      >
        <span className="font-bold">₿ B&amp;H {btcFormatted}</span>
        <span className="text-faint">|</span>
        <span className="font-bold">You: {userFormatted}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm transition-all ${
        userBeatBtc
          ? 'bg-bull/10 border-bull/30 text-white'
          : 'bg-canvas border-subtle text-white'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            userBeatBtc
              ? 'bg-bull/20 text-bull border border-bull/40'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          ₿
        </div>
        <div>
          <div className="font-bold tracking-tight flex items-center gap-2">
            <span>Authoritative Benchmark: BTC Buy-and-Hold ({periodDays}d)</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0 rounded font-bold ${
                userBeatBtc
                  ? 'bg-bull/20 text-bull'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {userBeatBtc ? 'ALPHA GENERATED' : 'PASSIVE BEATS ACTIVE'}
            </span>
          </div>
          <div className="text-muted mt-0.5 font-medium leading-relaxed">
            {statement}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span className="text-[10px] font-mono text-faint bg-panel px-2 py-0.5 rounded border border-subtle">
          Equal Billing Context
        </span>
      </div>
    </div>
  );
}
