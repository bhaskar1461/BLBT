// src/components/bloomberg/BloombergPanelWEI.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Filter, Maximize2, Minimize2 } from 'lucide-react';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';

export interface BloombergSecurity {
  symbol: string;
  name: string;
  tickerClass: 'Index' | 'Equity' | 'Curncy' | 'Comdty';
  region: 'Americas' | 'APAC' | 'Crypto' | 'Commodities';
  price: number;
  change: number;
  percent: number;
  positive: boolean;
  high: number;
  low: number;
  volume: string;
  currency: 'USD' | 'INR';
  sparkline: number[];
}

interface BloombergPanelWEIProps {
  securities: BloombergSecurity[];
  activeSymbol: string;
  onSelectSecurity: (sec: BloombergSecurity) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BloombergPanelWEI: React.FC<BloombergPanelWEIProps> = ({
  securities,
  activeSymbol,
  onSelectSecurity,
  isMaximized,
  onToggleMaximize,
}) => {
  const [filterRegion, setFilterRegion] = useState<'ALL' | 'Americas' | 'APAC' | 'Crypto' | 'Commodities'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'percent' | 'symbol' | 'price'>('percent');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredSecurities = useMemo(() => {
    let list = securities;
    if (filterRegion !== 'ALL') {
      list = list.filter((s) => s.region === filterRegion);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [securities, filterRegion, searchQuery, sortField, sortAsc]);

  const handleSort = (field: 'percent' | 'symbol' | 'price') => {
    terminalAudio.playTick();
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080b11] border border-[#182030] rounded overflow-hidden font-mono select-none text-xs">
      {/* Panel Header */}
      <div className="bg-[#0e131d] px-3 py-2 border-b border-[#1c2638] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs text-[#ff8800] bg-[#ff8800]/15 px-1.5 py-0.5 rounded border border-[#ff8800]/30">
            WEI
          </span>
          <span className="font-bold text-white tracking-wider text-[11px] uppercase">
            WORLD EQUITY INDICES &amp; MACRO MONITOR
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2 text-[#64748b] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER..."
              className="w-28 bg-[#141b27] border border-[#232f45] focus:border-[#ff8800] rounded pl-6 pr-2 py-0.5 text-[10px] text-white placeholder-[#505d75] outline-none uppercase font-mono"
            />
          </div>

          <span className="text-[10px] text-[#00c176] font-bold">● LIVE</span>

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1 hover:bg-[#1a2333] text-[#8e95a5] hover:text-[#ff8800] rounded transition-colors"
              title={isMaximized ? "Restore 4-Panel Layout" : "Maximize Panel"}
            >
              {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Region Tabs */}
      <div className="bg-[#0a0e16] px-2 py-1 border-b border-[#161f2e] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(['ALL', 'APAC', 'Americas', 'Crypto', 'Commodities'] as const).map((reg) => {
          const isActive = filterRegion === reg;
          const labels = {
            ALL: 'ALL MARKETS',
            APAC: 'APAC / INDIA 🇮🇳',
            Americas: 'AMERICAS 🇺🇸',
            Crypto: 'CRYPTO 🌐',
            Commodities: 'COMMODITIES 🟡',
          };
          return (
            <button
              key={reg}
              onClick={() => {
                terminalAudio.playTick();
                setFilterRegion(reg);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#ff8800] text-black shadow-sm'
                  : 'text-[#8e95a5] hover:text-white bg-[#121824]'
              }`}
            >
              {labels[reg]}
            </button>
          );
        })}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-3 py-1.5 bg-[#0b1018] border-b border-[#182030] text-[10px] font-bold text-[#8e95a5] tracking-wider uppercase">
        <div
          onClick={() => handleSort('symbol')}
          className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white"
        >
          <span>SECURITY</span>
          <ArrowUpDown size={10} />
        </div>
        <div
          onClick={() => handleSort('price')}
          className="col-span-3 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white"
        >
          <span>LAST</span>
          <ArrowUpDown size={10} />
        </div>
        <div
          onClick={() => handleSort('percent')}
          className="col-span-3 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white"
        >
          <span>NET CHG / %</span>
          <ArrowUpDown size={10} />
        </div>
        <div className="col-span-2 text-right hidden sm:block">
          <span>VOLUME</span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#131b28]">
        {filteredSecurities.map((sec) => {
          const isActive = sec.symbol.toUpperCase() === activeSymbol.toUpperCase();
          const currPrefix = sec.currency === 'INR' ? '₹' : '$';
          const sign = sec.positive ? '+' : '';

          return (
            <div
              key={sec.symbol}
              onClick={() => {
                terminalAudio.playTick();
                onSelectSecurity(sec);
              }}
              className={`grid grid-cols-12 px-3 py-1.5 items-center cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#ff8800]/20 border-l-2 border-[#ff8800]'
                  : 'hover:bg-[#111724]'
              }`}
            >
              {/* Security Symbol & Name */}
              <div className="col-span-4 flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px] truncate">
                  <span className={isActive ? 'text-[#ff8800]' : 'text-white'}>
                    {sec.symbol}
                  </span>
                  <span className="text-[9px] text-[#64748b] font-normal uppercase px-1 rounded bg-[#101724]">
                    &lt;{sec.tickerClass}&gt;
                  </span>
                </div>
                <div className="text-[10px] text-[#8e95a5] truncate">
                  {sec.name}
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3 text-right font-mono font-bold text-white text-[11px] tabular-nums">
                {currPrefix}{formatPrice(sec.price, 2)}
              </div>

              {/* Change & Percent */}
              <div className="col-span-3 text-right flex flex-col items-end tabular-nums">
                <span
                  className={`font-mono font-bold text-[11px] px-1 rounded ${
                    sec.positive
                      ? 'text-[#00c176] bg-[#00c176]/10'
                      : 'text-[#ff3b30] bg-[#ff3b30]/10'
                  }`}
                >
                  {sign}{sec.percent.toFixed(2)}%
                </span>
                <span className="text-[9px] text-[#8e95a5] font-mono">
                  {sign}{sec.change.toFixed(2)}
                </span>
              </div>

              {/* Volume */}
              <div className="col-span-2 text-right hidden sm:block text-[10px] text-[#8e95a5] font-mono truncate">
                {sec.volume}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
