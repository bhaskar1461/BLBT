// src/components/mobile/MarketsView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import type { Quote } from './types';
import { Search, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    { id: 'all', label: '<ALL>' },
    { id: 'india', label: '<INDIA 🇮🇳>' },
    { id: 'tech', label: '<TECH 🇺🇸>' },
    { id: 'crypto', label: '<CRYPTO>' },
    { id: 'commodities', label: '<COMDTY 🟡>' },
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

  // Major Indian and Global Market Indices matching Bloomberg WEI function
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
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-24">
      <TerminalHeader
        title="WORLD EQUITY INDICES"
        subtitle="MONITOR <WEI <GO>> & EXECUTION <EMSX>"
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Command Search Bar Input */}
        <div className="flex items-center bg-[#070a10] border border-[#ff8800] rounded-sm px-3 py-1.5 shadow-[0_0_8px_rgba(255,136,0,0.15)]">
          <span className="text-[#ff8800] font-black text-xs mr-2">WEI &gt;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker, security, or index (e.g. BTC, NIFTY, TSLA)..."
            className="w-full bg-transparent text-white font-mono font-bold text-xs placeholder-[#5c6880] outline-none uppercase"
          />
          {query && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                setQuery('');
              }}
              className="text-[#8e95a5] hover:text-white text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dense WEI Indices Horizontal Strip */}
        <div className="border border-[#182030] bg-[#070a10]">
          <div className="px-2 py-1 bg-[#101520] border-b border-[#182030] text-[10px] text-[#8e95a5] flex items-center justify-between font-bold">
            <span className="text-[#ff8800]">WORLD INDICES TICKER TAPE</span>
            <span>REAL-TIME SNAPSHOT</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar p-1.5">
            {indices.map((idx) => (
              <div
                key={idx.title}
                className="bg-[#0b0f17] border border-[#1b2436] p-2 shrink-0 min-w-[120px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white tracking-wide">
                    {idx.title}
                  </span>
                  <span className="text-[9px] text-[#00e5ff] font-semibold">{idx.region}</span>
                </div>

                <div className="mt-1">
                  <div className="font-mono text-xs font-bold text-white tabular-nums">
                    {idx.value}
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-[10px] font-mono font-bold mt-0.5 tabular-nums ${
                      idx.isUp ? 'text-[#00ff66]' : 'text-[#ff3b30]'
                    }`}
                  >
                    {idx.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    <span>{idx.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Function Filter Mnemonic Keys */}
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
                className={`px-2.5 py-1 text-[11px] font-bold rounded-sm whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#ff8800] text-black border-[#ff8800] shadow-[0_0_8px_rgba(255,136,0,0.3)]'
                    : 'bg-[#0c1018] text-[#8e95a5] hover:text-white border-[#1c2436]'
                }`}
              >
                {ac.label}
              </button>
            );
          })}
        </div>

        {/* Master Monitor Quotes Blotter */}
        <section className="flex flex-col border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1.5 bg-[#101520] border-b border-[#182030] flex items-center justify-between text-[10px] text-[#8e95a5] font-bold">
            <span className="text-[#ff8800] uppercase">
              {query ? `SECURITIES MATCHING: ${query.toUpperCase()}` : 'LIVE MARKET SECURITIES MONITOR'}
            </span>
            <span className="text-[#00ff66]">COUNT: {filteredQuotes.length}</span>
          </div>

          <div className="divide-y divide-[#182030]">
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((q) => (
                <QuoteRow
                  key={q.id || q.symbol}
                  quote={q}
                  onClick={() => onSelectQuote(q)}
                />
              ))
            ) : (
              <div className="py-8 text-center text-[#8e95a5] text-xs">
                NO ACTIVE MATCH FOR QUERY &quot;{query.toUpperCase()}&quot;
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
