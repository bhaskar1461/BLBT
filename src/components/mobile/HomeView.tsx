// src/components/mobile/HomeView.tsx
'use client';

import React from 'react';
import { TerminalHeader } from './TerminalHeader';
import { QuoteRow } from './QuoteRow';
import { MiniSparkline } from './MiniSparkline';
import { BloombergFunctionBar } from './BloombergFunctionBar';
import type { Quote, NewsItem, PortfolioSummary } from './types';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { ArrowUpRight, Activity } from 'lucide-react';
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
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-24">
      {/* Pinned Top Terminal Header */}
      <TerminalHeader
        title="Overview"
        subtitle="MARKET TERMINAL"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      {/* Authentic Bloomberg Function Shortcuts Bar */}
      <BloombergFunctionBar
        activeCode="TOP"
        onSelectFunction={onSelectFunction}
      />

      {/* Global Market Sessions Pulse Strip */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#07090e] border-b border-[#141822] text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-[#00c176]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] shadow-[0_0_6px_#00c176] animate-pulse" />
          <span>NSE: OPEN</span>
          <span className="text-[#5c6475]">·</span>
          <span>NYSE: OPEN</span>
        </div>
        <div className="flex items-center gap-1 text-[#8e95a5]">
          <Activity size={10} className="text-[#ff8800]" />
          <span>CRYPTO 24/7 SPOT</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Profile Strip (Bhaskar Sharma, Individual Investor, Active) */}
        <section
          onClick={() => {
            terminalAudio.playTick();
            onOpenProfile();
          }}
          className="flex items-center gap-3.5 p-3.5 -mx-1 rounded-2xl bg-[#0d1017] border border-[#1b2230] cursor-pointer hover:border-[#2f3b52] active:scale-[0.99] transition-all shadow-md"
        >
          <div className="w-[54px] h-[54px] rounded-full bg-[#151a24] border-2 border-[#2b3547] flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-inner">
            BS
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-white truncate leading-tight">
                Bhaskar Sharma
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00c176]">
                <span className="w-2 h-2 rounded-full bg-[#00c176] shadow-[0_0_8px_#00c176] animate-pulse" />
                <span>Active</span>
              </div>
            </div>

            <p className="text-[12px] text-[#8e95a5] font-medium leading-none mt-1">
              Individual Investor · India 🇮🇳
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-bold font-mono tracking-wider text-[#d1d5db] bg-[#1a2130] border border-[#2b374e] px-1.5 py-0.5 rounded-[3px] uppercase">
                BLOOMBERG ANYWHERE USER
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: MARKET SNAPSHOT */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-extrabold tracking-[1px] text-[#8e95a5] uppercase">
              MARKET SNAPSHOT
            </h3>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllMarkets();
              }}
              className="text-[12px] font-bold text-[#ff8800] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl px-3 py-1 shadow-sm divide-y divide-[#181d28]/70">
            {quotes.slice(0, 4).map((q) => (
              <QuoteRow
                key={q.id || q.symbol}
                quote={q}
                onClick={() => onSelectQuote(q)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: MY PORTFOLIOS (PORT) */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-extrabold tracking-[1px] text-[#8e95a5] uppercase">
              MY PORTFOLIOS &lt;PORT&gt;
            </h3>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllPortfolios();
              }}
              className="text-[12px] font-bold text-[#ff8800] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {portfolios.map((p) => {
              const inrStr = formatInrCrore(p.valueUsd);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    terminalAudio.playTick();
                    onViewAllPortfolios();
                  }}
                  className="bg-[#0e1118] border border-[#1b2230] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-[#ff8800]/50 active:scale-[0.99] transition-all shadow-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-[#8e95a5] truncate">
                      {p.name}
                    </span>
                    <span className="font-mono text-[17px] font-bold text-white tracking-tight tabular-nums">
                      ${formatPrice(p.valueUsd, 2)}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#ff8800] mt-0.5">
                      ≈ {inrStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#181d28]">
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        p.positive ? 'text-[#00c176]' : 'text-[#ff4d4f]'
                      }`}
                    >
                      {p.positive ? '+' : ''}{p.changePercent.toFixed(2)}%
                    </span>
                    <MiniSparkline
                      positive={p.positive}
                      points={p.sparkline}
                      width={48}
                      height={18}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Asset Allocation Bar (Equities 48%, Crypto 32%, F&O 15%, Cash 5%) */}
          <div className="p-3 bg-[#0e1118] border border-[#1b2230] rounded-xl flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8e95a5] font-bold">ASSET ALLOCATION</span>
              <span className="text-white font-semibold">$745,734.11 TOTAL</span>
            </div>

            {/* Segmented Horizontal Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#161c28]">
              <div className="bg-[#00c176] h-full" style={{ width: '48%' }} title="Equities 48%" />
              <div className="bg-[#ff8800] h-full" style={{ width: '32%' }} title="Crypto 32%" />
              <div className="bg-[#2979ff] h-full" style={{ width: '15%' }} title="F&O 15%" />
              <div className="bg-[#8e95a5] h-full" style={{ width: '5%' }} title="Cash 5%" />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#8e95a5] pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00c176]" />
                <span>EQ 48%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff8800]" />
                <span>CRYPTO 32%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2979ff]" />
                <span>F&amp;O 15%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8e95a5]" />
                <span>CASH 5%</span>
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: RECENT NEWS <TOP> */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-extrabold tracking-[1px] text-[#8e95a5] uppercase">
              TOP NEWS &lt;TOP&gt;
            </h3>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onViewAllNews();
              }}
              className="text-[12px] font-bold text-[#ff8800] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  terminalAudio.playTick();
                  onSelectNews(item);
                }}
                className="bg-[#0e1118] border border-[#1b2230] rounded-xl p-3 flex gap-3 cursor-pointer hover:border-[#2f3b52] active:scale-[0.99] transition-all shadow-sm"
              >
                <div className="w-[68px] h-[54px] rounded-lg bg-[#151a24] border border-[#212b3d] flex items-center justify-center shrink-0 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 68 54">
                    <rect width="68" height="54" fill="#151a24" />
                    {item.category === 'India' ? (
                      <>
                        <circle cx="34" cy="27" r="12" fill="#1f2736" />
                        <path d="M26,27 L42,27 M34,19 L34,35" stroke="#00c176" strokeWidth="2" />
                      </>
                    ) : item.category === 'Crypto' ? (
                      <path d="M12,42 L24,24 L36,32 L54,14" stroke="#00c176" strokeWidth="2.2" fill="none" />
                    ) : (
                      <path d="M10,42 L24,20 L38,28 L56,12" stroke="#ff8800" strokeWidth="2.2" fill="none" />
                    )}
                  </svg>
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-white line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[#ff8800] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#8e95a5]">
                      {item.source} · {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
