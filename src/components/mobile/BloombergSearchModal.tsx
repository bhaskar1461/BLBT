// src/components/mobile/BloombergSearchModal.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Quote } from './types';
import { Search, X, ArrowUpRight, Terminal } from 'lucide-react';
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

const TERMINAL_FUNCTIONS: BloombergFunctionItem[] = [
  { code: 'DESK', name: 'Terminal Desk AI', desc: 'Quantitative desk chat & market analysis assistant', category: 'Chat' },
  { code: 'TOP', name: 'Top News Wire', desc: 'Real-time terminal headlines & analytical stories', category: 'News' },
  { code: 'WEI', name: 'World Equity Indices', desc: 'Global market benchmarks & asset classes', category: 'Markets' },
  { code: 'PORT', name: 'Portfolio & Risk Blotter', desc: 'Holdings, NAV valuation & asset allocation', category: 'Risk' },
  { code: 'WL', name: 'Watchlists & Desks', desc: 'Curated monitor for Equities, Crypto & FX', category: 'Monitor' },
  { code: 'GP', name: 'Graph Price', desc: 'Candlestick & line technical chart inspector', category: 'Analytics' },
  { code: 'DES', name: 'Description & Financials', desc: 'Security key data, range & volume', category: 'Company' },
  { code: 'SECF', name: 'Security Finder Master', desc: 'Multi-asset search universe & cross-rates', category: 'Search' },
  { code: 'EMSX', name: 'Execution Management System', desc: 'Order blotter & paper trading routing', category: 'Trade' },
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
    if (!query.trim()) return TERMINAL_FUNCTIONS;
    const q = query.toLowerCase().trim();
    return TERMINAL_FUNCTIONS.filter(
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-start p-2 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl mx-auto bg-[#070a10] border-2 border-[#ff8800] flex flex-col max-h-[88vh] shadow-[0_0_30px_rgba(0,0,0,0.95)]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#101520] border-b border-[#182030]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff8800] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-[#ff8800]">
              SECURITY FINDER &lt;SECF &lt;GO&gt;&gt;
            </span>
          </div>

          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="text-[#8e95a5] hover:text-white text-xs px-2 py-0.5 border border-[#1e2a40] bg-[#0c1018]"
          >
            &lt;ESC&gt;
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-b border-[#182030] bg-[#0b0f17]">
          <div className="flex items-center bg-[#070a10] border border-[#ff8800] px-3 py-2">
            <span className="text-[#ff8800] font-black text-xs mr-2">SECF &gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                terminalAudio.playTick();
                setQuery(e.target.value);
              }}
              placeholder="Search ticker, mnemonic, or function (e.g. BTC, DESK, WEI)..."
              className="w-full bg-transparent text-white font-mono font-bold text-xs placeholder-[#5c6880] outline-none uppercase"
            />
            {query && (
              <button
                onClick={() => {
                  terminalAudio.playTick();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="text-[#8e95a5] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Keys */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {(['all', 'functions', 'quotes'] as const).map((filter) => {
              const isActive = selectedFilter === filter;
              const labels = {
                all: '<ALL RESULTS>',
                functions: '<FUNCTIONS GO>',
                quotes: '<SECURITIES>',
              };
              return (
                <button
                  key={filter}
                  onClick={() => {
                    terminalAudio.playTick();
                    setSelectedFilter(filter);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#0c1018] text-[#8e95a5] border-[#1c2436] hover:text-white'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 divide-y divide-[#182030]">
          {/* Section: Bloomberg Mnemonic Functions */}
          {filteredFunctions.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8e95a5] uppercase">
                <span className="text-[#ff8800]">TERMINAL MNEMONIC ROUTING ({filteredFunctions.length})</span>
                <span>PRESS &lt;GO&gt;</span>
              </div>

              <div className="flex flex-col gap-1">
                {filteredFunctions.map((fn) => (
                  <div
                    key={fn.code}
                    onClick={() => {
                      terminalAudio.playTick();
                      onSelectFunction(fn.code);
                      onClose();
                    }}
                    className="p-2 bg-[#0c1018] border border-[#182030] hover:border-[#ff8800] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-[#ff8800]/20 text-[#ff8800] border border-[#ff8800]/40 font-black text-[11px]">
                        &lt;{fn.code}&gt;
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {fn.name}
                        </div>
                        <div className="text-[10px] text-[#8e95a5]">
                          {fn.desc}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-[#00e5ff] px-1 py-0.2 bg-[#121824] border border-[#1e2a40]">
                      {fn.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Securities / Tickers */}
          {filteredQuotes.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8e95a5] uppercase">
                <span className="text-[#00e5ff]">SECURITIES &amp; INSTRUMENTS ({filteredQuotes.length})</span>
                <span className="text-[#00ff66]">● STREAMING FEED</span>
              </div>

              <div className="flex flex-col gap-1">
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
                      className="p-2 bg-[#0c1018] border border-[#182030] hover:border-[#00e5ff] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-white">
                            {q.symbol}
                          </span>
                          <span className="text-[9px] text-[#6b768e]">
                            &lt;{q.category}&gt;
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8e95a5]">
                          {q.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-white tabular-nums">
                          {currSym}{formatPrice(q.price, 2)}
                        </div>
                        <div
                          className={`text-[10px] font-bold tabular-nums ${
                            q.positive ? 'text-[#00ff66]' : 'text-[#ff3b30]'
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
            <div className="py-8 text-center text-[#8e95a5] text-xs">
              NO ACTIVE INSTRUMENT OR FUNCTION FOR &quot;{query.toUpperCase()}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
