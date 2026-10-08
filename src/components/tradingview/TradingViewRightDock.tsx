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
} from 'lucide-react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';
import { getSymbolInfo, formatPrice } from '@/services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';

interface TradingViewRightDockProps {
  activeSymbol: string;
  currentPrice: number;
  onSelectSymbol: (symbol: string) => void;
  onOpenSymbolPicker: () => void;
  onToggleTradePanel?: () => void;
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
  { symbol: 'NIFTY', displaySymbol: 'NIFT', name: 'Nifty 50', badge: '50', category: 'INDICES' },
  { symbol: 'BANKNIFTY', displaySymbol: 'BANI', name: 'Bank Nifty', badge: 'B', category: 'INDICES' },
  { symbol: 'SENSEX', displaySymbol: 'SENS', name: 'Sensex', badge: 'S', category: 'INDICES' },
  { symbol: 'CNXIT', displaySymbol: 'CNXI', name: 'Nifty IT', badge: 'C', category: 'INDICES' },
  { symbol: 'SPX', displaySymbol: 'SPX', name: 'S&P 500', badge: '500', category: 'INDICES' },
  // Crypto
  { symbol: 'BTCUSDT', displaySymbol: 'BTC', name: 'Bitcoin', badge: '₿', category: 'CRYPTO' },
  { symbol: 'ETHUSDT', displaySymbol: 'ETH', name: 'Ethereum', badge: 'Ξ', category: 'CRYPTO' },
  { symbol: 'SOLUSDT', displaySymbol: 'SOL', name: 'Solana', badge: 'S', category: 'CRYPTO' },
  // Stocks
  { symbol: 'RELIANCE', displaySymbol: 'RELI', name: 'Reliance Ind.', badge: 'R', category: 'STOCKS' },
  { symbol: 'AXISBANK', displaySymbol: 'AXIS', name: 'Axis Bank', badge: 'A', category: 'STOCKS' },
  { symbol: 'HDFCBANK', displaySymbol: 'HDFC', name: 'HDFC Bank', badge: 'H', category: 'STOCKS' },
  { symbol: 'ICICIBANK', displaySymbol: 'ICICI', name: 'ICICI Bank', badge: 'I', category: 'STOCKS' },
  { symbol: 'BAJFINANCE', displaySymbol: 'BAJF', name: 'Bajaj Finance', badge: 'B', category: 'STOCKS' },
];

