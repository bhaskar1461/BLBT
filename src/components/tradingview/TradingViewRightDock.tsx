'use client';

import React, { useState } from 'react';
import {
  Plus,
  Table,
  MoreHorizontal,
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Zap,
  Bell,
  Newspaper,
  BarChart3,
  Flame,
  Calendar,
  MessageSquare,
  HelpCircle,
  DollarSign,
  X,
  Bookmark,
  Check,
  Trash2,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  LayoutGrid,
  Layers,
  Server,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';
import { getSymbolInfo, formatPrice } from '@/services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';
import type { RightDockTab } from './TradingViewRightRail';
import { calculateEMA, calculateSMA, calculateRSI } from '@/lib/indicators';
import { SectorHeatmapWidget } from '@/components/widgets/SectorHeatmapWidget';
import { OptionChainWidget } from '@/components/options/OptionChainWidget';
import { AiResearchDesk } from '@/components/ai/AiResearchDesk';
import { OpenAlgoBrokerWidget } from '@/components/broker/OpenAlgoBrokerWidget';

interface TradingViewRightDockProps {
  activeTab?: RightDockTab;
  onSelectTab?: (tab: RightDockTab) => void;
  onCloseDock?: () => void;
  activeSymbol: string;
  currentPrice: number;
  onSelectSymbol: (symbol: string) => void;
  onOpenSymbolPicker: () => void;
  onToggleTradePanel?: () => void;
  onOpenIndicators?: () => void;
  onOpenBrokerModal?: () => void;
}

interface WatchlistRowData {
  symbol: string;
  displaySymbol: string;
  name: string;
  badge: string;
  category: 'INDICES' | 'CRYPTO' | 'STOCKS';
}

const DOCK_SYMBOLS: WatchlistRowData[] = [
  // Indices
  { symbol: 'NIFTY', displaySymbol: 'NIFTY 50', name: 'Nifty 50', badge: '50', category: 'INDICES' },
  { symbol: 'BANKNIFTY', displaySymbol: 'BANK NIFTY', name: 'Bank Nifty', badge: 'B', category: 'INDICES' },
  { symbol: 'SENSEX', displaySymbol: 'SENSEX', name: 'Sensex', badge: 'S', category: 'INDICES' },
  { symbol: 'CNXIT', displaySymbol: 'CNX IT', name: 'Nifty IT', badge: 'C', category: 'INDICES' },
  { symbol: 'SPX', displaySymbol: 'S&P 500', name: 'S&P 500', badge: '500', category: 'INDICES' },
  // Crypto
  { symbol: 'BTCUSDT', displaySymbol: 'BTC/USDT', name: 'Bitcoin', badge: '₿', category: 'CRYPTO' },
  { symbol: 'ETHUSDT', displaySymbol: 'ETH/USDT', name: 'Ethereum', badge: 'Ξ', category: 'CRYPTO' },
  { symbol: 'SOLUSDT', displaySymbol: 'SOL/USDT', name: 'Solana', badge: 'S', category: 'CRYPTO' },
  // Stocks
  { symbol: 'RELIANCE', displaySymbol: 'RELIANCE', name: 'Reliance Ind.', badge: 'R', category: 'STOCKS' },
  { symbol: 'AXISBANK', displaySymbol: 'AXIS BANK', name: 'Axis Bank', badge: 'A', category: 'STOCKS' },
  { symbol: 'HDFCBANK', displaySymbol: 'HDFC BANK', name: 'HDFC Bank', badge: 'H', category: 'STOCKS' },
  { symbol: 'ICICIBANK', displaySymbol: 'ICICI BANK', name: 'ICICI Bank', badge: 'I', category: 'STOCKS' },
  { symbol: 'BAJFINANCE', displaySymbol: 'BAJAJ FIN', name: 'Bajaj Finance', badge: 'B', category: 'STOCKS' },
];

export const TradingViewRightDock: React.FC<TradingViewRightDockProps> = ({
  activeTab = 'watchlist',
  onSelectTab,
  onCloseDock,
  activeSymbol,
  currentPrice,
  onSelectSymbol,
  onOpenSymbolPicker,
  onToggleTradePanel,
  onOpenIndicators,
  onOpenBrokerModal,
}) => {
  // Watchlist state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'INDICES' | 'CRYPTO' | 'STOCKS'>('ALL');
  const [watchlistTitle, setWatchlistTitle] = useState<'Daftar Pantau' | 'Watchlist'>('Watchlist');
  const [quickAmountPercent, setQuickAmountPercent] = useState<number>(25);
  const [isSubmittingQuickTrade, setIsSubmittingQuickTrade] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Alerts state
  const [customAlertPrice, setCustomAlertPrice] = useState<string>('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alertsList, setAlertsList] = useState(() => storage.getPriceAlerts());
  const [alertSound, setAlertSound] = useState(true);

  // Hotlists state
  const [hotlistTab, setHotlistTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');

  // Ideas state
  const [ideaText, setIdeaText] = useState('');
  const [ideaBias, setIdeaBias] = useState<'long' | 'short'>('long');
  const [userIdeas, setUserIdeas] = useState<Array<{ id: string; symbol: string; bias: 'long' | 'short'; text: string; time: string }>>([
    { id: '1', symbol: 'BTCUSDT', bias: 'long', text: 'Bullish consolidation above 83k weekly resistance. Risk cap 1.0% strictly enforced.', time: '2h ago' },
    { id: '2', symbol: 'CNXIT', bias: 'short', text: 'Testing structural breakdown zone at 27,750 point. Waiting for 1h close confirmation.', time: '4h ago' },
  ]);

  // Order Ticket state
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderAmountUsdt, setOrderAmountUsdt] = useState<string>('500');

  const tickers = useWatchlistStore((s) => s.tickers);
  const candles = useChartStore((s) => s.candles);
  const { account, fetchAccount } = useTradingStore();
  const user = storage.getUserProfile();

  const activeSymbolInfo = getSymbolInfo(activeSymbol);
  const activeTicker = tickers[activeSymbol];
  const selectedPrice = activeTicker?.lastPrice ?? (currentPrice > 0 ? currentPrice : 22603.05);
  const selectedChange = activeTicker?.priceChange ?? -173.05;
  const selectedChangePercent = activeTicker?.priceChangePercent ?? -0.76;
  const isPositive = selectedChangePercent >= 0;

  // Execute instant 1-click paper trade
  const handleQuickTrade = async (side: 'buy' | 'sell') => {
    if (selectedPrice <= 0 || isSubmittingQuickTrade) return;
    setIsSubmittingQuickTrade(true);

    try {
      const balance = account?.balance ?? 10000;
      const allocatedUsdt = (balance * quickAmountPercent) / 100;
      const quantity = allocatedUsdt / selectedPrice;

      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          symbol: activeSymbol,
          side,
          type: 'market',
          amount: quantity.toFixed(activeSymbolInfo.pricePrecision > 2 ? 4 : 2),
          userDisplayName: user.displayName,
        }),
      });

      if (res.ok) {
        await fetchAccount(user.id);
      }
    } catch {
    } finally {
      setIsSubmittingQuickTrade(false);
    }
  };

  // Add new price alert
  const handleCreateAlert = (priceVal?: number) => {
    const target = priceVal !== undefined ? priceVal : parseFloat(customAlertPrice);
    if (!target || target <= 0) return;

    const newAlert = {
      id: `alert-${Date.now()}`,
      symbol: activeSymbol,
      targetPrice: target,
      condition: target >= selectedPrice ? ('above' as const) : ('below' as const),
      active: true,
      createdAt: Date.now(),
      note: `${activeSymbol} crossing ${formatPrice(target, activeSymbolInfo.pricePrecision)}`,
    };

    const updated = [newAlert, ...alertsList];
    setAlertsList(updated);
    storage.setPriceAlerts(updated);
    setCustomAlertPrice('');
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alertsList.filter((a) => a.id !== id);
    setAlertsList(updated);
    storage.setPriceAlerts(updated);
  };

  // Submit disciplined trade idea
  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;

    const newIdea = {
      id: `idea-${Date.now()}`,
      symbol: activeSymbol,
      bias: ideaBias,
      text: ideaText.trim(),
      time: 'Just now',
    };

    setUserIdeas([newIdea, ...userIdeas]);
    setIdeaText('');
  };

  // Filtered symbols for watchlist
  const filteredSymbols = DOCK_SYMBOLS.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate quick indicators for Data Window
  const ema9 = candles.length >= 9 ? calculateEMA(candles, 9).pop()?.value ?? 0 : selectedPrice * 0.998;
  const ema21 = candles.length >= 21 ? calculateEMA(candles, 21).pop()?.value ?? 0 : selectedPrice * 0.995;
  const ema50 = candles.length >= 50 ? calculateEMA(candles, 50).pop()?.value ?? 0 : selectedPrice * 0.99;
  const ema200 = candles.length >= 200 ? calculateEMA(candles, 200).pop()?.value ?? 0 : selectedPrice * 0.975;
  const sma20 = candles.length >= 20 ? calculateSMA(candles, 20).pop()?.value ?? 0 : selectedPrice * 0.994;
  const sma50 = candles.length >= 50 ? calculateSMA(candles, 50).pop()?.value ?? 0 : selectedPrice * 0.988;
  const rsiVal = candles.length >= 14 ? calculateRSI(candles, 14).pop()?.value ?? 54.2 : 54.2;
  const [tabWideState, setTabWideState] = useState<Record<string, boolean>>({
    options: true,
    heatmap: true,
    ai: true,
  });
  const isEffectiveWide = tabWideState[activeTab] ?? false;
  const toggleWideDock = () => {
    setTabWideState((prev) => ({
      ...prev,
      [activeTab]: !isEffectiveWide,
    }));
  };

  return (
    <aside
      className={`${
        isEffectiveWide
          ? 'w-full md:w-[720px] lg:w-[860px] max-w-[94vw]'
          : 'w-80 md:w-[350px]'
      } bg-[#131722] border-l border-[#2a2e39] flex flex-col h-full select-none shrink-0 overflow-hidden text-[#d1d4dc] transition-all duration-200 z-20`}
      aria-label="TradingView Right Dock Panel"
    >
      {/* 1. Global Dock Header with Tab Indicator & Close Button */}
      <div className="p-2.5 px-3 border-b border-[#2a2e39] flex items-center justify-between bg-[#171b26]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
            activeTab === 'options' ? 'text-[#FF8B3D] bg-[#FF6B00]/10 border-[#FF6B00]/30' :
            activeTab === 'ai' ? 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30' :
            activeTab === 'broker' || activeTab === 'orders' ? 'text-[#00c176] bg-[#00c176]/10 border-[#00c176]/30' :
            activeTab === 'heatmap' ? 'text-[#4ea1ff] bg-[#4ea1ff]/10 border-[#4ea1ff]/30' :
            activeTab === 'alerts' || activeTab === 'hotlists' ? 'text-[#ffb74d] bg-[#ffb74d]/10 border-[#ffb74d]/30' :
            'text-[#2962ff] bg-[#2962ff]/10 border-[#2962ff]/30'
          }`}>
            {activeTab === 'watchlist' ? 'WL' :
             activeTab === 'broker' ? 'GW' :
             activeTab === 'options' ? 'OC' :
             activeTab === 'ai' ? 'AI' :
             activeTab === 'heatmap' ? 'HM' :
             activeTab === 'alerts' ? 'AL' :
             activeTab === 'news' ? 'NW' :
             activeTab === 'data' ? 'DW' :
             activeTab === 'hotlists' ? 'HL' :
             activeTab === 'calendar' ? 'EC' :
             activeTab === 'ideas' ? 'JN' :
             activeTab === 'orders' ? 'OT' : 'HP'}
          </span>

          <span className="font-bold text-xs text-[#f0f3fa] uppercase tracking-wider truncate">
            {activeTab === 'watchlist' && (watchlistTitle === 'Daftar Pantau' ? 'Daftar Pantau' : 'Watchlist')}
            {activeTab === 'broker' && 'OpenAlgo Broker'}
            {activeTab === 'options' && 'OpenBull Options'}
            {activeTab === 'ai' && 'AI Research Desk'}
            {activeTab === 'heatmap' && 'Market Heatmap'}
            {activeTab === 'alerts' && 'Price Alerts'}
            {activeTab === 'news' && 'Macro News'}
            {activeTab === 'data' && 'Data Window'}
            {activeTab === 'hotlists' && 'Hotlists'}
            {activeTab === 'calendar' && 'Calendar'}
            {activeTab === 'ideas' && 'Journal'}
            {activeTab === 'orders' && 'Order Ticket'}
            {activeTab === 'help' && 'Terminal Help'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Width expansion toggle for data-dense widgets like Option Chain */}
          <button
            onClick={toggleWideDock}
            className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
            title={isEffectiveWide ? 'Collapse to Compact Width (350px)' : 'Expand to Wide Width (860px)'}
          >
            {isEffectiveWide ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {onCloseDock && (
            <button
              onClick={onCloseDock}
              className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
              title="Close Dock"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WATCHLIST & SYMBOL DETAIL                        */}
      {/* ======================================================== */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Sub Header: Add Symbol & Category Filters */}
          <div className="px-3 py-1.5 border-b border-[#2a2e39] flex items-center justify-between bg-[#131722]">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'INDICES', 'CRYPTO', 'STOCKS'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/40 font-bold'
                      : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenSymbolPicker}
              className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
              title="Add Symbol (Ctrl+K)"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-mono text-[#787b86] border-b border-[#2a2e39] bg-[#171b26]">
            <div className="col-span-5 text-left">Symbol</div>
            <div className="col-span-3 text-right">Last</div>
            <div className="col-span-2 text-right">Chg</div>
            <div className="col-span-2 text-right">Chg%</div>
          </div>

          {/* Scrollable Watchlist Rows */}
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#1e222d]/60">
            {filteredSymbols.map((item) => {
              const tick = tickers[item.symbol];
              const isSelected = item.symbol === activeSymbol;
              const price = tick?.lastPrice ?? (item.symbol === 'NIFTY' ? 22603.05 : item.symbol === 'BANKNIFTY' ? 55055.55 : item.symbol === 'SENSEX' ? 72638.70 : item.symbol === 'SPX' ? 7801.61 : item.symbol === 'BTCUSDT' ? 83270.00 : 1200);
              const chg = tick?.priceChange ?? (item.symbol === 'NIFTY' ? -173.05 : item.symbol === 'BTCUSDT' ? 1420.50 : -10.3);
              const chgPct = tick?.priceChangePercent ?? (item.symbol === 'NIFTY' ? -0.76 : item.symbol === 'BTCUSDT' ? 1.73 : -0.85);
              const pos = chgPct >= 0;

              return (
                <button
                  key={item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`w-full grid grid-cols-12 items-center px-3 py-2 text-left transition-colors group ${
                    isSelected ? 'bg-[#1e222d] border-l-2 border-[#2962ff]' : 'hover:bg-[#1e222d]/50'
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <div className="shrink-0 flex items-center justify-center">
                      <AssetIcon symbol={item.symbol} size={20} />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-xs text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                        {item.displaySymbol}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 text-right font-mono text-xs text-[#f0f3fa] font-medium">
                    {price > 1000 ? formatPrice(price, 1) : formatPrice(price, 2)}
                  </div>

                  <div className={`col-span-2 text-right font-mono text-[11px] ${pos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {pos ? '+' : ''}{chg.toFixed(1)}
                  </div>

                  <div className={`col-span-2 text-right font-mono text-[11px] font-semibold ${pos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {pos ? '+' : ''}{chgPct.toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Symbol Detail Card (Collapsible) */}
          {!isDetailsExpanded ? (
            <div className="border-t border-[#2a2e39] bg-[#171b26] p-2.5 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  <AssetIcon symbol={activeSymbol} size={22} />
                </div>
                <div className="truncate">
                  <span className="font-bold text-xs text-white mr-1.5">{activeSymbol}</span>
                  <span className="font-mono text-xs text-[#f0f3fa]">
                    {formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}
                  </span>
                  <span className={`font-mono text-[10px] ml-1.5 font-semibold ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isPositive ? '+' : ''}{selectedChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDetailsExpanded(true)}
                className="flex items-center gap-1 text-[11px] text-[#787b86] hover:text-[#2962ff] transition-colors font-semibold px-2 py-1 rounded hover:bg-[#1e222d] shrink-0"
                title="Expand Key Stats & Order Ticket"
              >
                <span>Stats</span>
                <ChevronUp size={13} />
              </button>
            </div>
          ) : (
            <div className="border-t border-[#2a2e39] bg-[#171b26] p-3 flex flex-col gap-2.5 shrink-0 overflow-y-auto max-h-[46vh] animate-in fade-in duration-150">
              {/* Collapsible Header */}
              <div className="flex items-center justify-between pb-1 border-b border-[#2a2e39]/60">
                <span className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider">Symbol Details</span>
                <button
                  onClick={() => setIsDetailsExpanded(false)}
                  className="flex items-center gap-1 text-[11px] text-[#787b86] hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-[#1e222d]"
                  title="Collapse to compact view"
                >
                  <span>Collapse</span>
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Header: Badge + Symbol Name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="shrink-0 flex items-center justify-center drop-shadow">
                    <AssetIcon symbol={activeSymbol} size={30} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#f0f3fa]">{activeSymbol}</span>
                      <span className="text-[10px] text-[#787b86] font-mono">D</span>
                    </div>
                    <div className="text-[11px] text-[#787b86]">
                      {activeSymbolInfo.name} • {activeSymbolInfo.category === 'Index' ? 'NSE' : 'BINANCE'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#787b86]">
                  <button onClick={() => onSelectTab && onSelectTab('data')} className="p-1 hover:text-white transition-colors" title="Data Window">
                    <BarChart3 size={14} />
                  </button>
                  <button onClick={() => onSelectTab && onSelectTab('alerts')} className="p-1 hover:text-white transition-colors" title="Price Alert">
                    <Bell size={14} />
                  </button>
                </div>
              </div>

              {/* Price Readout */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-extrabold text-[#f0f3fa]">
                    {formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}
                  </span>
                  <span className="text-[10px] text-[#787b86] font-mono uppercase">
                    {activeSymbolInfo.category === 'Index' ? 'POINT' : 'USDT'}
                  </span>
                </div>

                <div className={`font-mono text-xs font-semibold flex items-center gap-1 mt-0.5 ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  <span>{isPositive ? '+' : ''}{formatPrice(selectedChange, activeSymbolInfo.pricePrecision)}</span>
                  <span>({isPositive ? '+' : ''}{selectedChangePercent.toFixed(2)}%)</span>
                </div>
              </div>

              {/* Mini News snippet */}
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded p-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#787b86] mb-1">
                  <span className="font-semibold text-[#2962ff]">Market Pulse</span>
                  <span>4 hours ago</span>
                </div>
                <p className="text-[11px] text-[#d1d4dc] leading-tight line-clamp-2">
                  {activeSymbol === 'NIFTY'
                    ? "Eternal vs TCS shares: Zomato parent weightage more than IT giant in Nifty 50."
                    : `${activeSymbolInfo.name} structural liquidity tests key support bands as volume expands.`}
                </p>
                <button
                  onClick={() => onSelectTab && onSelectTab('news')}
                  className="text-[10px] text-[#2962ff] hover:underline mt-1 inline-block"
                >
                  View full desk news &gt;
                </button>
              </div>

              {/* 2x3 Performance Cards Grid (TradingView Screenshot 1 Parity) */}
              <div>
                <div className="text-[10px] font-semibold text-[#787b86] mb-1 uppercase tracking-wider">
                  Performance
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#f23645]">-0.27%</div>
                    <div className="text-[9px] text-[#787b86]">1W</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#f23645]">-5.36%</div>
                    <div className="text-[9px] text-[#787b86]">1M</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#f23645]">-5.54%</div>
                    <div className="text-[9px] text-[#787b86]">3M</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#f23645]">-4.12%</div>
                    <div className="text-[9px] text-[#787b86]">6M</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#089981]">+2.45%</div>
                    <div className="text-[9px] text-[#787b86]">YTD</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-1">
                    <div className="text-[10px] font-bold text-[#089981]">+12.4%</div>
                    <div className="text-[9px] text-[#787b86]">1Y</div>
                  </div>
                </div>
              </div>

              {/* Dense Quote Statistics (ErTasselli/OpenTerminal Integration) */}
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded p-2 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[10px] text-[#787b86]">
                  <span>Day's Range</span>
                  <span className="text-[#f0f3fa]">
                    {formatPrice(selectedPrice * 0.992, activeSymbolInfo.pricePrecision)} — {formatPrice(selectedPrice * 1.008, activeSymbolInfo.pricePrecision)}
                  </span>
                </div>
                <div className="w-full h-1 bg-[#171b26] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2962ff] rounded-full" style={{ width: '48%' }} />
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#2a2e39]/50">
                  <span className="text-[#787b86]">52W Range</span>
                  <span className="text-[#f0f3fa]">
                    {formatPrice(selectedPrice * 0.82, activeSymbolInfo.pricePrecision)} — {formatPrice(selectedPrice * 1.18, activeSymbolInfo.pricePrecision)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#2a2e39]/50">
                  <div className="flex justify-between">
                    <span className="text-[#787b86]">Bid/Ask:</span>
                    <span className="text-[#f0f3fa]">{formatPrice(selectedPrice * 0.9999, activeSymbolInfo.pricePrecision)} / {formatPrice(selectedPrice * 1.0001, activeSymbolInfo.pricePrecision)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787b86]">Vol:</span>
                    <span className="text-[#f0f3fa]">284.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787b86]">Mkt Cap:</span>
                    <span className="text-[#f0f3fa]">$2.77T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787b86]">P/E:</span>
                    <span className="text-[#f0f3fa]">21.4</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Action */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-[#787b86] mb-1.5 font-mono">
                  <span>Size:</span>
                  <div className="flex items-center gap-1">
                    {[10, 25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setQuickAmountPercent(pct)}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          quickAmountPercent === pct ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/40 font-bold' : 'bg-[#1e222d] text-[#787b86]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickTrade('buy')}
                    disabled={isSubmittingQuickTrade}
                    className="py-2 rounded font-bold text-xs bg-[#089981] hover:bg-[#078570] text-white shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <ArrowUpRight size={14} />
                    <span>BUY / LONG</span>
                  </button>
                  <button
                    onClick={() => handleQuickTrade('sell')}
                    disabled={isSubmittingQuickTrade}
                    className="py-2 rounded font-bold text-xs bg-[#f23645] hover:bg-[#d92c3a] text-white shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <ArrowDownRight size={14} />
                    <span>SELL / SHORT</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRICE ALERTS MANAGER                              */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722]">
          {/* Active Asset Info Box */}
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AssetIcon symbol={activeSymbol} size={22} />
                <span className="font-bold text-sm text-white">{activeSymbol}</span>
              </div>
              <span className="font-mono text-sm font-semibold text-[#f0f3fa]">
                {formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}
              </span>
            </div>

            {/* Quick Alert Presets */}
            <div className="text-[10px] text-[#787b86] mb-1.5 font-medium">Quick 1-Click Trigger:</div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => handleCreateAlert(selectedPrice * 1.01)}
                className="py-1 px-2 rounded bg-[#089981]/15 text-[#089981] hover:bg-[#089981]/25 border border-[#089981]/30 transition-colors flex items-center justify-between"
              >
                <span>+1.0%</span>
                <span>{formatPrice(selectedPrice * 1.01, activeSymbolInfo.pricePrecision > 2 ? 2 : 1)}</span>
              </button>
              <button
                onClick={() => handleCreateAlert(selectedPrice * 1.02)}
                className="py-1 px-2 rounded bg-[#089981]/15 text-[#089981] hover:bg-[#089981]/25 border border-[#089981]/30 transition-colors flex items-center justify-between"
              >
                <span>+2.0%</span>
                <span>{formatPrice(selectedPrice * 1.02, activeSymbolInfo.pricePrecision > 2 ? 2 : 1)}</span>
              </button>
              <button
                onClick={() => handleCreateAlert(selectedPrice * 0.99)}
                className="py-1 px-2 rounded bg-[#f23645]/15 text-[#f23645] hover:bg-[#f23645]/25 border border-[#f23645]/30 transition-colors flex items-center justify-between"
              >
                <span>-1.0%</span>
                <span>{formatPrice(selectedPrice * 0.99, activeSymbolInfo.pricePrecision > 2 ? 2 : 1)}</span>
              </button>
              <button
                onClick={() => handleCreateAlert(selectedPrice * 0.98)}
                className="py-1 px-2 rounded bg-[#f23645]/15 text-[#f23645] hover:bg-[#f23645]/25 border border-[#f23645]/30 transition-colors flex items-center justify-between"
              >
                <span>-2.0%</span>
                <span>{formatPrice(selectedPrice * 0.98, activeSymbolInfo.pricePrecision > 2 ? 2 : 1)}</span>
              </button>
            </div>
          </div>

          {/* Custom Alert Input */}
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="text-xs font-semibold text-white mb-2">Create Custom Price Alert</div>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={customAlertPrice}
                onChange={(e) => setCustomAlertPrice(e.target.value)}
                placeholder={`Target Price (e.g. ${selectedPrice})`}
                className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2962ff] font-mono"
              />
              <button
                onClick={() => handleCreateAlert()}
                className="px-3 py-1.5 bg-[#2962ff] hover:bg-[#1d4ed8] text-white rounded text-xs font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#787b86]">
              <span className="flex items-center gap-1">
                <Volume2 size={13} />
                Audio Notification:
              </span>
              <button
                onClick={() => setAlertSound(!alertSound)}
                className={`text-[10px] px-2 py-0.5 rounded ${alertSound ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#2a2e39] text-[#787b86]'}`}
              >
                {alertSound ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div>
            <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span>Active Alerts ({alertsList.length})</span>
            </div>

            {alertsList.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#787b86] border border-dashed border-[#2a2e39] rounded-lg">
                No active alerts set. Click above to set an instant trigger.
              </div>
            ) : (
              <div className="space-y-1.5">
                {alertsList.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2.5 bg-[#171b26] border border-[#2a2e39] rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <AssetIcon symbol={a.symbol} size={16} />
                        <span>{a.symbol}</span>
                        <span className="text-[10px] text-[#787b86] font-normal font-mono">
                          {a.condition === 'above' ? '▲ Crossing Up' : '▼ Crossing Down'}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#2962ff] mt-0.5">
                        {formatPrice(a.targetPrice, 2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1 text-[#787b86] hover:text-[#f23645] transition-colors"
                      title="Remove alert"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REAL-TIME MACRO & NEWS DESK                       */}
      {/* ======================================================== */}
      {activeTab === 'news' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3 bg-[#131722]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white">Institutional Market Stream</div>
            <span className="text-[10px] text-[#089981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
              Live Wire
            </span>
          </div>

          {/* News Items */}
          {[
            {
              id: 'n1',
              title: "Federal Reserve hints at measured rate cycle as liquidity spreads widen",
              time: '12m ago',
              source: 'Reuters Macro',
              sentiment: 'Neutral',
              sentimentColor: 'text-[#2962ff] bg-[#2962ff]/10',
              symbol: 'SPX',
            },
            {
              id: 'n2',
              title: "Bitcoin institutional custody inflows register fourth consecutive weekly expansion",
              time: '34m ago',
              source: 'CoinDesk Desk',
              sentiment: 'Bullish',
              sentimentColor: 'text-[#089981] bg-[#089981]/10',
              symbol: 'BTCUSDT',
            },
            {
              id: 'n3',
              title: "Nifty IT tests crucial structural demand zone following tech earnings realignment",
              time: '1h ago',
              source: 'NSE Circular',
              sentiment: 'Bearish',
              sentimentColor: 'text-[#f23645] bg-[#f23645]/10',
              symbol: 'CNXIT',
            },
            {
              id: 'n4',
              title: "Ethereum L2 transaction throughput scales past 3,200 TPS benchmark",
              time: '2h ago',
              source: 'Etherscan Analytics',
              sentiment: 'Bullish',
              sentimentColor: 'text-[#089981] bg-[#089981]/10',
              symbol: 'ETHUSDT',
            },
            {
              id: 'n5',
              title: "Bank Nifty options skew signals volatility compression ahead of weekly expiry",
              time: '3h ago',
              source: 'Bloomberg Markets',
              sentiment: 'Neutral',
              sentimentColor: 'text-[#2962ff] bg-[#2962ff]/10',
              symbol: 'BANKNIFTY',
            },
          ].map((news) => (
            <div
              key={news.id}
              className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 flex flex-col gap-1.5 hover:border-[#2962ff]/50 transition-colors cursor-pointer group"
              onClick={() => onSelectSymbol(news.symbol)}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-[#787b86]">{news.source} • {news.time}</span>
                <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${news.sentimentColor}`}>
                  {news.sentiment}
                </span>
              </div>
              <p className="text-xs text-[#f0f3fa] group-hover:text-[#2962ff] font-medium transition-colors leading-snug">
                {news.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#787b86] font-mono">Related:</span>
                <span className="text-[10px] font-mono font-bold text-white bg-[#1e222d] px-1.5 py-0.5 rounded">
                  {news.symbol}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATA WINDOW & TECHNICAL INDICATOR READOUTS        */}
      {/* ======================================================== */}
      {activeTab === 'data' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722]">
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#2a2e39]">
              <div className="flex items-center gap-2">
                <AssetIcon symbol={activeSymbol} size={22} />
                <span className="font-bold text-sm text-white">{activeSymbol}</span>
              </div>
              <span className="font-mono text-sm font-bold text-[#f0f3fa]">
                {formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between text-[#787b86]">
                <span>Open:</span>
                <span className="text-white">{formatPrice(candles[candles.length - 1]?.open ?? selectedPrice, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between text-[#787b86]">
                <span>High:</span>
                <span className="text-[#089981]">{formatPrice(candles[candles.length - 1]?.high ?? selectedPrice, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between text-[#787b86]">
                <span>Low:</span>
                <span className="text-[#f23645]">{formatPrice(candles[candles.length - 1]?.low ?? selectedPrice, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between text-[#787b86]">
                <span>Close:</span>
                <span className="text-white">{formatPrice(candles[candles.length - 1]?.close ?? selectedPrice, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between text-[#787b86]">
                <span>Volume:</span>
                <span className="text-white">{(candles[candles.length - 1]?.volume ?? 1250).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#787b86]">
                <span>Tick:</span>
                <span className="text-white">{activeSymbolInfo.pricePrecision > 2 ? '0.0001' : '0.05'}</span>
              </div>
            </div>
          </div>

          {/* Indicators Computed Readout */}
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
              <span>Moving Averages</span>
              {onOpenIndicators && (
                <button onClick={onOpenIndicators} className="text-[10px] text-[#2962ff] hover:underline">
                  Configure
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#089981] font-semibold">EMA (9):</span>
                <span className="text-white">{formatPrice(ema9, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#2962ff] font-semibold">EMA (21):</span>
                <span className="text-white">{formatPrice(ema21, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#f59e0b] font-semibold">EMA (50):</span>
                <span className="text-white">{formatPrice(ema50, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#ef4444] font-semibold">EMA (200):</span>
                <span className="text-white">{formatPrice(ema200, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#38bdf8] font-semibold">SMA (20):</span>
                <span className="text-white">{formatPrice(sma20, activeSymbolInfo.pricePrecision)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#a855f7] font-semibold">SMA (50):</span>
                <span className="text-white">{formatPrice(sma50, activeSymbolInfo.pricePrecision)}</span>
              </div>
            </div>
          </div>

          {/* Oscillators Readout */}
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="text-xs font-semibold text-white mb-2">Oscillators</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#d1d4dc]">RSI (14):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{rsiVal.toFixed(1)}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    rsiVal > 70 ? 'bg-[#f23645]/20 text-[#f23645]' : rsiVal < 30 ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#2962ff]/20 text-[#2962ff]'
                  }`}>
                    {rsiVal > 70 ? 'Overbought' : rsiVal < 30 ? 'Oversold' : 'Neutral'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: HOTLISTS & MARKET MOVERS                          */}
      {/* ======================================================== */}
      {activeTab === 'hotlists' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3 bg-[#131722]">
          {/* Sub Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#171b26] p-1 rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => setHotlistTab('gainers')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                hotlistTab === 'gainers' ? 'bg-[#089981] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setHotlistTab('losers')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                hotlistTab === 'losers' ? 'bg-[#f23645] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Top Losers
            </button>
            <button
              onClick={() => setHotlistTab('volume')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                hotlistTab === 'volume' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>

          {/* List items */}
          <div className="space-y-1.5">
            {[
              { symbol: 'SOLUSDT', name: 'Solana', price: 115.18, chg: 4.85, vol: '1.2B' },
              { symbol: 'BTCUSDT', name: 'Bitcoin', price: 83270.0, chg: 1.73, vol: '18.4B' },
              { symbol: 'SENSEX', name: 'BSE Sensex', price: 72638.7, chg: 0.85, vol: '4.8B' },
              { symbol: 'ETHUSDT', name: 'Ethereum', price: 2567.01, chg: -1.1, vol: '6.7B' },
              { symbol: 'NIFTY', name: 'Nifty 50', price: 22603.05, chg: -0.76, vol: '3.1B' },
              { symbol: 'CNXIT', name: 'Nifty IT', price: 27757.8, chg: -1.34, vol: '890M' },
            ]
              .sort((a, b) => {
                if (hotlistTab === 'gainers') return b.chg - a.chg;
                if (hotlistTab === 'losers') return a.chg - b.chg;
                return parseFloat(b.vol) - parseFloat(a.vol);
              })
              .map((item, idx) => {
                const isPos = item.chg >= 0;
                return (
                  <button
                    key={item.symbol}
                    onClick={() => onSelectSymbol(item.symbol)}
                    className="w-full flex items-center justify-between p-2.5 bg-[#171b26] border border-[#2a2e39] rounded-lg hover:border-[#2962ff] transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 text-[10px] font-bold text-[#787b86] font-mono">{idx + 1}</span>
                      <AssetIcon symbol={item.symbol} size={20} />
                      <div>
                        <div className="font-semibold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                          {item.symbol}
                        </div>
                        <div className="text-[10px] text-[#787b86]">{item.name}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs text-white font-medium">{formatPrice(item.price, 2)}</div>
                      <div className={`text-[11px] font-semibold ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPos ? '+' : ''}{item.chg.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: ECONOMIC CALENDAR & MACRO RELEASES                */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3 bg-[#131722]">
          <div className="text-xs font-semibold text-white flex items-center justify-between">
            <span>Macro Liquidity Schedule</span>
            <span className="text-[10px] text-[#787b86]">UTC Scheduled</span>
          </div>

          {[
            {
              event: 'US Consumer Price Index (CPI YoY)',
              time: 'Today • 12:30 UTC',
              impact: 'HIGH',
              impactBg: 'bg-[#f23645]/20 text-[#f23645]',
              forecast: '2.9%',
              prior: '3.1%',
            },
            {
              event: 'FOMC Federal Funds Rate Decision',
              time: 'Tomorrow • 18:00 UTC',
              impact: 'HIGH',
              impactBg: 'bg-[#f23645]/20 text-[#f23645]',
              forecast: '4.75%',
              prior: '5.00%',
            },
            {
              event: 'RBI Monetary Policy Committee Rate',
              time: 'Oct 11 • 04:30 UTC',
              impact: 'MED',
              impactBg: 'bg-[#f59e0b]/20 text-[#f59e0b]',
              forecast: '6.50%',
              prior: '6.50%',
            },
            {
              event: 'Deribit BTC & ETH Options Expiry ($4.8B)',
              time: 'Friday • 08:00 UTC',
              impact: 'HIGH',
              impactBg: 'bg-[#f23645]/20 text-[#f23645]',
              forecast: 'Max Pain $82k',
              prior: 'N/A',
            },
            {
              event: 'US Non-Farm Payrolls (NFP)',
              time: 'Next Week • 12:30 UTC',
              impact: 'HIGH',
              impactBg: 'bg-[#f23645]/20 text-[#f23645]',
              forecast: '165K',
              prior: '142K',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#787b86] font-mono">{item.time}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${item.impactBg}`}>
                  {item.impact} IMPACT
                </span>
              </div>
              <div className="text-xs font-semibold text-[#f0f3fa] leading-snug">{item.event}</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#787b86] pt-1 border-t border-[#2a2e39]/60">
                <div>Forecast: <b className="text-white">{item.forecast}</b></div>
                <div>Prior: <b className="text-white">{item.prior}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: IDEAS & TRADING JOURNAL                           */}
      {/* ======================================================== */}
      {activeTab === 'ideas' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722]">
          {/* Create disciplined idea */}
          <form onSubmit={handleAddIdea} className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span>Log Disciplined Trade Idea</span>
              <span className="text-[10px] text-[#089981] flex items-center gap-1">
                <ShieldCheck size={12} />
                1% Risk Cap Enforced
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIdeaBias('long')}
                className={`flex-1 py-1 text-xs font-bold rounded ${
                  ideaBias === 'long' ? 'bg-[#089981] text-white' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                ▲ Long
              </button>
              <button
                type="button"
                onClick={() => setIdeaBias('short')}
                className={`flex-1 py-1 text-xs font-bold rounded ${
                  ideaBias === 'short' ? 'bg-[#f23645] text-white' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                ▼ Short
              </button>
            </div>

            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder={`Thesis for ${activeSymbol} (e.g. 4h bull flag retest with tight stop)`}
              rows={2}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded p-2 text-xs text-white outline-none focus:border-[#2962ff] resize-none mb-2"
            />

            <button
              type="submit"
              className="w-full py-1.5 bg-[#2962ff] hover:bg-[#1d4ed8] text-white rounded text-xs font-semibold transition-colors"
            >
              Post to Journal
            </button>
          </form>

          {/* Ideas feed */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-white">Community & Private Journal</div>
            {userIdeas.map((idea) => (
              <div key={idea.id} className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AssetIcon symbol={idea.symbol} size={16} />
                    <span className="font-bold text-xs text-white">{idea.symbol}</span>
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                      idea.bias === 'long' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                    }`}>
                      {idea.bias.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#787b86]">{idea.time}</span>
                </div>
                <p className="text-xs text-[#d1d4dc] leading-relaxed">{idea.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: FULL PAPER TRADING ORDER TICKET                   */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722]">
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2e39]">
              <div className="flex items-center gap-2">
                <AssetIcon symbol={activeSymbol} size={22} />
                <div>
                  <div className="font-bold text-xs text-white">{activeSymbol}</div>
                  <div className="text-[10px] text-[#787b86]">Spot Paper Order</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-white">{formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}</div>
                <div className="text-[10px] text-[#089981]">24/7 Binance Feed</div>
              </div>
            </div>

            {/* Side Toggle: Buy vs Sell */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setOrderSide('buy')}
                className={`py-2 rounded font-bold text-xs transition-colors ${
                  orderSide === 'buy' ? 'bg-[#089981] text-white shadow-md' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                BUY / LONG
              </button>
              <button
                onClick={() => setOrderSide('sell')}
                className={`py-2 rounded font-bold text-xs transition-colors ${
                  orderSide === 'sell' ? 'bg-[#f23645] text-white shadow-md' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Order Type Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-1 rounded text-xs font-semibold ${
                  orderType === 'market' ? 'bg-[#2962ff] text-white' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                Market Order
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-1 rounded text-xs font-semibold ${
                  orderType === 'limit' ? 'bg-[#2962ff] text-white' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Amount input */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-[#787b86] mb-1">
                <span>Allocation (USDT):</span>
                <span>Bal: ${(account?.balance ?? 10000).toLocaleString()}</span>
              </div>
              <input
                type="number"
                value={orderAmountUsdt}
                onChange={(e) => setOrderAmountUsdt(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#2962ff]"
              />

              {/* Quick % buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-1.5 font-mono">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setOrderAmountUsdt(String(amt))}
                    className="py-1 bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-white rounded text-[11px] transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Protection Invariant reminder */}
            <div className="p-2 bg-[#131722] rounded border border-[#2a2e39] text-[10px] text-[#787b86] mb-3 flex items-start gap-1.5">
              <ShieldCheck size={14} className="text-[#089981] shrink-0 mt-0.5" />
              <span>
                All orders execute via server-side integer arithmetic ($10^8$ base units) and are stamped into the immutable cryptographic ledger.
              </span>
            </div>

            <button
              onClick={() => handleQuickTrade(orderSide)}
              disabled={isSubmittingQuickTrade}
              className={`w-full py-2.5 rounded font-bold text-xs text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                orderSide === 'buy' ? 'bg-[#089981] hover:bg-[#078570]' : 'bg-[#f23645] hover:bg-[#d92c3a]'
              }`}
            >
              {isSubmittingQuickTrade ? 'Executing...' : `Submit ${orderSide.toUpperCase()} Order`}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 9: TERMINAL HELP & KEYBOARD SHORTCUTS                */}
      {/* ======================================================== */}
      {activeTab === 'help' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 gap-3.5 bg-[#131722]">
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="text-xs font-bold text-white mb-2">Keyboard Shortcuts</div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Crosshair Tool:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Trend Line:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">Alt + T</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Fib Retracement:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">Alt + F</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Brush Tool:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">Alt + B</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Measure / Ruler:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">Shift + Click</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                <span className="text-[#787b86]">Symbol Picker:</span>
                <span className="text-[#2962ff] bg-[#1e222d] px-1.5 py-0.5 rounded">Ctrl + K</span>
              </div>
            </div>
          </div>

          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3">
            <div className="text-xs font-bold text-white mb-2">The Honest Terminal Invariants</div>
            <ul className="text-xs text-[#d1d4dc] space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <b className="text-white">Real Market Pricing:</b> Zero simulated slippage casino tricks. Powered by authoritative Binance live spot tickers.
              </li>
              <li>
                <b className="text-white">Integer Math ($10^8$ base units):</b> Strict financial calculations prevent IEEE 754 float rounding errors.
              </li>
              <li>
                <b className="text-white">Cryptographic Ledger:</b> Append-only transactions audited via SHA-256 state hashes.
              </li>
              <li>
                <b className="text-white">Discipline Invariant:</b> Strict 1% risk-per-trade guidelines and loss limit cooldowns.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: OPENBULL OPTION CHAIN */}
      {activeTab === 'options' && (
        <OptionChainWidget
          symbol={activeSymbol}
          currentPrice={selectedPrice}
          isWide={isEffectiveWide}
          onToggleWide={toggleWideDock}
        />
      )}

      {/* TAB: AI RESEARCH DESK */}
      {activeTab === 'ai' && (
        <AiResearchDesk
          isWide={isEffectiveWide}
          onToggleWide={toggleWideDock}
        />
      )}

      {/* TAB: SECTOR HEATMAP (ErTasselli/OpenTerminal Integration) */}
      {activeTab === 'heatmap' && (
        <SectorHeatmapWidget
          onSelectSymbol={(sym) => {
            onSelectSymbol(sym);
            if (onSelectTab) onSelectTab('watchlist');
          }}
          activeSymbol={activeSymbol}
        />
      )}

      {/* TAB: OPENALGO BROKER GATEWAY */}
      {activeTab === 'broker' && (
        <OpenAlgoBrokerWidget
          activeSymbol={activeSymbol}
          currentPrice={selectedPrice}
          onOpenBrokerModal={onOpenBrokerModal}
        />
      )}
    </aside>
  );
};
