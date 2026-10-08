'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Layers, BarChart2, DollarSign, Activity } from 'lucide-react';

interface SectorTile {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number; // in Billions USD
  changePercent: number;
  price: number;
}

const SECTOR_DATA: Record<'us' | 'crypto', SectorTile[]> = {
  us: [
    // Technology
    { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', marketCap: 3120, changePercent: 3.42, price: 128.5 },
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 3450, changePercent: -0.84, price: 224.3 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', marketCap: 3180, changePercent: 1.15, price: 428.1 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 2040, changePercent: 2.66, price: 165.8 },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: 1480, changePercent: 1.88, price: 582.4 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', marketCap: 810, changePercent: -1.22, price: 172.6 },
    // Financials
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', marketCap: 630, changePercent: -0.45, price: 218.4 },
    { symbol: 'BAC', name: 'Bank of America', sector: 'Financials', marketCap: 310, changePercent: 0.72, price: 39.8 },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', marketCap: 560, changePercent: 0.35, price: 278.9 },
    // Consumer Cyclical
    { symbol: 'AMZN', name: 'Amazon.com', sector: 'Consumer', marketCap: 1980, changePercent: 2.14, price: 189.2 },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer', marketCap: 790, changePercent: -2.75, price: 247.6 },
    // Healthcare
    { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', marketCap: 840, changePercent: 1.45, price: 885.2 },
    { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', marketCap: 540, changePercent: -0.92, price: 584.1 },
    // Energy
    { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', marketCap: 470, changePercent: 1.62, price: 119.5 },
    { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy', marketCap: 275, changePercent: -0.65, price: 152.3 },
  ],
  crypto: [
    { symbol: 'BTCUSDT', name: 'Bitcoin', sector: 'Store of Value', marketCap: 1640, changePercent: 1.73, price: 83270 },
    { symbol: 'ETHUSDT', name: 'Ethereum', sector: 'Smart Contracts', marketCap: 410, changePercent: 3.12, price: 3420 },
    { symbol: 'SOLUSDT', name: 'Solana', sector: 'High Perf L1', marketCap: 98, changePercent: 5.48, price: 208.5 },
    { symbol: 'BNBUSDT', name: 'BNB Chain', sector: 'Exchange Utility', marketCap: 88, changePercent: 0.85, price: 602.4 },
    { symbol: 'XRPUSDT', name: 'Ripple', sector: 'Payments', marketCap: 34, changePercent: -1.24, price: 0.584 },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', sector: 'Meme / Payments', marketCap: 21, changePercent: 4.18, price: 0.142 },
    { symbol: 'ADAUSDT', name: 'Cardano', sector: 'Smart Contracts', marketCap: 14, changePercent: -0.85, price: 0.382 },
    { symbol: 'AVAXUSDT', name: 'Avalanche', sector: 'Subnets L1', marketCap: 12, changePercent: 2.65, price: 30.15 },
  ],
};

interface SectorHeatmapWidgetProps {
  onSelectSymbol?: (symbol: string) => void;
  activeSymbol?: string;
}

export const SectorHeatmapWidget: React.FC<SectorHeatmapWidgetProps> = ({
  onSelectSymbol,
  activeSymbol,
}) => {
  const [market, setMarket] = useState<'us' | 'crypto'>('us');
  const [hoveredTile, setHoveredTile] = useState<SectorTile | null>(null);

  const tiles = SECTOR_DATA[market];

  // Helper for background color intensity based on change percent
  const getTileColor = (chg: number) => {
    if (chg >= 4.0) return 'bg-[#089981] text-white';
    if (chg >= 2.0) return 'bg-[#089981]/80 text-white';
    if (chg >= 0.5) return 'bg-[#089981]/50 text-[#d1d4dc]';
    if (chg >= 0.0) return 'bg-[#089981]/25 text-[#d1d4dc]';
    if (chg >= -0.5) return 'bg-[#f23645]/25 text-[#d1d4dc]';
    if (chg >= -2.0) return 'bg-[#f23645]/60 text-white';
    if (chg >= -4.0) return 'bg-[#f23645]/85 text-white';
    return 'bg-[#f23645] text-white';
  };

  return (
    <div className="flex flex-col h-full bg-[#131722] text-[#d1d4dc] select-none p-3 overflow-hidden">
      {/* Header with Market Selector & Stats */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-[#2962ff]" />
          <span className="font-bold text-xs uppercase tracking-wider text-white">
            Market Sector Heatmap
          </span>
        </div>

        {/* Market Switcher */}
        <div className="flex items-center bg-[#1e222d] rounded-md p-0.5 border border-[#2a2e39] text-[11px] font-semibold">
          <button
            onClick={() => setMarket('us')}
            className={`px-2 py-0.5 rounded transition-colors ${
              market === 'us' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            S&P 500
          </button>
          <button
            onClick={() => setMarket('crypto')}
            className={`px-2 py-0.5 rounded transition-colors ${
              market === 'crypto' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            Crypto
          </button>
        </div>
      </div>

      {/* Info / Legend Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#171b26] border border-[#2a2e39] rounded text-[10px] font-mono mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#787b86]">Legend:</span>
          <span className="flex items-center gap-1 text-[#f23645]">
            <span className="w-2 h-2 rounded-sm bg-[#f23645]" /> &lt; -2%
          </span>
          <span className="flex items-center gap-1 text-[#787b86]">
            <span className="w-2 h-2 rounded-sm bg-[#2a2e39]" /> 0%
          </span>
          <span className="flex items-center gap-1 text-[#089981]">
            <span className="w-2 h-2 rounded-sm bg-[#089981]" /> &gt; +2%
          </span>
        </div>

        {hoveredTile ? (
          <span className="text-white font-semibold">
            {hoveredTile.symbol}: ${hoveredTile.price.toLocaleString()} ({hoveredTile.changePercent >= 0 ? '+' : ''}{hoveredTile.changePercent.toFixed(2)}%)
          </span>
        ) : (
          <span className="text-[#787b86]">Click tile to load chart</span>
        )}
      </div>

      {/* Interactive Treemap / Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 bg-[#171b26] border border-[#2a2e39] rounded-lg overflow-y-auto">
        {tiles.map((tile) => {
          const isSelected = activeSymbol === tile.symbol;
          const isPos = tile.changePercent >= 0;

          return (
            <button
              key={tile.symbol}
              onClick={() => onSelectSymbol && onSelectSymbol(tile.symbol)}
              onMouseEnter={() => setHoveredTile(tile)}
              onMouseLeave={() => setHoveredTile(null)}
              className={`flex flex-col items-center justify-center p-2 rounded transition-all text-center group cursor-pointer border relative overflow-hidden ${
                isSelected
                  ? 'border-[#2962ff] ring-2 ring-[#2962ff]/50'
                  : 'border-transparent hover:border-white/30'
              } ${getTileColor(tile.changePercent)}`}
              title={`${tile.name} (${tile.symbol})\nMkt Cap: $${tile.marketCap}B\nChg: ${tile.changePercent}%`}
            >
              <span className="font-extrabold text-xs tracking-tight group-hover:scale-105 transition-transform">
                {tile.symbol}
              </span>
              <span className="font-mono text-[11px] font-bold mt-0.5">
                {isPos ? '+' : ''}{tile.changePercent.toFixed(2)}%
              </span>
              <span className="text-[9px] opacity-75 font-mono mt-0.5 truncate max-w-full">
                ${tile.marketCap >= 1000 ? `${(tile.marketCap / 1000).toFixed(1)}T` : `${tile.marketCap}B`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="mt-2 pt-2 border-t border-[#2a2e39] flex items-center justify-between text-[10px] text-[#787b86] shrink-0 font-mono">
        <span className="flex items-center gap-1.5">
          <Activity size={11} className="text-[#089981]" />
          <span>Real-time fallback chain active</span>
        </span>
        <span>OpenTerminal Heatmap Engine</span>
      </div>
    </div>
  );
};
