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
  LayoutGrid,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';

export type RightDockTab =
  | 'watchlist'
  | 'options'
  | 'ai'
  | 'heatmap'
  | 'alerts'
  | 'news'
  | 'data'
  | 'hotlists'
  | 'calendar'
  | 'ideas'
  | 'orders'
  | 'broker'
  | 'help';

interface TradingViewRightRailProps {
  activeTab?: RightDockTab;
  isDockOpen?: boolean;
  onSelectTab?: (tab: RightDockTab) => void;
  // Backward compatibility optional props
  isWatchlistOpen?: boolean;
  onToggleWatchlist?: () => void;
  onOpenAlerts?: () => void;
  onOpenFeedback?: () => void;
  onOpenIndicators?: () => void;
  onToggleTradePanel?: () => void;
}

interface RailItem {
  id: RightDockTab;
  title: string;
  icon: React.ElementType;
  badge?: string;
}

const TOP_ITEMS: RailItem[] = [
  { id: 'watchlist', title: 'Watchlist & Details', icon: Bookmark },
  { id: 'broker', title: 'OpenAlgo Broker Gateway (Zerodha, Upstox, Dhan, Paper)', icon: Server },
  { id: 'options', title: 'OpenBull Option Chain & Greeks', icon: Layers },
  { id: 'ai', title: 'AI Research Desk', icon: Sparkles },
  { id: 'heatmap', title: 'Market Sector Heatmap', icon: LayoutGrid },
  { id: 'alerts', title: 'Price Alerts Manager', icon: Bell },
  { id: 'news', title: 'Market News & Macro Desk', icon: Newspaper },
  { id: 'data', title: 'Data Window & Indicators', icon: BarChart3 },
  { id: 'hotlists', title: 'Hotlists & Market Movers', icon: Flame },
  { id: 'calendar', title: 'Economic & Crypto Calendar', icon: Calendar },
  { id: 'ideas', title: 'Trade Ideas & Journal', icon: MessageSquare },
];

export const TradingViewRightRail: React.FC<TradingViewRightRailProps> = ({
  activeTab = 'watchlist',
  isDockOpen,
  onSelectTab,
  isWatchlistOpen,
  onToggleWatchlist,
  onOpenAlerts,
  onOpenFeedback,
  onOpenIndicators,
  onToggleTradePanel,
}) => {
  const effectiveOpen = isDockOpen !== undefined ? isDockOpen : (isWatchlistOpen ?? true);

  const handleItemClick = (tab: RightDockTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
      return;
    }
    // Backward compat fallback
    if (tab === 'watchlist' && onToggleWatchlist) onToggleWatchlist();
    else if (tab === 'alerts' && onOpenAlerts) onOpenAlerts();
    else if (tab === 'ideas' && onOpenFeedback) onOpenFeedback();
    else if (tab === 'data' && onOpenIndicators) onOpenIndicators();
    else if (tab === 'orders' && onToggleTradePanel) onToggleTradePanel();
  };

  return (
    <aside
      className="w-11 bg-[#131722] border-l border-[#2a2e39] flex flex-col items-center py-2 select-none shrink-0 z-20"
      aria-label="TradingView Right Toolbar"
    >
      {/* Top Main Rail Buttons */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1">
        {TOP_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = effectiveOpen && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all duration-150 ${
                isActive
                  ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/40'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
              title={item.title}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} />

              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute -left-1 top-1.5 bottom-1.5 w-[2px] bg-[#2962ff] rounded-r" />
              )}

              {/* Tooltip on Hover */}
              <div className="absolute right-full mr-2 px-2.5 py-1.5 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded-md shadow-2xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <span className="text-white font-semibold">{item.title}</span>
                <span className="text-[#787b86] text-[10px] block">
                  {isActive ? 'Click to collapse panel' : 'Click to open panel'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-6 h-[1px] bg-[#2a2e39] my-2" />

      {/* Bottom Rail Buttons: Paper Trading & Help */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1 mt-auto">
        {/* Paper Trading Ticket */}
        <button
          onClick={() => handleItemClick('orders')}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all duration-150 ${
            effectiveOpen && activeTab === 'orders'
              ? 'bg-[#1e222d] text-[#089981] ring-1 ring-[#089981]/40'
              : 'text-[#089981] hover:text-white hover:bg-[#089981]/20'
          }`}
          title="Paper Trading Order Ticket"
        >
          <DollarSign size={16} strokeWidth={2} />
          <div className="absolute right-full mr-2 px-2.5 py-1.5 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded-md shadow-2xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <span className="text-white font-semibold">Paper Trading Ticket</span>
            <span className="text-[#787b86] text-[10px] block">Instant Market & Limit Orders</span>
          </div>
        </button>

        {/* Terminal Guide & Help */}
        <button
          onClick={() => handleItemClick('help')}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all duration-150 ${
            effectiveOpen && activeTab === 'help'
              ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/40'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Terminal Guide & Keyboard Shortcuts"
        >
          <HelpCircle size={16} strokeWidth={1.75} />
          <div className="absolute right-full mr-2 px-2.5 py-1.5 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded-md shadow-2xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <span className="text-white font-semibold">Help & Shortcuts</span>
            <span className="text-[#787b86] text-[10px] block">Keyboard shortcuts & Terminal FAQ</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
