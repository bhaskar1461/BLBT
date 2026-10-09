// src/components/mobile/HomeView.tsx
'use client';

import React, { useState } from 'react';
import type { Quote, NewsItem, PortfolioSummary } from './types';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import {
  Search,
  Bell,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';
import { MiniSparkline } from './MiniSparkline';

interface HomeViewProps {
  quotes: Quote[];
  news: NewsItem[];
  portfolios: PortfolioSummary[];
  onSelectQuote: (quote: Quote) => void;
  onSelectNews: (item: NewsItem) => void;
  onViewAllMarkets: () => void;
  onViewAllPortfolios: () => void;
  onViewAllNews: () => void;
  onOpenProfile: () => void;
  onSearchClick: () => void;
  onAlertsClick: () => void;
  onSelectFunction: (code: string) => void;
  onOpenIB?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  quotes,
  news,
  portfolios,
  onSelectQuote,
  onSelectNews,
  onViewAllMarkets,
  onViewAllPortfolios,
  onViewAllNews,
  onOpenProfile,
  onSearchClick,
  onAlertsClick,
  onSelectFunction,
  onOpenIB,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CRYPTO' | 'INDIA' | 'TECH'>('ALL');

  const filteredQuotes = quotes.filter((q) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'CRYPTO') return q.category === 'crypto';
    if (filterCategory === 'INDIA') return q.category === 'india';
    if (filterCategory === 'TECH') return q.category === 'tech';
    return true;
  });

  // Featured top assets for the hero market cards
  const featuredQuotes = quotes.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      {/* 1. Header Bar */}
      <header className="px-3.5 py-2.5 bg-[#0b0e14] border-b border-[#1a2336] flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-sm tracking-tight">
              CELSIUS
            </span>
            <span className="text-[#f59e0b] font-bold text-xs">
              TERMINAL
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] hidden xs:inline font-mono">
            ANYWHERE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              terminalAudio.playTick();
              onSearchClick();
            }}
            className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-[#38bdf8] rounded-md transition-colors"
            title="Search Instruments"
          >
            <Search size={14} />
          </button>

          <button
            onClick={() => {
              terminalAudio.playTick();
              onAlertsClick();
            }}
            className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-white rounded-md transition-colors relative"
            title="Alerts"
          >
            <Bell size={14} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse" />
          </button>

          {onOpenIB && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onOpenIB();
              }}
              className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-[#f59e0b] rounded-md transition-colors"
              title="Terminal Desk Assistant"
            >
              <MessageSquare size={14} />
            </button>
          )}
        </div>
      </header>

      {/* 2. Global Multi-Exchange Session Status Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0d14] border-b border-[#161f30] text-[10px] text-[#94a3b8] overflow-x-auto no-scrollbar shrink-0 font-mono">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <strong className="text-white">NSE:</strong> OPEN
          </span>
          <span className="text-[#334155]">&bull;</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <strong className="text-white">NYSE:</strong> OPEN
          </span>
          <span className="text-[#334155]">&bull;</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <strong className="text-[#38bdf8]">CRYPTO:</strong> 24/7
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[#64748b] ml-4">
          <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
          <span className="text-[#f59e0b] font-semibold">MUMBAI IST</span>
        </div>
      </div>

      <div className="p-3 space-y-3.5">
        {/* 3. Compact Portfolio Summary Card */}
        <section
          onClick={() => {
            terminalAudio.playTick();
            onViewAllPortfolios();
          }}
          className="p-3.5 bg-gradient-to-b from-[#0f1422] to-[#0a0d16] border border-[#1e2638] hover:border-[#2a3854] rounded-lg cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-bold text-[10px] font-mono border border-[#f59e0b]/30">
                PORTFOLIO
              </span>
              <span className="text-xs font-semibold text-[#cbd5e1]">
                Master Blotter &bull; #C782-9901
              </span>
            </div>
            <div className="text-[11px] text-[#f59e0b] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>View Details</span>
              <ChevronRight size={14} />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2.5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
                  $36,000.00
                </span>
                <span className="text-xs font-bold font-mono text-[#f59e0b] tabular-nums">
                  (&asymp; ₹30.00 Lakhs)
                </span>
              </div>
              <span className="text-[10px] text-[#64748b] font-mono">
                Available Liquid Cash: $3,400.00 (9.4%)
              </span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] font-mono font-bold text-xs">
                <ArrowUpRight size={12} />
                <span>+$830 (2.31%)</span>
              </span>
              <span className="text-[10px] text-[#64748b] block font-mono mt-0.5">Today</span>
            </div>
          </div>

          {/* Compact Allocation Progress Bar */}
          <div className="mt-2.5 pt-2 border-t border-[#161f30]">
            <div className="h-1.5 w-full bg-[#161f30] rounded-full overflow-hidden flex">
              <div style={{ width: '46.4%' }} className="bg-[#f59e0b] h-full" title="BTC 46.4%" />
              <div style={{ width: '23.7%' }} className="bg-[#38bdf8] h-full" title="ETH 23.7%" />
              <div style={{ width: '11.3%' }} className="bg-[#a855f7] h-full" title="SOL 11.3%" />
              <div style={{ width: '9.4%' }} className="bg-[#10b981] h-full" title="Cash 9.4%" />
              <div style={{ width: '9.2%' }} className="bg-[#64748b] h-full" title="Other" />
            </div>
          </div>
        </section>

        {/* 4. Featured Market Overview (Cards) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Market Highlights
            </span>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllMarkets();
              }}
              className="text-xs text-[#f59e0b] hover:underline font-medium"
            >
              See All Markets &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {featuredQuotes.map((q) => {
              const isPos = q.percent >= 0;
              return (
                <div
                  key={q.id || q.symbol}
                  onClick={() => {
                    terminalAudio.playTick();
                    onSelectQuote(q);
                  }}
                  className="p-3 bg-[#0e131d] border border-[#1e2638] hover:border-[#2a3854] rounded-lg cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs font-mono">{q.symbol}</div>
                      <div className="text-[10px] text-[#94a3b8] truncate max-w-[85px] mt-0.5">{q.name}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isPos ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#f43f5e]/15 text-[#f43f5e]'
                      }`}
                    >
                      {isPos ? '+' : ''}{q.percent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <div className="text-sm font-bold font-mono text-white tabular-nums">
                      {q.currency === 'INR' ? '₹' : '$'}{formatPrice(q.price, 2)}
                    </div>
                    {q.sparkline && (
                      <div className="mt-1">
                        <MiniSparkline data={q.sparkline} isPositive={isPos} width={110} height={20} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Terminal Desk AI Assistant Trigger */}
        <section
          onClick={() => {
            terminalAudio.playTick();
            onOpenIB?.();
          }}
          className="p-3 bg-[#0c1018] border border-[#1e2638] hover:border-[#f59e0b]/50 rounded-lg cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center justify-center font-bold">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Celsius Terminal Desk</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#10b981]/15 text-[#10b981]">
                  AI ASSISTANT
                </span>
              </div>
              <span className="text-[11px] text-[#94a3b8]">
                Ask Desk Bot for live quotes, margin status &amp; function shortcuts
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#64748b] shrink-0" />
        </section>

        {/* 6. High-Frequency Market Monitor List */}
        <section className="bg-[#0e131d] border border-[#1e2638] rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-[#121824] border-b border-[#1e2638] flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Market Monitor
            </span>

            <div className="flex items-center gap-1 text-[10px] font-mono">
              {(['ALL', 'CRYPTO', 'INDIA', 'TECH'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    terminalAudio.playTick();
                    setFilterCategory(cat);
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#f59e0b] text-black font-bold'
                      : 'text-[#94a3b8] hover:text-white bg-[#161f30]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#161f30]">
            {filteredQuotes.slice(0, 5).map((q) => {
              const isPos = q.percent >= 0;
              return (
                <div
                  key={q.id || q.symbol}
                  onClick={() => {
                    terminalAudio.playTick();
                    onSelectQuote(q);
                  }}
                  className="p-2.5 hover:bg-[#131926] active:bg-[#1a2334] cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs font-mono">{q.symbol}</span>
                      <span className="text-[9px] font-mono text-[#64748b] uppercase">
                        {q.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] truncate mt-0.5">{q.name}</div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white tabular-nums">
                      {q.currency === 'INR' ? '₹' : '$'}{formatPrice(q.price, 2)}
                    </div>
                    <div className={`text-[10px] font-semibold tabular-nums mt-0.5 ${
                      isPos ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    }`}>
                      {isPos ? '+' : ''}{q.percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 bg-[#0a0d14] border-t border-[#161f30] text-center">
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllMarkets();
              }}
              className="text-xs text-[#f59e0b] hover:underline font-medium"
            >
              View All Instruments &rarr;
            </button>
          </div>
        </section>

        {/* 7. Real-Time Financial News Feed */}
        <section className="bg-[#0e131d] border border-[#1e2638] rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-[#121824] border-b border-[#1e2638] flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Financial Wire Dispatch
            </span>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllNews();
              }}
              className="text-[11px] text-[#f59e0b] hover:underline font-medium"
            >
              Full Feed &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#161f30]">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  terminalAudio.playTick();
                  onSelectNews(item);
                }}
                className="p-3 hover:bg-[#131926] active:bg-[#1a2334] cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-[#f59e0b] font-semibold">{item.time}</span>
                  <span className="text-[#334155]">&bull;</span>
                  <span className="text-[#10b981] font-semibold uppercase">{item.source}</span>
                  <span className="text-[#334155]">&bull;</span>
                  <span className="text-[#64748b] uppercase">{item.category}</span>
                </div>
                <h4 className="text-xs font-semibold text-white hover:text-[#f59e0b] leading-snug line-clamp-2">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
