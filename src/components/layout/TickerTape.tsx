'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Flame, Zap } from 'lucide-react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { formatPrice } from '@/services/symbols';

interface TapeItemDef {
  symbol: string;
  display: string;
  name: string;
  category: 'CRYPTO' | 'INDEX' | 'STOCKS';
  defaultPrice: number;
  defaultChange: number;
  precision: number;
}

const TAPE_ITEMS: TapeItemDef[] = [
  { symbol: 'BTCUSDT', display: 'BTC/USDT', name: 'Bitcoin', category: 'CRYPTO', defaultPrice: 83250.0, defaultChange: 2.14, precision: 2 },
  { symbol: 'ETHUSDT', display: 'ETH/USDT', name: 'Ethereum', category: 'CRYPTO', defaultPrice: 3410.5, defaultChange: 1.65, precision: 2 },
  { symbol: 'SOLUSDT', display: 'SOL/USDT', name: 'Solana', category: 'CRYPTO', defaultPrice: 178.2, defaultChange: 4.82, precision: 2 },
  { symbol: 'NIFTY', display: 'NIFTY 50', name: 'Nifty 50', category: 'INDEX', defaultPrice: 22231.8, defaultChange: -1.64, precision: 2 },
  { symbol: 'BANKNIFTY', display: 'BANK NIFTY', name: 'Bank Nifty', category: 'INDEX', defaultPrice: 47850.0, defaultChange: -0.92, precision: 2 },
  { symbol: 'SENSEX', display: 'SENSEX', name: 'BSE Sensex', category: 'INDEX', defaultPrice: 72638.7, defaultChange: -1.82, precision: 2 },
  { symbol: 'SPX', display: 'S&P 500', name: 'S&P 500', category: 'INDEX', defaultPrice: 7801.61, defaultChange: 0.42, precision: 2 },
  { symbol: 'RELIANCE', display: 'RELIANCE', name: 'Reliance Ind.', category: 'STOCKS', defaultPrice: 2890.0, defaultChange: 0.85, precision: 2 },
  { symbol: 'HDFCBANK', display: 'HDFC BANK', name: 'HDFC Bank', category: 'STOCKS', defaultPrice: 1465.0, defaultChange: -0.45, precision: 2 },
];

export const TickerTape: React.FC = () => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);
  const tickers = useWatchlistStore((s) => s.tickers);

  return (
    <div className="h-7 bg-[#0D1117] border-b border-[#212A36] flex items-center px-2 shrink-0 select-none overflow-hidden z-20 text-[11px] font-mono">
      {/* Institutional Pulse Tag */}
      <div className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[#212A36] text-[#787b86] shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00c176] animate-pulse" />
        <span className="text-[10px] font-bold tracking-wider text-[#adb7c6] uppercase hidden sm:inline">
          PULSE
        </span>
      </div>

      {/* Scrolling / Flex Ticker Strip */}
      <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        {TAPE_ITEMS.map((item) => {
          const liveTicker = tickers[item.symbol];
          const price = liveTicker?.lastPrice ?? item.defaultPrice;
          const changePct = liveTicker?.priceChangePercent ?? item.defaultChange;
          const isUp = changePct >= 0;
          const isSelected = activeSymbol === item.symbol;

          return (
            <button
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all shrink-0 group ${
                isSelected
                  ? 'bg-[#161B22] border border-[#FF6B00]/60 text-white'
                  : 'hover:bg-[#161B22] text-[#adb7c6] hover:text-white'
              }`}
              title={`Switch chart to ${item.name} (${item.symbol})`}
            >
              <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${
                item.category === 'CRYPTO'
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00]/30 text-[#FF8B3D]'
                  : item.category === 'INDEX'
                    ? 'bg-[#4ea1ff]/10 border-[#4ea1ff]/30 text-[#4ea1ff]'
                    : 'bg-[#212A36] border-[#2D3745] text-[#787b86]'
              }`}>
                {item.category === 'CRYPTO' ? 'CRYPTO' : item.category === 'INDEX' ? 'IDX' : 'EQ'}
              </span>

              <span className="font-bold tracking-tight text-white group-hover:text-[#4ea1ff] transition-colors">
                {item.display}
              </span>

              <span className="font-mono text-[#d7dde7]">
                {formatPrice(price, item.precision)}
              </span>

              <span className={`flex items-center text-[10px] font-semibold ${isUp ? 'text-[#00c176]' : 'text-[#ff4d4f]'}`}>
                {isUp ? '+' : ''}{changePct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Global Indicator Pin */}
      <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-[#212A36] shrink-0 text-[10px] text-[#7f8b9d]">
        <span className="flex items-center gap-1">
          <Zap size={10} className="text-[#FF6B00]" />
          <span>BINANCE SPOT + NSE</span>
        </span>
      </div>
    </div>
  );
};
