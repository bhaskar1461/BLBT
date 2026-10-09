// src/components/mobile/HomeView.tsx
'use client';

import React, { useState } from 'react';
import type { Quote, NewsItem, PortfolioSummary } from './types';
import { formatPrice } from '@/lib/utils';
import {
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Search,
  Bell,
  Clock,
  Shield,
} from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

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

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-24">
      {/* 1. Bloomberg Professional Terminal Header Bar */}
      <header className="px-3 py-2 bg-[#05070a] border-b-2 border-[#182030] flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff8800] shadow-[0_0_8px_#ff8800] animate-pulse" />
          <span className="text-white font-black text-xs tracking-wider">
            BLOOMBERG
          </span>
          <span className="text-[10px] text-[#ff8800] px-1 bg-[#ff8800]/15 border border-[#ff8800]/40 font-bold">
            PROFESSIONAL
          </span>
          <span className="text-[#2a364d]">|</span>
          <span className="text-[10px] text-white font-bold">&lt;MON &lt;GO&gt;&gt;</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              terminalAudio.playTick();
              onSearchClick();
            }}
            className="p-1.5 bg-[#101520] hover:bg-[#182338] border border-[#1a2333] text-[#ff8800] rounded-sm transition-colors"
            title="Search Security <SECF>"
          >
            <Search size={13} />
          </button>
          <button
            onClick={() => {
              terminalAudio.playTick();
              onAlertsClick();
            }}
            className="p-1.5 bg-[#101520] hover:bg-[#182338] border border-[#1a2333] text-[#00c176] rounded-sm transition-colors"
            title="Alerts"
          >
            <Bell size={13} />
          </button>
        </div>
      </header>

      {/* 2. Global Multi-Timezone & Market Session Telemetry Strip */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#080b11] border-b border-[#141a26] text-[10px] text-[#8e95a5] overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#00c176] font-bold">● NSE: OPEN</span>
          <span className="text-[#5c6475]">·</span>
          <span className="text-[#00c176] font-bold">● NYSE: OPEN</span>
          <span className="text-[#5c6475]">·</span>
          <span className="text-[#ff8800] font-bold">CRYPTO 24/7</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[#64748b] ml-4">
          <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
          <span className="text-[#ff8800]">MUMBAI: 13:30 IST 🇮🇳</span>
        </div>
      </div>

      {/* 3. Terminal Quick Command Strip */}
      <div className="px-3 py-1.5 bg-[#05070a] border-b border-[#182030] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] text-[#64748b] font-bold">COMMANDS:</span>
        {[
          { code: 'WEI', label: 'INDICES' },
          { code: 'GP', label: 'CHART' },
          { code: 'TOP', label: 'NEWS' },
          { code: 'EMSX', label: 'ORDERS' },
          { code: 'PORT', label: 'PORTFOLIO' },
          { code: 'IB', label: 'CHAT' },
        ].map((btn) => (
          <button
            key={btn.code}
            onClick={() => {
              terminalAudio.playTick();
              if (btn.code === 'IB' && onOpenIB) {
                onOpenIB();
              } else {
                onSelectFunction(btn.code);
              }
            }}
            className="px-2 py-0.5 bg-[#0e1420] hover:bg-[#182338] border border-[#1a2333] hover:border-[#ff8800] text-[10px] text-[#ff8800] font-bold rounded-sm shrink-0 transition-colors"
          >
            &lt;{btn.code}&gt; {btn.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* 4. Instant Bloomberg <IB> Live Terminal Desk Banner */}
        <section
          onClick={() => {
            terminalAudio.playTick();
            onOpenIB?.();
          }}
          className="p-3 bg-[#070b12] border border-[#ff8800]/60 rounded-sm cursor-pointer hover:bg-[#0c121e] active:scale-[0.99] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#ff8800] text-black flex items-center justify-center font-black">
              <MessageSquare size={16} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xs">
                  INSTANT BLOOMBERG &lt;IB &lt;GO&gt;&gt;
                </span>
                <span className="px-1 bg-[#00c176]/20 text-[#00c176] text-[9px] font-bold border border-[#00c176]/40">
                  LIVE BOT DESK
                </span>
              </div>
              <span className="text-[10px] text-[#8e95a5]">
                Ask Bloomberg Desk Bot for quotes, margins, or market math
              </span>
            </div>
          </div>
          <div className="text-[10px] text-[#ff8800] font-bold flex items-center gap-1">
            <span>&lt;OPEN&gt;</span>
            <ArrowRight size={12} />
          </div>
        </section>

        {/* 5. Institutional Portfolio & Margin Blotter (PORT <GO>) */}
        <section className="bg-[#05070a] border border-[#1a2333] rounded-sm overflow-hidden">
          <div className="px-3 py-1.5 bg-[#0a0f18] border-b border-[#141a26] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">
                &lt;PORT 01&gt;
              </span>
              <span className="text-white font-bold text-[11px] tracking-wider uppercase">
                PORTFOLIO BLOTTER &amp; MARGIN TELEMETRY
              </span>
            </div>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllPortfolios();
              }}
              className="text-[10px] text-[#ff8800] font-bold hover:underline"
            >
              &lt;EXPAND &lt;GO&gt;&gt;
            </button>
          </div>

          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-[#000000] border border-[#141a26] rounded-sm">
                <span className="text-[9px] text-[#64748b] block uppercase">ACCOUNT NAV</span>
                <span className="text-sm font-black text-white">$10,000.00</span>
                <span className="text-[9px] text-[#64748b] block">USDT Base (10^8)</span>
              </div>

              <div className="p-2 bg-[#000000] border border-[#141a26] rounded-sm">
                <span className="text-[9px] text-[#64748b] block uppercase">AVAIL CASH</span>
                <span className="text-sm font-black text-[#00c176]">$9,850.00</span>
                <span className="text-[9px] text-[#64748b] block">98.5% Liquid</span>
              </div>

              <div className="p-2 bg-[#000000] border border-[#141a26] rounded-sm">
                <span className="text-[9px] text-[#64748b] block uppercase">REALIZED P&amp;L</span>
                <span className="text-sm font-black text-[#00c176]">+$150.00</span>
                <span className="text-[9px] text-[#00c176] block">+1.50% Net</span>
              </div>

              <div className="p-2 bg-[#000000] border border-[#141a26] rounded-sm">
                <span className="text-[9px] text-[#64748b] block uppercase">RISK PER TRADE</span>
                <span className="text-sm font-black text-[#ff8800]">1.0% MAX</span>
                <span className="text-[9px] text-[#ff8800] block">Enforced Hard Cap</span>
              </div>
            </div>

            {/* Benchmark Mirror Line */}
            <div className="p-2 bg-[#000000] border border-[#141a26] rounded-sm flex items-center justify-between text-[10px]">
              <span className="text-[#8e95a5]">
                BENCHMARK: Same capital in BTC buy-and-hold: <strong className="text-white">+0.66%</strong>. Active P&amp;L: <strong className="text-[#00c176]">+1.50%</strong>.
              </span>
              <span className="text-[#00c176] font-bold uppercase shrink-0">OUTPERFORMING</span>
            </div>
          </div>
        </section>

        {/* 6. World Equity & Market Monitors (WEI <GO>) */}
        <section className="bg-[#05070a] border border-[#1a2333] rounded-sm overflow-hidden">
          <div className="px-3 py-1.5 bg-[#0a0f18] border-b border-[#141a26] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">
                &lt;WEI 02&gt;
              </span>
              <span className="text-white font-bold text-[11px] tracking-wider uppercase">
                WORLD MARKET MONITORS
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              {(['ALL', 'CRYPTO', 'INDIA', 'TECH'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    terminalAudio.playTick();
                    setFilterCategory(cat);
                  }}
                  className={`px-1.5 py-0.5 rounded-sm font-bold transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#ff8800] text-black'
                      : 'text-[#8e95a5] hover:text-white bg-[#0e1420]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Monospace Quotes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#141a26] bg-[#080b11] text-[#ff8800] text-[10px] uppercase">
                  <th className="py-2 px-3 font-bold">Security</th>
                  <th className="py-2 px-3 font-bold text-right">Last</th>
                  <th className="py-2 px-3 font-bold text-right">Net Chg</th>
                  <th className="py-2 px-3 font-bold text-right">% Chg</th>
                  <th className="py-2 px-3 font-bold text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141a26]">
                {filteredQuotes.map((q) => {
                  const isPos = q.percent >= 0;
                  return (
                    <tr
                      key={q.id || q.symbol}
                      onClick={() => {
                        terminalAudio.playTick();
                        onSelectQuote(q);
                      }}
                      className="hover:bg-[#0c121e] active:bg-[#141c2c] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{q.symbol}</span>
                          <span className="text-[10px] text-[#64748b] truncate max-w-[90px]">
                            {q.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-white">
                        ${formatPrice(q.price, 2)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold text-xs ${
                          isPos ? 'text-[#00c176]' : 'text-red-400'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {formatPrice(q.change, 2)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-black text-xs ${
                          isPos ? 'text-[#00c176]' : 'text-red-400'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {q.percent.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-[10px] text-[#8e95a5]">
                        {q.volume || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Bloomberg News Wire Dispatch (<TOP <GO>>) */}
        <section className="bg-[#05070a] border border-[#1a2333] rounded-sm overflow-hidden">
          <div className="px-3 py-1.5 bg-[#0a0f18] border-b border-[#141a26] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 bg-[#ff8800] text-black font-black text-[9px]">
                &lt;TOP 03&gt;
              </span>
              <span className="text-white font-bold text-[11px] tracking-wider uppercase">
                BLOOMBERG REAL-TIME WIRE DISPATCH
              </span>
            </div>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllNews();
              }}
              className="text-[10px] text-[#ff8800] font-bold hover:underline"
            >
              &lt;READ &lt;GO&gt;&gt;
            </button>
          </div>

          <div className="divide-y divide-[#141a26]">
            {news.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  terminalAudio.playTick();
                  onSelectNews(item);
                }}
                className="p-2.5 hover:bg-[#0c121e] active:bg-[#141c2c] cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#ff8800] font-bold">{item.time}</span>
                  <span className="text-[#5c6475]">·</span>
                  <span className="text-[#00c176] font-bold uppercase">{item.source}</span>
                  <span className="text-[#5c6475]">·</span>
                  <span className="text-[#64748b] uppercase">{item.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white hover:text-[#ff8800] leading-snug">
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