export const TradingViewRightDock: React.FC<TradingViewRightDockProps> = ({
  activeSymbol,
  currentPrice,
  onSelectSymbol,
  onOpenSymbolPicker,
  onToggleTradePanel,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'INDICES' | 'CRYPTO' | 'STOCKS'>('ALL');
  const [watchlistTitle, setWatchlistTitle] = useState<'Daftar Pantau' | 'Watchlist'>('Daftar Pantau');
  const [quickAmountPercent, setQuickAmountPercent] = useState<number>(25);
  const [isSubmittingQuickTrade, setIsSubmittingQuickTrade] = useState(false);

  const tickers = useWatchlistStore((s) => s.tickers);
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

  const filteredSymbols = DOCK_SYMBOLS.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <aside
      className="w-80 md:w-[340px] bg-[#131722] border-l border-[#2a2e39] flex flex-col h-full select-none shrink-0 overflow-hidden text-[#d1d4dc] transition-all"
      aria-label="TradingView Watchlist and Detail Dock"
    >
      {/* 1. Watchlist Top Bar (Daftar Pantau) */}
      <div className="p-2.5 px-3 border-b border-[#2a2e39] flex items-center justify-between bg-[#131722]">
        <button
          onClick={() => setWatchlistTitle(watchlistTitle === 'Daftar Pantau' ? 'Watchlist' : 'Daftar Pantau')}
          className="flex items-center gap-1.5 font-semibold text-xs text-[#f0f3fa] hover:text-[#2962ff] transition-colors"
          title="Click to toggle language"
        >
          <span>{watchlistTitle}</span>
          <ChevronDown size={12} className="text-[#787b86]" />
        </button>

        <div className="flex items-center gap-1 text-[#787b86]">
          <button
            onClick={onOpenSymbolPicker}
            className="w-6 h-6 rounded flex items-center justify-center hover:text-white hover:bg-[#1e222d] transition-colors"
            title="Add Symbol (Ctrl+K)"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => {
              const cats: ('ALL' | 'INDICES' | 'CRYPTO' | 'STOCKS')[] = ['ALL', 'INDICES', 'CRYPTO', 'STOCKS'];
              const next = cats[(cats.indexOf(activeCategory) + 1) % cats.length];
              setActiveCategory(next);
            }}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
              activeCategory !== 'ALL' ? 'text-[#2962ff] bg-[#2962ff]/10' : 'hover:text-white hover:bg-[#1e222d]'
            }`}
            title={`Filter: ${activeCategory}`}
          >
            <Table size={14} />
          </button>
          <button
            onClick={onOpenSymbolPicker}
            className="w-6 h-6 rounded flex items-center justify-center hover:text-white hover:bg-[#1e222d] transition-colors"
            title="Options"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* 2. Column Headers: Symbol | Last | Chg | Chg% */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-mono text-[#787b86] border-b border-[#2a2e39] bg-[#171b26]">
        <div className="col-span-5 text-left">Symbol</div>
        <div className="col-span-3 text-right">Last</div>
        <div className="col-span-2 text-right">Chg</div>
        <div className="col-span-2 text-right">Chg%</div>
      </div>

      {/* 3. Watchlist Rows (Scrollable Top Half) */}
      <div className="flex-1 overflow-y-auto min-h-[180px] max-h-[46vh] divide-y divide-[#1e222d]/60">
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
              {/* Symbol & Badge */}
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  <AssetIcon symbol={item.symbol} size={20} />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-xs text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                    {item.displaySymbol}
                  </span>
                  <span className="text-[9px] text-[#787b86] ml-1 font-mono hidden sm:inline">D</span>
                </div>
              </div>

              {/* Last Price */}
              <div className="col-span-3 text-right font-mono text-xs text-[#f0f3fa] font-medium">
                {price > 1000 ? formatPrice(price, 1) : formatPrice(price, 2)}
              </div>

              {/* Change Value */}
              <div
                className={`col-span-2 text-right font-mono text-[11px] ${
                  pos ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {pos ? '+' : ''}
                {chg.toFixed(1)}
              </div>

              {/* Change Percent */}
              <div
                className={`col-span-2 text-right font-mono text-[11px] font-semibold ${
                  pos ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {pos ? '+' : ''}
                {chgPct.toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Selected Symbol Detail Card (Matching the Bottom-Right Card in Screenshot) */}
      <div className="border-t border-[#2a2e39] bg-[#171b26] p-3.5 flex flex-col gap-3 shrink-0">
        {/* Header: Badge + Symbol Name + Action icons */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 flex items-center justify-center drop-shadow">
              <AssetIcon symbol={activeSymbol} size={32} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#f0f3fa]">
                  {activeSymbol === 'NIFTY' ? 'NIFTY' : activeSymbol}
                </span>
                <span className="text-[10px] text-[#787b86] font-mono">D</span>
              </div>
              <div className="text-[11px] text-[#787b86]">
                {activeSymbolInfo.name} • {activeSymbolInfo.category === 'Index' ? 'NSE' : 'BINANCE'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#787b86]">
            <button className="p-1 hover:text-white transition-colors" title="Table mode">
              <Table size={14} />
            </button>
            <button className="p-1 hover:text-white transition-colors" title="Note">
              <FileText size={14} />
            </button>
            <button className="p-1 hover:text-white transition-colors" title="More">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Big Price & Change line */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-extrabold text-[#f0f3fa]">
              {formatPrice(selectedPrice, activeSymbolInfo.pricePrecision)}
            </span>
            <span className="text-[10px] text-[#787b86] font-mono uppercase">
              {activeSymbolInfo.category === 'Index' ? 'POINT' : 'USDT'}
            </span>
          </div>

          <div
            className={`font-mono text-xs font-semibold flex items-center gap-1 mt-0.5 ${
              isPositive ? 'text-[#089981]' : 'text-[#f23645]'
            }`}
          >
            <span>
              {isPositive ? '+' : ''}
              {formatPrice(selectedChange, activeSymbolInfo.pricePrecision)}
            </span>
            <span>
              {isPositive ? '+' : ''}
              {selectedChangePercent.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#787b86] mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
            <span>Market open • 24/7 Authoritative Feed</span>
          </div>
        </div>

        {/* Mini News Card (Matches Screenshot!) */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded p-2.5 text-xs">
          <div className="flex items-center justify-between text-[10px] text-[#787b86] mb-1">
            <span className="font-semibold text-[#2962ff]">News</span>
            <span>4 hours ago</span>
          </div>
          <p className="text-[11px] text-[#d1d4dc] leading-tight line-clamp-2">
            {activeSymbol === 'NIFTY'
              ? "Eternal vs TCS shares: Zomato parent's weightage more than IT giant in Nifty 50 | Should you buy?"
              : `${activeSymbolInfo.name} structural liquidity tests key support bands as volume expands.`}
          </p>
          <a
            href="#news"
            onClick={(e) => {
              e.preventDefault();
              alert('Celsius News Desk: Institutional market flow analysis is live.');
            }}
            className="text-[10px] text-[#2962ff] hover:underline mt-1 inline-block"
          >
            More events &gt;
          </a>
        </div>

        {/* Performance Section (Matches 4 Pills in Screenshot!) */}
        <div>
          <div className="text-[10px] text-[#787b86] font-semibold mb-1.5 uppercase tracking-wider">
            Performance
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-0.5">
              <div className="text-[10px] font-bold text-[#f23645]">-0.27%</div>
              <div className="text-[9px] text-[#787b86]">1W</div>
            </div>
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-0.5">
              <div className="text-[10px] font-bold text-[#f23645]">-5.36%</div>
              <div className="text-[9px] text-[#787b86]">1M</div>
            </div>
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-0.5">
              <div className="text-[10px] font-bold text-[#f23645]">-5.54%</div>
              <div className="text-[9px] text-[#787b86]">3M</div>
            </div>
            <div className="bg-[#1e222d] border border-[#2a2e39] rounded py-1 px-0.5">
              <div className="text-[10px] font-bold text-[#089981]">+12.4%</div>
              <div className="text-[9px] text-[#787b86]">1Y</div>
            </div>
          </div>
        </div>

        {/* 1-Click Paper Trading Action Buttons */}
        <div className="pt-1">
          {/* Preset Buttons */}
          <div className="flex items-center justify-between text-[10px] text-[#787b86] mb-1.5 font-mono">
            <span>Size:</span>
            <div className="flex items-center gap-1">
              {[10, 25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setQuickAmountPercent(pct)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    quickAmountPercent === pct
                      ? 'bg-[#2962ff] text-white font-bold'
                      : 'bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86]'
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
    </aside>
  );
};
