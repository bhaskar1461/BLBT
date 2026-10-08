'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users, ShieldAlert } from 'lucide-react';

interface TerminalSentimentStripProps {
  symbol?: string;
  className?: string;
}

export function TerminalSentimentStrip({
  symbol = 'BTCUSDT',
  className = '',
}: TerminalSentimentStripProps) {
  const [data, setData] = useState<{
    stripText: string;
    longPct: number;
    shortPct: number;
    crowdWrong: number;
    crowdTotal: number;
    isCohortSufficient: boolean;
    cohortCount: number;
  }>({
    stripText: 'Retail paper traders here: 71% long · crowd has been wrong 8 of last 12 significant moves on this asset.',
    longPct: 71,
    shortPct: 29,
    crowdWrong: 8,
    crowdTotal: 12,
    isCohortSufficient: true,
    cohortCount: 148,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cleanSym = (symbol || 'BTCUSDT').toUpperCase();

    fetch(`/api/sentiment?symbol=${cleanSym}&delayed=false`)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.snapshot) {
          setData({
            stripText: res.terminalStrip || `Retail paper traders here: ${res.snapshot.longPct}% long · crowd has been wrong ${res.snapshot.crowdWrongCount} of last ${res.snapshot.crowdTotalMovesCount} significant moves on this asset.`,
            longPct: res.snapshot.longPct,
            shortPct: res.snapshot.shortPct,
            crowdWrong: res.snapshot.crowdWrongCount,
            crowdTotal: res.snapshot.crowdTotalMovesCount,
            isCohortSufficient: true,
            cohortCount: res.snapshot.traderCohortCount,
          });
        } else if (res.isCohortSufficient === false) {
          setData((prev) => ({
            ...prev,
            isCohortSufficient: false,
            stripText: `Retail sentiment on ${cleanSym}: Cohort < 25 traders (Privacy Protected)`,
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  return (
    <div
      data-testid="terminal-sentiment-strip"
      className={`h-[22px] min-h-[22px] bg-[#131722] border-b border-[#2a2e39]/50 px-3 flex items-center justify-between text-[11px] font-mono text-[#787b86] select-none transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 overflow-hidden truncate">
        {data.isCohortSufficient ? (
          <>
            <span className="flex items-center gap-1 text-[#787b86] font-medium shrink-0">
              <Users size={12} className="text-[#787b86]" />
              <span>Retail paper traders:</span>
            </span>

            <span className="truncate">
              <span className={data.longPct >= 60 ? 'text-amber-400 font-semibold' : 'text-[#d1d4dc]'}>
                {data.longPct}% long
              </span>
              {' · '}
              <span>
                crowd has been wrong{' '}
                <strong className="text-amber-400 font-medium">{data.crowdWrong}</strong> of last{' '}
                <strong className="text-[#d1d4dc]">{data.crowdTotal}</strong> significant moves on this asset.
              </span>
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-[#787b86] truncate">
            <ShieldAlert size={12} className="text-amber-500/80 shrink-0" />
            <span className="truncate">{data.stripText}</span>
          </span>
        )}
      </div>

      <Link
        href={`/sentiment?symbol=${(symbol || 'BTCUSDT').toUpperCase()}`}
        className="flex items-center gap-0.5 text-[#787b86] hover:text-[#2962ff] transition-colors shrink-0 ml-2 group"
        title="View comprehensive sentiment index and contrarian history"
      >
        <span className="text-[10px] tracking-tight group-hover:underline">View Sentiment</span>
        <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}
