// src/components/mobile/NewsView.tsx
'use client';

import React, { useState } from 'react';
import { TerminalHeader } from './TerminalHeader';
import type { NewsItem } from './types';
import { Clock, TrendingUp, Globe, Shield } from 'lucide-react';

interface NewsViewProps {
  news: NewsItem[];
  onSearchClick: () => void;
  onAlertsClick: () => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  onSearchClick,
  onAlertsClick,
}) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'latest'>('for_you');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-24">
      <TerminalHeader
        title="News"
        subtitle="TERMINAL WIRE"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Sub-header Tabs: FOR YOU vs LATEST */}
        <div className="flex items-center justify-between border-b border-[#181d28] pb-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('for_you')}
              className={`text-[12px] font-extrabold tracking-wider transition-all cursor-pointer ${
                activeTab === 'for_you'
                  ? 'text-[#ff8800] border-b-2 border-[#ff8800] pb-1'
                  : 'text-[#8e95a5] hover:text-white pb-1'
              }`}
            >
              FOR YOU
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`text-[12px] font-extrabold tracking-wider transition-all cursor-pointer ${
                activeTab === 'latest'
                  ? 'text-[#ff8800] border-b-2 border-[#ff8800] pb-1'
                  : 'text-[#8e95a5] hover:text-white pb-1'
              }`}
            >
              LATEST
            </button>
          </div>

          <span className="text-[10px] text-[#5c6475] font-mono">
            UPDATED 2M AGO
          </span>
        </div>

        {/* News Items Feed */}
        <div className="flex flex-col gap-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-[#0e1118] border border-[#1b2230] rounded-xl p-3.5 flex gap-3.5 cursor-pointer hover:border-[#2f3b52] active:scale-[0.99] transition-all shadow-sm"
            >
              {/* Graphic Thumbnail */}
              <div className="w-[74px] h-[64px] rounded-lg bg-[#141924] border border-[#212b3d] flex items-center justify-center shrink-0 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 74 64">
                  <rect width="74" height="64" fill="#141924" />
                  {item.category === 'Technology' && (
                    <path d="M14,50 L28,24 L44,34 L62,14" stroke="#ff8800" strokeWidth="2.5" fill="none" />
                  )}
                  {item.category === 'Macro' && (
                    <>
                      <circle cx="37" cy="32" r="14" fill="#1c2331" />
                      <path d="M26,32 L48,32 M37,21 L37,43" stroke="#00c176" strokeWidth="2" />
                    </>
                  )}
                  {item.category === 'India' && (
                    <>
                      <rect x="18" y="16" width="38" height="32" rx="4" fill="#1f283a" />
                      <circle cx="37" cy="32" r="7" fill="none" stroke="#ff8800" strokeWidth="1.5" />
                    </>
                  )}
                  {item.category !== 'Technology' && item.category !== 'Macro' && item.category !== 'India' && (
                    <path d="M12,46 L26,28 L42,36 L62,18" stroke="#2979ff" strokeWidth="2.2" fill="none" />
                  )}
                </svg>
              </div>

              {/* Headline & Metadata */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-white line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 mt-2">
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
      </div>
    </div>
  );
};
