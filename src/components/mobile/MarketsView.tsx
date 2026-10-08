// src/components/mobile/MarketsView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import type { Quote } from './types';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketsViewProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onAlertsClick: () => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  quotes,
  onSelectQuote,
  onAlertsClick,
}) => {
  const [query, setQuery] = useState('');

  const filteredQuotes = useMemo(() => {
    if (!query.trim()) return quotes;
    const q = query.toLowerCase();
    return quotes.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [quotes, query]);

  // Major Indian and Global Market Indices matching SwiftUI MarketIndexStrip
  const indices = [
    { title: 'NIFTY 50', value: '24,612.30', change: '-0.49%', isUp: false, region: '🇮🇳 NSE' },
    { title: 'SENSEX', value: '80,814.73', change: '+0.22%', isUp: true, region: '🇮🇳 BSE' },
    { title: 'NASDAQ', value: '18,291.62', change: '+0.48%', isUp: true, region: '🇺🇸 US' },
    { title: 'BANKNIFTY', value: '51,320.10', change: '+0.34%', isUp: true, region: '🇮🇳 NSE' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-24">
      <TerminalHeader
        title="Markets"
        subtitle="GLOBAL & DOMESTIC"
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3.5 text-[#8e95a5] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company or index"
            className="w-full bg-[#0e1118] border border-[#1b2230] rounded-xl pl-10 pr-9 py-2.5 text-[14px] text-white placeholder-[#5c6475] focus:outline-none focus:border-[#ff8800] transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 text-[#8e95a5] hover:text-white p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* MarketIndexStrip: Horizontal Scrolling Chips */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {indices.map((idx) => (
            <div
              key={idx.title}
              className="bg-[#0e1118] border border-[#1b2230] rounded-xl p-3 shrink-0 min-w-[135px] flex flex-col justify-between hover:border-[#2f3b52] active:scale-[0.99] transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8e95a5] tracking-wide">
                  {idx.title}
                </span>
                <span className="text-[9px] text-[#5c6475] font-mono">{idx.region}</span>
              </div>

              <div className="mt-2">
                <div className="font-mono text-[14px] font-bold text-white tracking-tight tabular-nums">
                  {idx.value}
                </div>
                <div
                  className={`flex items-center gap-1 text-[11px] font-mono font-bold mt-0.5 tabular-nums ${
                    idx.isUp ? 'text-[#00c176]' : 'text-[#ff4d4f]'
                  }`}
                >
                  {idx.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  <span>{idx.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtered Quotes List */}
        <section className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-extrabold tracking-[1px] text-[#8e95a5] uppercase">
              {query ? `RESULTS (${filteredQuotes.length})` : 'ALL INSTRUMENTS'}
            </span>
            <span className="text-[10px] text-[#5c6475] font-mono">
              REAL-TIME SPOT
            </span>
          </div>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl px-3 py-1 shadow-sm divide-y divide-[#181d28]/70">
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((q) => (
                <QuoteRow
                  key={q.id || q.symbol}
                  quote={q}
                  onClick={() => onSelectQuote(q)}
                />
              ))
            ) : (
              <div className="py-8 text-center text-[#8e95a5] text-xs font-mono">
                No matching instruments found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
