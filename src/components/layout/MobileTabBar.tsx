'use client';

import React from 'react';
import {
  BarChart2,
  DollarSign,
  List,
  Wallet,
  ArrowUpDown,
} from 'lucide-react';
import { useTradingStore } from '@/stores/useTradingStore';

interface MobileTabBarProps {
  onToggleWatchlist: () => void;
  onToggleTradePanel: () => void;
  isWatchlistOpen: boolean;
  isTradePanelOpen: boolean;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  onToggleWatchlist,
  onToggleTradePanel,
  isWatchlistOpen,
  isTradePanelOpen,
}) => {
  const {
    account,
    mobileActiveTab,
    setMobileActiveTab,
    isDockCollapsed,
    setDockCollapsed,
    activeBottomTab,
    setActiveBottomTab,
  } = useTradingStore();

  const handleSelectTab = (tab: 'chart' | 'trading' | 'order' | 'watchlist') => {
    setMobileActiveTab(tab);

    if (tab === 'trading') {
      // Ensure trading dock is expanded on mobile
      setDockCollapsed(false);
      setActiveBottomTab('positions');
      // Scroll smoothly to bottom trading panel
      const el = document.getElementById('trading-tab-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'order') {
      if (!isTradePanelOpen) onToggleTradePanel();
    } else if (tab === 'watchlist') {
      if (!isWatchlistOpen) onToggleWatchlist();
    }
  };

  const balanceDisplay = account?.formattedEquity ?? '10,000.00';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-subtle z-30 flex items-center justify-around px-2 select-none shadow-lg shadow-black/40">
      {/* 1. Chart Tab */}
      <button
        type="button"
        onClick={() => handleSelectTab('chart')}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors ${
          mobileActiveTab === 'chart' ? 'text-primary' : 'text-muted hover:text-main'
        }`}
      >
        <BarChart2 size={18} />
        <span className="text-[10px] font-medium">Chart</span>
      </button>

      {/* 2. Trading Tab (Prompt 1 requirement) */}
      <button
        type="button"
        onClick={() => handleSelectTab('trading')}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors relative ${
          mobileActiveTab === 'trading' ? 'text-primary' : 'text-muted hover:text-main'
        }`}
      >
        <ArrowUpDown size={18} className="text-bull" />
        <span className="text-[10px] font-semibold text-main">Trading</span>
        <span className="absolute -top-1 font-mono text-[9px] bg-elevated border border-cardborder px-1 rounded text-bull font-bold">
          ${balanceDisplay}
        </span>
      </button>

      {/* 3. Order / Buy-Sell Panel Tab */}
      <button
        type="button"
        onClick={() => handleSelectTab('order')}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors ${
          mobileActiveTab === 'order' || isTradePanelOpen ? 'text-bull' : 'text-muted hover:text-main'
        }`}
      >
        <DollarSign size={18} />
        <span className="text-[10px] font-medium">Order</span>
      </button>

      {/* 4. Watchlist Tab */}
      <button
        type="button"
        onClick={() => handleSelectTab('watchlist')}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors ${
          mobileActiveTab === 'watchlist' || isWatchlistOpen ? 'text-primary' : 'text-muted hover:text-main'
        }`}
      >
        <List size={18} />
        <span className="text-[10px] font-medium">Markets</span>
      </button>
    </nav>
  );
};
