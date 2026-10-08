'use client';

import React from 'react';
import {
  Bookmark,
  Bell,
  Newspaper,
  BarChart3,
  Flame,
  Calendar,
  MessageSquare,
  HelpCircle,
  DollarSign,
  Maximize2,
  Sliders,
} from 'lucide-react';

interface TradingViewRightRailProps {
  isWatchlistOpen: boolean;
  onToggleWatchlist: () => void;
  onOpenAlerts: () => void;
  onOpenFeedback: () => void;
  onOpenIndicators: () => void;
  onToggleTradePanel?: () => void;
}

export const TradingViewRightRail: React.FC<TradingViewRightRailProps> = ({
  isWatchlistOpen,
  onToggleWatchlist,
  onOpenAlerts,
  onOpenFeedback,
  onOpenIndicators,
  onToggleTradePanel,
}) => {
  return (
    <aside
      className="w-11 bg-[#131722] border-l border-[#2a2e39] flex flex-col items-center py-2 select-none shrink-0 z-10"
      aria-label="TradingView Right Toolbar"
    >
      {/* Top Main Rail Buttons */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1">
        {/* 1. Watchlist & Details (Active by default) */}
        <button
          onClick={onToggleWatchlist}
          className={`w-8 h-8 rounded flex items-center justify-center relative group transition-colors ${
            isWatchlistOpen
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Watchlist & Detail Card"
        >
          <Bookmark size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Watchlist & Details
          </div>
        </button>

        {/* 2. Alerts Drawer */}
        <button
          onClick={onOpenAlerts}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Price Alerts"
        >
          <Bell size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Price Alerts
          </div>
        </button>

        {/* 3. News Headlines */}
        <button
          onClick={() => alert('Celsius News Desk: Aggregating institutional order flow headlines.')}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Market News & Events"
        >
          <Newspaper size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Market News
          </div>
        </button>

        {/* 4. Data Window / Indicators */}
        <button
          onClick={onOpenIndicators}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Data Window & Indicators"
        >
          <BarChart3 size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Indicators & Data Window
          </div>
        </button>

        {/* 5. Hotlists / Movers */}
        <button
          onClick={() => alert('Hotlists: BTC +1.73%, SUI +4.2%, NIFTY -0.76%')}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Hotlists (Volume Movers)"
        >
          <Flame size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Hotlists & Movers
          </div>
        </button>

        {/* 6. Calendar / Macro */}
        <button
          onClick={() => alert('Economic Calendar: US CPI & FOMC Rate decisions scheduled.')}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Economic Calendar"
        >
          <Calendar size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Economic Calendar
          </div>
        </button>

        {/* 7. Community Ideas / Feedback */}
        <button
          onClick={onOpenFeedback}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Community Feedback & Ideas"
        >
          <MessageSquare size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Feedback & Ideas
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="w-6 h-[1px] bg-[#2a2e39] my-2" />

      {/* Bottom Rail Buttons: Trade Panel, Help */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1 mt-auto">
        {onToggleTradePanel && (
          <button
            onClick={onToggleTradePanel}
            className="w-8 h-8 rounded flex items-center justify-center relative group text-[#089981] hover:text-white hover:bg-[#089981]/20 transition-colors"
            title="Toggle Paper Trading Panel"
          >
            <DollarSign size={17} strokeWidth={2} />
            <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Paper Trading Panel
            </div>
          </button>
        )}

        <button
          onClick={() => alert('Celsius Network: The only trading platform that profits from you not losing money.\nVerifiable Cryptographic Ledger • Real Market Data • $10k Starting Capital')}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors"
          title="Help & About Celsius"
        >
          <HelpCircle size={17} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Help & Terminal Guide
          </div>
        </button>
      </div>
    </aside>
  );
};
