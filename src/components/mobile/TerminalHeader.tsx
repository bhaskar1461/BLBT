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
    <header className="sticky top-0 z-40 bg-[#000000] border-b-2 border-[#182030] px-3 pt-2.5 pb-2 font-mono select-none">
      {/* Top Telemetry Line */}
      <div className="flex items-center justify-between text-[10px] text-[#6b768e] border-b border-[#101622] pb-1 mb-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800] animate-pulse" />
          <span className="text-white font-black tracking-normal">BLOOMBERG</span>
          <span className="text-[#ff8800]">ANYWHERE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66]">LIVE</span>
          <span className="text-white font-bold">{clock}</span>
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
              className="text-[#ff8800] hover:text-white active:scale-95 transition-all p-0.5 -ml-1 cursor-pointer flex items-center gap-0.5 text-xs font-bold"
              aria-label="Back"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
              <span>&lt;ESC&gt;</span>
            </button>
          )}

          <div className="flex flex-col leading-none">
            <span className="text-[16px] font-black tracking-wide text-white uppercase">
              {title}
            </span>
            <span className="text-[9px] font-bold tracking-wider text-[#ff8800] uppercase mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSearchClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onSearchClick();
              }}
              className="px-2 py-1 bg-[#101622] hover:bg-[#182030] border border-[#1e2a40] text-[#00e5ff] text-[10px] font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-1"
              title="Security Finder <SECF>"
            >
              <Search size={12} />
              <span>&lt;SECF&gt;</span>
            </button>
          )}

          {onFilterClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onFilterClick();
              }}
              className="px-2 py-1 bg-[#101622] hover:bg-[#182030] border border-[#1e2a40] text-[#ffd600] text-[10px] font-bold rounded-sm transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={12} />
            </button>
          )}

          {onAlertsClick && (
            <button
              onClick={() => {
                terminalAudio.playTick();
                onAlertsClick();
              }}
              className="px-2 py-1 bg-[#101622] hover:bg-[#182030] border border-[#1e2a40] text-white text-[10px] font-bold rounded-sm transition-colors relative cursor-pointer"
            >
              <Bell size={12} />
              {hasUnreadAlerts && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff8800] rounded-full animate-ping" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
