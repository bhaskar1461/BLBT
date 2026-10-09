// src/components/bloomberg/BloombergPanelTOP.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { NewsItem } from '@/components/mobile/types';
import { Newspaper, BellRing, ExternalLink, Search, Clock, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergPanelTOPProps {
  news: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BloombergPanelTOP: React.FC<BloombergPanelTOPProps> = ({
  news,
  onSelectArticle,
  isMaximized,
  onToggleMaximize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Macro', 'Technology', 'India', 'Crypto'] as const;

  const filteredNews = useMemo(() => {
    let list = news;
    if (selectedCategory !== 'ALL') {
      list = list.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q)
      );
    }
    return list;
  }, [news, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#080b11] border border-[#182030] rounded overflow-hidden font-mono select-none text-xs">
      {/* Panel Header */}
      <div className="bg-[#0e131d] px-3 py-2 border-b border-[#1c2638] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs text-[#ff8800] bg-[#ff8800]/15 px-1.5 py-0.5 rounded border border-[#ff8800]/30">
            TOP
          </span>
          <span className="font-bold text-white tracking-wider text-[11px] uppercase">
            BLOOMBERG REAL-TIME WIRE DISPATCH
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2 text-[#64748b] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="WIRE SEARCH..."
              className="w-28 bg-[#141b27] border border-[#232f45] focus:border-[#ff8800] rounded pl-6 pr-2 py-0.5 text-[10px] text-white placeholder-[#505d75] outline-none uppercase font-mono"
            />
          </div>

          <div className="flex items-center gap-1 text-[#ff8800] text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800] animate-ping" />
            <span>FLASH WIRE</span>
          </div>

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1 hover:bg-[#1a2333] text-[#8e95a5] hover:text-[#ff8800] rounded transition-colors"
              title={isMaximized ? "Restore 4-Panel Layout" : "Maximize Panel"}
            >
              {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#0a0e16] px-2 py-1 border-b border-[#161f2e] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const labels: Record<string, string> = {
            ALL: 'ALL WIRE',
            Macro: 'GLOBAL MACRO',
            Technology: 'TECH DESK',
            India: 'INDIA 🇮🇳',
            Crypto: 'DIGITAL ASSETS 🌐',
          };
          return (
            <button
              key={cat}
              onClick={() => {
                terminalAudio.playTick();
                setSelectedCategory(cat);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#ff8800] text-black shadow-sm'
                  : 'text-[#8e95a5] hover:text-white bg-[#121824]'
              }`}
            >
              {labels[cat] || cat}
            </button>
          );
        })}
      </div>

      {/* Dispatch Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#131b28]">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              terminalAudio.playTick();
              onSelectArticle(item);
            }}
            className="p-3 hover:bg-[#0f1420] transition-colors cursor-pointer group flex items-start gap-3"
          >
            {/* Timestamp Badge */}
            <div className="shrink-0 text-right w-14">
              <span className="text-[10px] font-mono text-[#64748b] block">
                {item.time}
              </span>
              <span className="text-[9px] font-mono font-bold text-[#ff8800] bg-[#ff8800]/10 px-1 py-0.2 rounded mt-0.5 inline-block">
                {item.category.toUpperCase()}
              </span>
            </div>

            {/* Headline & Source */}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white group-hover:text-[#ff8800] transition-colors leading-snug line-clamp-2">
                {item.title}
              </div>

              <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8e95a5]">
                <span className="font-bold text-[#a0aec0]">{item.source}</span>
                <span>·</span>
                <span className="text-[#00c176]">BN-DISPATCH</span>
                <span className="opacity-0 group-hover:opacity-100 text-[#ff8800] transition-opacity ml-auto flex items-center gap-0.5">
                  READ WIRE &lt;GO&gt; <ArrowRight size={10} />
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredNews.length === 0 && (
          <div className="p-8 text-center text-[#64748b] font-mono text-xs">
            NO DISPATCHES MATCHING &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
