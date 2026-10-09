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
    { id: 'ALL', label: '<ALL WIRE>' },
    { id: 'MACRO', label: '<MACRO>' },
    { id: 'EQUITIES', label: '<EQUITIES>' },
    { id: 'CRYPTO', label: '<CRYPTO>' },
    { id: 'COMDTY', label: '<COMDTY>' },
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
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-24">
      <TerminalHeader
        title="TOP WIRE DISPATCH"
        subtitle="REAL-TIME NEWS <TOP <GO>>"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Wire Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#182030] pb-2">
          {filters.map((f) => {
            const isActive = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  terminalAudio.playTick();
                  setSelectedFilter(f.id);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-sm whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#ff8800] text-black border-[#ff8800]'
                    : 'bg-[#0c1018] text-[#8e95a5] hover:text-white border-[#1c2436]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Master News Wire Feed */}
        <div className="border border-[#182030] bg-[#070a10] divide-y divide-[#182030]">
          <div className="px-2.5 py-1 bg-[#101520] flex items-center justify-between text-[10px] text-[#8e95a5] font-bold">
            <span className="text-[#ff8800]">BLOOMBERG FIRST WORD WIRE &amp; EXCLUSIVE STORIES</span>
            <span className="text-[#00ff66]">COUNT: {filteredNews.length}</span>
          </div>

          {filteredNews.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                terminalAudio.playTick();
                onSelectNews(item);
              }}
              className="p-3 hover:bg-[#0e131d] active:bg-[#141b26] cursor-pointer transition-colors"
            >
              {/* Header: Story #, Time, Source, Urgency */}
              <div className="flex items-center justify-between text-[10px] text-[#8e95a5] mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#ff8800]">{idx + 1})</span>
                  <span className="text-white font-bold">{item.time || '10:48:12'}</span>
                  <span className="text-[#00e5ff] font-semibold">[{item.source || 'BN'}]</span>
                  <span className="text-[#ffd600] font-bold">***</span>
                </div>
                <span className="text-[9px] uppercase px-1 py-0.2 bg-[#121824] border border-[#1e283d] text-[#6b768e]">
                  {item.category || 'WIRE'}
                </span>
              </div>

              {/* Headline */}
              <h4 className="text-xs font-bold text-white leading-snug hover:text-[#ff8800] transition-colors">
                {item.title}
              </h4>

              {/* Bullets Preview if available */}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 border-l-2 border-[#1f2d45] pl-2 text-[10px] text-[#94a3b8]">
                  {item.bullets.slice(0, 2).map((bullet, bIdx) => (
                    <li key={bIdx} className="line-clamp-1">
                      &bull; {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer metadata */}
              <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#55637d]">
                <span>PRESS &lt;GO&gt; TO EXPAND FULL STORY</span>
                <span>DESK: GLOBAL MARKETS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
