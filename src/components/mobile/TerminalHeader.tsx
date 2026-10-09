// src/components/mobile/TerminalHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Bell, SlidersHorizontal } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface TerminalHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSearchClick?: () => void;
  onAlertsClick?: () => void;
  onFilterClick?: () => void;
  hasUnreadAlerts?: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  title,
  subtitle = 'MARKET TERMINAL <GO>',
  showBack = false,
  onBack,
  onSearchClick,
  onAlertsClick,
  onFilterClick,
  hasUnreadAlerts = true,
}) => {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now)
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#080a0f] border-b border-[#1a2336] px-3 pt-2 pb-2 font-sans select-none">
      {/* Top Telemetry Line */}
      <div className="flex items-center justify-between text-[10px] text-[#64748b] border-b border-[#141b28] pb-1 mb-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-white font-bold tracking-tight">CELSIUS</span>
          <span className="text-[#f59e0b] font-bold">TERMINAL</span>
          <span className="text-[#334155]">&bull;</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-[#10b981]/15 text-[#10b981] font-semibold">
            LIVE FEEDS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#94a3b8]">UTC</span>
          <span className="text-white font-semibold tabular-nums">{clock}</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onBack?.();
              }}
              className="text-[#f59e0b] hover:text-white active:scale-95 transition-all p-1 -ml-1 rounded-md bg-[#131926] border border-[#1e2638] cursor-pointer flex items-center gap-1 text-xs font-semibold"
              aria-label="Back"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-black tracking-tight text-white">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] font-medium tracking-wide text-[#94a3b8]">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSearchClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onSearchClick();
              }}
              className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-[#38bdf8] rounded-md transition-colors cursor-pointer"
              title="Search Security"
            >
              <Search size={14} />
            </button>
          )}

          {onFilterClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onFilterClick();
              }}
              className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-[#f59e0b] rounded-md transition-colors cursor-pointer"
              title="Filter"
            >
              <SlidersHorizontal size={14} />
            </button>
          )}

          {onAlertsClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onAlertsClick();
              }}
              className="p-1.5 bg-[#131926] hover:bg-[#1a2334] border border-[#1e2638] text-white rounded-md transition-colors relative cursor-pointer"
              title="Alerts"
            >
              <Bell size={14} />
              {hasUnreadAlerts && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
