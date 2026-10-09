// src/components/mobile/WatchlistView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import type { Quote } from './types';
import { Plus } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface WatchlistViewProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onSearchClick: () => void;
  onAlertsClick: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  quotes,
  onSelectQuote,
  onSearchClick,
  onAlertsClick,
}) => {
  const categories = ['My Watchlist', 'Crypto', 'India 🇮🇳', 'Tech 🇺🇸'] as const;
  const [selectedCategory, setSelectedCategory] = useState<string>('My Watchlist');

  const filteredQuotes = useMemo(() => {
    if (selectedCategory === 'My Watchlist') return quotes;
    if (selectedCategory === 'Tech 🇺🇸') return quotes.filter((q) => q.category === 'tech' || ['AAPL', 'TSLA', 'NVDA', 'MSFT'].includes(q.symbol));
    if (selectedCategory === 'India 🇮🇳') return quotes.filter((q) => q.category === 'india' || ['NIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK'].includes(q.symbol));
    if (selectedCategory === 'Crypto') return quotes.filter((q) => q.category === 'crypto' || ['BTCUSD', 'BTCUSDT', 'ETHUSD', 'SOLUSD'].includes(q.symbol));
    return quotes;
  }, [quotes, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      <TerminalHeader
        title="WATCHLIST"
        subtitle="CUSTOM SECURITY BASKET"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Category Filter Keys */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  terminalAudio.playTick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f59e0b] text-black font-bold'
                    : 'bg-[#0e131d] text-[#94a3b8] hover:text-white border border-[#1e2638]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            onClick={() => {
              terminalAudio.playTick();
              onSearchClick();
            }}
            className="px-2.5 py-1 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-[#f59e0b] text-xs font-medium rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
            title="Add Security"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>

        {/* Watchlist Blotter */}
        <div className="border border-[#1e2638] bg-[#0c1018] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#121824] border-b border-[#1e2638] flex items-center justify-between text-[11px] text-[#94a3b8] font-mono">
            <span className="text-white font-semibold">SECURITIES IN BASKET: {selectedCategory}</span>
            <span className="text-[#10b981]">COUNT: {filteredQuotes.length}</span>
          </div>

          <div>
            {filteredQuotes.map((q) => (
              <QuoteRow
                key={q.id || q.symbol}
                quote={q}
                onClick={() => onSelectQuote(q)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
