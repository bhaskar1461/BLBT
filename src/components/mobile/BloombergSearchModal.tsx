// src/components/mobile/BloombergSearchModal.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Quote } from './types';
import { Search, X, ArrowUpRight, Command, Terminal, Sparkles } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';
import { formatPrice } from '@/lib/utils';

interface BloombergSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onSelectFunction: (fnCode: string) => void;
}

interface BloombergFunctionItem {
  code: string;
  name: string;
  desc: string;
  category: string;
}

const BLOOMBERG_FUNCTIONS: BloombergFunctionItem[] = [
  { code: 'TOP', name: 'Top News Wire', desc: 'Real-time terminal headlines & analytical stories', category: 'News' },
  { code: 'WEI', name: 'World Equity Indices', desc: 'Global market benchmarks & asset classes', category: 'Markets' },
  { code: 'PORT', name: 'Portfolio & Risk', desc: 'Holdings, NAV valuation & asset allocation', category: 'Portfolio' },
  { code: 'WL', name: 'Watchlists & Desks', desc: 'Curated monitor for Equities, Crypto & FX', category: 'Monitor' },
  { code: 'GP', name: 'Graph Price', desc: 'Candlestick & line technical chart inspector', category: 'Analytics' },
  { code: 'DES', name: 'Description & Financials', desc: 'Security key data, range & volume', category: 'Company' },
  { code: 'SECF', name: 'Security Finder', desc: 'Multi-asset search universe & cross-rates', category: 'Search' },
];

export const BloombergSearchModal: React.FC<BloombergSearchModalProps> = ({
  isOpen,
  onClose,
  quotes,
  onSelectQuote,
  onSelectFunction,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'functions' | 'quotes'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedFilter('all');
    }
  }, [isOpen]);

  const filteredFunctions = useMemo(() => {
    if (selectedFilter === 'quotes') return [];
    if (!query.trim()) return BLOOMBERG_FUNCTIONS;
    const q = query.toLowerCase().trim();
    return BLOOMBERG_FUNCTIONS.filter(
      (f) =>
        f.code.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q)
    );
  }, [query, selectedFilter]);

  const filteredQuotes = useMemo(() => {
    if (selectedFilter === 'functions') return [];
    if (!query.trim()) return quotes;
    const q = query.toLowerCase().trim();
    return quotes.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [quotes, query, selectedFilter]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl mx-auto bg-[#0a0d13] border-b border-[#212b3d] flex flex-col max-h-[90vh] shadow-2xl pt-[env(safe-area-inset-top,20px)]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#181f2c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff8800] shadow-[0_0_8px_#ff8800] animate-pulse" />
            <span className="text-[13px] font-extrabold tracking-widest text-[#ff8800] font-mono">
              SECURITY FINDER &lt;SECF&gt;
            </span>
          </div>

          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#141924] border border-[#263145] flex items-center justify-center text-[#8e95a5] hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-b border-[#181f2c] bg-[#0d111a]">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-[#ff8800] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                terminalAudio.playTick();
                setQuery(e.target.value);
              }}
              placeholder="Search ticker, company or function (e.g. BTC, NIFTY, TOP)..."
              className="w-full bg-[#141924] border border-[#2b3548] focus:border-[#ff8800] rounded-xl pl-11 pr-10 py-3 text-[14px] text-white placeholder-[#5c6475] font-medium outline-none transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  terminalAudio.playTick();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-[#8e95a5] hover:text-white p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
            {(['all', 'functions', 'quotes'] as const).map((filter) => {
              const isActive = selectedFilter === filter;
              const labels = {
                all: 'All Results',
                functions: 'Functions <GO>',
                quotes: 'Securities & Tickers',
              };
              return (
                <button
                  key={filter}
                  onClick={() => {
                    terminalAudio.playTick();
                    setSelectedFilter(filter);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ff8800] text-black shadow-[0_0_8px_rgba(255,136,0,0.35)]'
                      : 'bg-[#141924] text-[#8e95a5] hover:text-white border border-[#232b3d]'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 divide-y divide-[#181f2c]/60">
          {/* Section: Bloomberg Mnemonic Functions */}
          {filteredFunctions.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider">
                <span>BLOOMBERG FUNCTIONS ({filteredFunctions.length})</span>
                <span className="text-[#ff8800]">&lt;MNEMONIC GO&gt;</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {filteredFunctions.map((fn) => (
                  <div
                    key={fn.code}
                    onClick={() => {
                      terminalAudio.playTick();
                      onSelectFunction(fn.code);
                      onClose();
                    }}
                    className="p-2.5 bg-[#0e121b] border border-[#1b2230] hover:border-[#ff8800]/50 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-[#ff8800]/15 text-[#ff8800] border border-[#ff8800]/30 font-mono font-black text-[12px]">
                        &lt;{fn.code}&gt;
                      </span>
                      <div>
                        <div className="text-[13px] font-bold text-white leading-tight">
                          {fn.name}
                        </div>
                        <div className="text-[11px] text-[#8e95a5] leading-tight mt-0.5">
                          {fn.desc}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#5c6475] uppercase px-1.5 py-0.5 rounded bg-[#141822]">
                      {fn.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Securities / Tickers */}
          {filteredQuotes.length > 0 && (
            <div className="flex flex-col gap-2 pt-3">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider">
                <span>SECURITIES &amp; COMMODITIES ({filteredQuotes.length})</span>
                <span className="text-[#00c176]">● STREAMING</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {filteredQuotes.map((q) => {
                  const sign = q.positive ? '+' : '';
                  const currSym = q.currency === 'INR' ? '₹' : '$';
                  return (
                    <div
                      key={q.id || q.symbol}
                      onClick={() => {
                        terminalAudio.playTick();
                        onSelectQuote(q);
                        onClose();
                      }}
                      className="p-3 bg-[#0e121b] border border-[#1b2230] hover:border-[#2f3b52] rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[15px] font-mono text-white">
                            {q.symbol}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#161c28] text-[#8e95a5]">
                            {q.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8e95a5] mt-0.5">
                          {q.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-[15px] text-white">
                          {currSym}{formatPrice(q.price, 2)}
                        </div>
                        <div
                          className={`text-[11px] font-mono font-bold mt-0.5 ${
                            q.positive ? 'text-[#00c176]' : 'text-[#ff4d4f]'
                          }`}
                        >
                          {sign}{q.change.toFixed(2)} ({sign}{q.percent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredFunctions.length === 0 && filteredQuotes.length === 0 && (
            <div className="py-12 text-center text-[#8e95a5] text-xs font-mono">
              No matching Bloomberg securities or functions found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
