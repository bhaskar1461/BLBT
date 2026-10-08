// src/components/mobile/WatchlistView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import type { Quote } from './types';
import { Plus } from 'lucide-react';

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
  const categories = ['My Watchlist', 'Tech', 'India', 'Crypto'] as const;
  const [selectedCategory, setSelectedCategory] = useState<string>('My Watchlist');

  const filteredQuotes = useMemo(() => {
    if (selectedCategory === 'My Watchlist') return quotes;
    if (selectedCategory === 'Tech') return quotes.filter((q) => q.category === 'tech' || ['AAPL', 'TSLA', 'NVDA', 'MSFT'].includes(q.symbol));
    if (selectedCategory === 'India') return quotes.filter((q) => q.category === 'india' || ['NIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK'].includes(q.symbol));
    if (selectedCategory === 'Crypto') return quotes.filter((q) => q.category === 'crypto' || ['BTCUSD', 'BTCUSDT', 'ETHUSD', 'SOLUSD'].includes(q.symbol));
    return quotes;
  }, [quotes, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-24">
      <TerminalHeader
        title="Watchlists"
        subtitle="CURATED DESKS"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Capsule Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ff8800] text-black shadow-[0_0_10px_rgba(255,136,0,0.35)]'
                    : 'bg-[#141924] text-[#8e95a5] hover:text-white border border-[#232b3d]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            onClick={onSearchClick}
            className="w-7 h-7 rounded-full bg-[#141924] border border-[#232b3d] flex items-center justify-center text-[#8e95a5] hover:text-[#ff8800] shrink-0 ml-1 cursor-pointer"
            title="Add to Watchlist"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Watchlist Count & Status */}
        <div className="flex items-center justify-between px-1 text-[11px] text-[#8e95a5]">
          <span className="font-bold uppercase tracking-wider text-[#d1d5db]">
            {selectedCategory} ({filteredQuotes.length})
          </span>
          <span className="font-mono">LIVE PRICES</span>
        </div>

        {/* Quotes List */}
        <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl px-3 py-1 shadow-sm divide-y divide-[#181d28]/70">
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
  );
};
