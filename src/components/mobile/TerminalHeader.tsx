// src/components/mobile/TerminalHeader.tsx
'use client';

import React from 'react';
import { ChevronLeft, Search, Bell, SlidersHorizontal } from 'lucide-react';

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
  subtitle = 'MARKET TERMINAL',
  showBack = false,
  onBack,
  onSearchClick,
  onAlertsClick,
  onFilterClick,
  hasUnreadAlerts = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-[#181d28] select-none">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={onBack}
            className="text-white hover:text-[#ff8800] active:scale-95 transition-all p-1 -ml-1 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
        )}

        <div className="flex flex-col leading-none">
          <span className="text-[20px] font-extrabold tracking-tight text-white">
            {title}
          </span>
          <span className="text-[9px] font-bold tracking-[2px] text-[#8e95a5] uppercase mt-0.5">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="text-white hover:text-[#ff8800] active:scale-95 transition-all cursor-pointer p-1"
            aria-label="Search instruments"
          >
            <Search size={19} strokeWidth={2.2} />
          </button>
        )}

        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="text-white hover:text-[#ff8800] active:scale-95 transition-all cursor-pointer p-1"
            aria-label="Filter"
          >
            <SlidersHorizontal size={18} strokeWidth={2.2} />
          </button>
        )}

        {onAlertsClick && (
          <button
            onClick={onAlertsClick}
            className="text-white hover:text-[#ff8800] active:scale-95 transition-all relative cursor-pointer p-1"
            aria-label="Alerts"
          >
            <Bell size={19} strokeWidth={2.2} />
            {hasUnreadAlerts && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#ff4d4f] ring-2 ring-[#000000]" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
