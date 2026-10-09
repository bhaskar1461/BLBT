// src/components/mobile/NewsView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import type { NewsItem } from './types';
import { terminalAudio } from '@/lib/terminalAudio';

interface NewsViewProps {
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
  onSearchClick: () => void;
  onAlertsClick: () => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  onSelectNews,
  onSearchClick,
  onAlertsClick,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MACRO' | 'EQUITIES' | 'CRYPTO' | 'COMDTY'>('ALL');

  const filters = [
    { id: 'ALL', label: 'All Wire' },
    { id: 'MACRO', label: 'Macro' },
    { id: 'EQUITIES', label: 'Equities' },
    { id: 'CRYPTO', label: 'Crypto' },
    { id: 'COMDTY', label: 'Commodities' },
  ] as const;

  const filteredNews = useMemo(() => {
    if (selectedFilter === 'ALL') return news;
    return news.filter((item) => {
      const cat = (item.category || '').toUpperCase();
      if (selectedFilter === 'MACRO') return cat.includes('MACRO') || cat.includes('FED');
      if (selectedFilter === 'EQUITIES') return cat.includes('INDIA') || cat.includes('TECH') || cat.includes('EQUITY');
      if (selectedFilter === 'CRYPTO') return cat.includes('CRYPTO') || cat.includes('BTC');
      if (selectedFilter === 'COMDTY') return cat.includes('COMMODIT') || cat.includes('GOLD') || cat.includes('OIL');
      return true;
    });
  }, [news, selectedFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      <TerminalHeader
        title="NEWS WIRE"
        subtitle="REAL-TIME FINANCIAL DISPATCH"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Wire Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filters.map((f) => {
            const isActive = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  terminalAudio.playTick();
                  setSelectedFilter(f.id);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f59e0b] text-black font-bold'
                    : 'bg-[#0e131d] text-[#94a3b8] hover:text-white border border-[#1e2638]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Master News Wire Feed */}
        <div className="border border-[#1e2638] bg-[#0c1018] rounded-md overflow-hidden divide-y divide-[#161f30]">
          <div className="px-3 py-2 bg-[#121824] flex items-center justify-between text-[11px] text-[#94a3b8] font-mono">
            <span className="text-white font-semibold">FINANCIAL DISPATCH FEED</span>
            <span className="text-[#10b981]">COUNT: {filteredNews.length}</span>
          </div>

          {filteredNews.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                terminalAudio.playTick();
                onSelectNews(item);
              }}
              className="p-3.5 hover:bg-[#121824] active:bg-[#182030] cursor-pointer transition-colors space-y-1.5"
            >
              {/* Header: Time, Source, Category */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#f59e0b] font-semibold">{item.time || '10:48:12'}</span>
                  <span className="text-[#334155]">&bull;</span>
                  <span className="text-[#38bdf8] font-semibold uppercase">[{item.source || 'WIRE'}]</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#131926] border border-[#1e2638] text-[#94a3b8]">
                  {item.category || 'MARKETS'}
                </span>
              </div>

              {/* Headline */}
              <h4 className="text-xs font-semibold text-white hover:text-[#f59e0b] leading-snug transition-colors">
                {item.title}
              </h4>

              {/* Bullets Preview if available */}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="mt-1 space-y-0.5 border-l-2 border-[#1e2638] pl-2 text-[11px] text-[#94a3b8]">
                  {item.bullets.slice(0, 2).map((bullet, bIdx) => (
                    <li key={bIdx} className="line-clamp-1">
                      &bull; {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {/* Tap prompt */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-[#64748b] font-mono">
                <span>Tap to expand full story</span>
                <span>DESK VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
