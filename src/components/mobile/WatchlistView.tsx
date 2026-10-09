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
  const categories = ['<MY WATCHLIST>', '<INDIA 🇮🇳>', '<TECH 🇺🇸>', '<CRYPTO 🌐>'] as const;
  const [selectedCategory, setSelectedCategory] = useState<string>('<MY WATCHLIST>');

  const filteredQuotes = useMemo(() => {
    if (selectedCategory === '<MY WATCHLIST>') return quotes;
    if (selectedCategory === '<TECH 🇺🇸>') return quotes.filter((q) => q.category === 'tech' || ['AAPL', 'TSLA', 'NVDA', 'MSFT'].includes(q.symbol));
    if (selectedCategory === '<INDIA 🇮🇳>') return quotes.filter((q) => q.category === 'india' || ['NIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK'].includes(q.symbol));
    if (selectedCategory === '<CRYPTO 🌐>') return quotes.filter((q) => q.category === 'crypto' || ['BTCUSD', 'BTCUSDT', 'ETHUSD', 'SOLUSD'].includes(q.symbol));
    return quotes;
  }, [quotes, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-24">
      <TerminalHeader
        title="WATCHLIST MONITOR"
        subtitle="CUSTOM SECURITY BASKET <WL <GO>>"
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
                className={`px-2.5 py-1 text-[11px] font-bold rounded-sm whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#ff8800] text-black border-[#ff8800]'
                    : 'bg-[#0c1018] text-[#8e95a5] hover:text-white border-[#1c2436]'
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
            className="px-2 py-1 bg-[#101520] border border-[#1e2a40] text-[#ff8800] text-[10px] font-bold rounded-sm flex items-center gap-1 shrink-0 cursor-pointer"
            title="Add Security <SECF>"
          >
            <Plus size={11} />
            <span>&lt;ADD&gt;</span>
          </button>
        </div>

        {/* Watchlist Blotter */}
        <div className="border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1 bg-[#101520] border-b border-[#182030] flex items-center justify-between text-[10px] text-[#8e95a5] font-bold">
            <span className="text-[#ff8800]">SECURITIES IN BASKET: {selectedCategory}</span>
            <span className="text-[#00ff66]">ACTIVE COUNT: {filteredQuotes.length}</span>
          </div>

          <div className="divide-y divide-[#182030]">
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
