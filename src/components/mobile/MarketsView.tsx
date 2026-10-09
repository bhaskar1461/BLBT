// src/components/mobile/MarketsView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import type { Quote } from './types';
import { Search, X, ArrowUpRight, ArrowDownRight, SlidersHorizontal } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

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
  const [selectedAssetClass, setSelectedAssetClass] = useState<'all' | 'india' | 'tech' | 'crypto' | 'commodities'>('all');

  const assetClasses = [
    { id: 'all', label: 'All Assets' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'india', label: 'India 🇮🇳' },
    { id: 'tech', label: 'Tech 🇺🇸' },
    { id: 'commodities', label: 'Commodities' },
  ] as const;

  const filteredQuotes = useMemo(() => {
    let list = quotes;
    if (selectedAssetClass !== 'all') {
      if (selectedAssetClass === 'india') {
        list = quotes.filter((q) => q.category === 'india');
      } else if (selectedAssetClass === 'tech') {
        list = quotes.filter((q) => q.category === 'tech');
      } else if (selectedAssetClass === 'crypto') {
        list = quotes.filter((q) => q.category === 'crypto');
      } else if (selectedAssetClass === 'commodities') {
        list = quotes.filter((q) => ['GOLD', 'SILVER', 'BRENT'].includes(q.symbol));
      }
    }

    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [quotes, query, selectedAssetClass]);

  // Major Indian and Global Market Indices
  const indices = [
    { title: 'NIFTY 50', value: '24,612.30', change: '-0.49%', isUp: false, region: 'NSE' },
    { title: 'SENSEX', value: '80,814.73', change: '+0.22%', isUp: true, region: 'BSE' },
    { title: 'BANKNIFTY', value: '51,320.10', change: '+0.34%', isUp: true, region: 'NSE' },
    { title: 'NASDAQ', value: '18,291.62', change: '+0.48%', isUp: true, region: 'US' },
    { title: 'S&P 500', value: '5,864.67', change: '+0.37%', isUp: true, region: 'US' },
    { title: 'GOLD (XAU)', value: '$2,658.20', change: '+0.85%', isUp: true, region: 'SPOT' },
    { title: 'BRENT OIL', value: '$78.40', change: '-1.12%', isUp: false, region: 'CRUDE' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      <TerminalHeader
        title="MARKETS & INDICES"
        subtitle="GLOBAL MONITOR & EXECUTION BLOTTER"
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Modern Search Input */}
        <div className="flex items-center bg-[#0e131d] border border-[#1e2638] rounded-md px-3 py-2 focus-within:border-[#f59e0b] transition-colors">
          <Search size={14} className="text-[#64748b] mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, index, or company (e.g. BTC, NIFTY, TSLA)..."
            className="w-full bg-transparent text-white font-sans text-xs placeholder-[#64748b] outline-none"
          />
          {query && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                setQuery('');
              }}
              className="text-[#64748b] hover:text-white text-xs px-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Global Indices Ticker Tape */}
        <div className="border border-[#1e2638] bg-[#0c1018] rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-[#121824] border-b border-[#1e2638] text-[10px] text-[#94a3b8] flex items-center justify-between font-mono">
            <span className="text-white font-semibold">WORLD BENCHMARK INDICES</span>
            <span className="text-[#10b981]">REAL-TIME TICKS</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar p-2">
            {indices.map((idx) => (
              <div
                key={idx.title}
                className="bg-[#0e131d] border border-[#1a2336] rounded p-2 shrink-0 min-w-[120px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white tracking-tight">
                    {idx.title}
                  </span>
                  <span className="text-[9px] text-[#38bdf8] font-mono">{idx.region}</span>
                </div>

                <div className="mt-1 font-mono">
                  <div className="text-xs font-bold text-white tabular-nums">
                    {idx.value}
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-[10px] font-semibold mt-0.5 tabular-nums ${
                      idx.isUp ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    }`}
                  >
                    {idx.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{idx.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {assetClasses.map((ac) => {
            const isActive = selectedAssetClass === ac.id;
            return (
              <button
                key={ac.id}
                onClick={() => {
                  terminalAudio.playTick();
                  setSelectedAssetClass(ac.id as any);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f59e0b] text-black font-bold'
                    : 'bg-[#0e131d] text-[#94a3b8] hover:text-white border border-[#1e2638]'
                }`}
              >
                {ac.label}
              </button>
            );
          })}
        </div>

        {/* Master Monitor Quotes Blotter */}
        <div className="border border-[#1e2638] bg-[#0c1018] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#121824] border-b border-[#1e2638] flex items-center justify-between text-[11px] text-[#94a3b8] font-mono">
            <span className="text-white font-semibold">SECURITY</span>
            <span>LAST PRICE &bull; 24H CHG</span>
          </div>

          <div>
            {filteredQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748b]">
                No matching securities found for "{query}".
              </div>
            ) : (
              filteredQuotes.map((q) => (
                <QuoteRow
                  key={q.id || q.symbol}
                  quote={q}
                  onClick={() => onSelectQuote(q)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
