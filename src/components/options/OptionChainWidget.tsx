'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ShieldAlert,
  Zap,
  Maximize2,
  Minimize2,
  X,
  Sliders,
} from 'lucide-react';
import { getOptionChain, type OptionStrikeData, type OptionChainSummary } from '@/services/optionsService';
import { formatPrice } from '@/services/symbols';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';

export interface OptionChainWidgetProps {
  symbol?: string;
  currentPrice?: number;
  onSelectStrike?: (strike: number, type: 'CE' | 'PE') => void;
  isWide?: boolean;
  onToggleWide?: () => void;
}

export const OptionChainWidget: React.FC<OptionChainWidgetProps> = ({
  symbol = 'NIFTY',
  currentPrice = 22231.8,
  onSelectStrike,
  isWide = false,
  onToggleWide,
}) => {
  const [expiryIndex, setExpiryIndex] = useState(0);
  const [selectedStrikeForOrder, setSelectedStrikeForOrder] = useState<{ strike: number; type: 'CE' | 'PE'; ltp: number } | null>(null);
  const [isExecutingOrder, setIsExecutingOrder] = useState(false);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);
  
  // View mode: 'compact' (5 cols, fits 350px dock), 'standard' (7 cols), 'full' (all 11 Greeks)
  const [viewMode, setViewMode] = useState<'compact' | 'standard' | 'full'>(isWide ? 'full' : 'compact');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-switch mode when wide dock toggles, unless user manually changed it
  useEffect(() => {
    if (isWide && viewMode === 'compact') {
      setViewMode('full');
    } else if (!isWide && viewMode === 'full') {
      setViewMode('compact');
    }
  }, [isWide]);

  const { account, fetchAccount } = useTradingStore();
  const user = storage.getUserProfile();

  // Detect currency symbol dynamically: Crypto and US symbols use $, Indian equities use ₹
  const isUsOrCrypto = useMemo(() => {
    const s = symbol.toUpperCase();
    return (
      s.includes('USDT') ||
      s.includes('USD') ||
      ['SPX', 'AMZN', 'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'SOL', 'BTC', 'ETH'].includes(s)
    );
  }, [symbol]);

  const curr = isUsOrCrypto ? '$' : '₹';

  const chain: OptionChainSummary = useMemo(() => {
    return getOptionChain(symbol, currentPrice, expiryIndex);
  }, [symbol, currentPrice, expiryIndex]);

  // Execute paper order on option strike
  const handleExecuteOptionOrder = async (side: 'buy' | 'sell') => {
    if (!selectedStrikeForOrder || isExecutingOrder) return;
    setIsExecutingOrder(true);
    setOrderNotification(null);

    const optionSymbol = `${symbol}-${selectedStrikeForOrder.strike}-${selectedStrikeForOrder.type}`;
    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          symbol: optionSymbol,
          side,
          type: 'market',
          amount: '1.0', // 1 lot/unit
          userDisplayName: user.displayName,
        }),
      });

      if (res.ok) {
        await fetchAccount(user.id);
        setOrderNotification(`Executed ${side.toUpperCase()} for ${optionSymbol} @ ${curr}${selectedStrikeForOrder.ltp.toFixed(2)}`);
        setTimeout(() => setOrderNotification(null), 4000);
      }
    } catch {
    } finally {
      setIsExecutingOrder(false);
    }
  };

  const maxCallOi = Math.max(...chain.strikes.map((s) => s.callOi), 1);
  const maxPutOi = Math.max(...chain.strikes.map((s) => s.putOi), 1);

  // Render Table Element
  const renderChainTable = (mode: 'compact' | 'standard' | 'full') => (
    <div className="flex-1 min-h-0 overflow-auto border border-[#2a2e39] rounded-lg bg-[#171b26]">
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead className="sticky top-0 bg-[#1e222d] z-10 border-b border-[#2a2e39] text-[10px] text-[#787b86]">
          {/* Top Level Category Row */}
          <tr>
            <th
              colSpan={mode === 'compact' ? 2 : mode === 'standard' ? 3 : 5}
              className="py-1.5 px-2 text-center text-[#f23645] bg-[#f23645]/10 border-r border-[#2a2e39] font-bold"
            >
              CALLS (CE)
            </th>
            <th className="py-1.5 px-3 text-center text-white bg-[#2a2e39] font-bold">
              STRIKE
            </th>
            <th
              colSpan={mode === 'compact' ? 2 : mode === 'standard' ? 3 : 5}
              className="py-1.5 px-2 text-center text-[#089981] bg-[#089981]/10 border-l border-[#2a2e39] font-bold"
            >
              PUTS (PE)
            </th>
          </tr>

          {/* Subheaders */}
          <tr className="border-b border-[#2a2e39] text-[10px]">
            {/* CE Headers */}
            {mode === 'full' && (
              <>
                <th className="py-1 px-1.5 text-right">OI (Chg)</th>
                <th className="py-1 px-1.5 text-right">Vol</th>
                <th className="py-1 px-1.5 text-right">IV%</th>
                <th className="py-1 px-1.5 text-right">Delta</th>
              </>
            )}
            {mode === 'standard' && (
              <>
                <th className="py-1 px-1.5 text-right">OI</th>
                <th className="py-1 px-1.5 text-right">IV%</th>
              </>
            )}
            {mode === 'compact' && (
              <th className="py-1 px-1.5 text-right">OI</th>
            )}
            <th className="py-1 px-2 text-right border-r border-[#2a2e39] text-white">LTP</th>

            {/* Strike */}
            <th className="py-1 px-3 text-center bg-[#2a2e39]/80 font-bold text-white tracking-wide">PRICE</th>

            {/* PE Headers */}
            <th className="py-1 px-2 text-left border-l border-[#2a2e39] text-white">LTP</th>
            {mode === 'compact' && (
              <th className="py-1 px-1.5 text-left">OI</th>
            )}
            {mode === 'standard' && (
              <>
                <th className="py-1 px-1.5 text-left">IV%</th>
                <th className="py-1 px-1.5 text-left">OI</th>
              </>
            )}
            {mode === 'full' && (
              <>
                <th className="py-1 px-1.5 text-left">Delta</th>
                <th className="py-1 px-1.5 text-left">IV%</th>
                <th className="py-1 px-1.5 text-left">Vol</th>
                <th className="py-1 px-1.5 text-left">OI (Chg)</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#2a2e39]/40 text-[11px]">
          {chain.strikes.map((s) => {
            const callOiRatio = Math.min(100, Math.round((s.callOi / maxCallOi) * 100));
            const putOiRatio = Math.min(100, Math.round((s.putOi / maxPutOi) * 100));
            const isSelectedCall = selectedStrikeForOrder?.strike === s.strikePrice && selectedStrikeForOrder.type === 'CE';
            const isSelectedPut = selectedStrikeForOrder?.strike === s.strikePrice && selectedStrikeForOrder.type === 'PE';

            return (
              <tr
                key={s.strikePrice}
                className={`hover:bg-[#2a2e39]/50 transition-colors ${
                  s.isAtm ? 'bg-[#2962ff]/10 font-semibold' : ''
                }`}
              >
                {/* CE: Full Mode extra columns */}
                {mode === 'full' && (
                  <>
                    <td className="py-1.5 px-1.5 text-right relative">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 pointer-events-none"
                        style={{ width: `${callOiRatio}%` }}
                      />
                      <span className="relative z-1">{s.callOi.toLocaleString()}</span>
                    </td>
                    <td className="py-1.5 px-1.5 text-right text-[#787b86]">
                      {(s.callVolume / 1000).toFixed(0)}k
                    </td>
                    <td className="py-1.5 px-1.5 text-right text-[#787b86]">
                      {s.callIv}%
                    </td>
                    <td className="py-1.5 px-1.5 text-right text-[#d1d4dc]">
                      {s.callDelta}
                    </td>
                  </>
                )}

                {/* CE: Standard Mode */}
                {mode === 'standard' && (
                  <>
                    <td className="py-1.5 px-1.5 text-right relative">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 pointer-events-none"
                        style={{ width: `${callOiRatio}%` }}
                      />
                      <span className="relative z-1">{(s.callOi / 1000).toFixed(0)}k</span>
                    </td>
                    <td className="py-1.5 px-1.5 text-right text-[#787b86]">
                      {s.callIv}%
                    </td>
                  </>
                )}

                {/* CE: Compact Mode OI */}
                {mode === 'compact' && (
                  <td className="py-1.5 px-1.5 text-right relative">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 pointer-events-none"
                      style={{ width: `${callOiRatio}%` }}
                    />
                    <span className="relative z-1 text-[10px] text-[#9ca3af]">
                      {(s.callOi / 1000).toFixed(0)}k
                    </span>
                  </td>
                )}

                {/* CE: LTP Button */}
                <td className="py-1 px-1.5 text-right border-r border-[#2a2e39]">
                  <button
                    onClick={() => {
                      setSelectedStrikeForOrder({ strike: s.strikePrice, type: 'CE', ltp: s.callLtp });
                      if (onSelectStrike) onSelectStrike(s.strikePrice, 'CE');
                    }}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all text-[11px] ${
                      isSelectedCall
                        ? 'bg-[#f23645] text-white ring-2 ring-white/50'
                        : s.isCallItm
                        ? 'bg-[#f23645]/20 text-[#f23645] hover:bg-[#f23645] hover:text-white'
                        : 'text-[#f0f3fa] hover:bg-[#1e222d]'
                    }`}
                  >
                    {curr}{s.callLtp.toFixed(1)}
                  </button>
                </td>

                {/* STRIKE */}
                <td
                  className={`py-1.5 px-2.5 text-center font-extrabold ${
                    s.isAtm
                      ? 'bg-[#2962ff] text-white shadow-md'
                      : s.strikePrice === chain.maxPainStrike
                      ? 'bg-[#ff9800]/20 text-[#ff9800]'
                      : 'bg-[#1e222d] text-[#f0f3fa]'
                  }`}
                >
                  <span className="tabular-nums">{s.strikePrice}</span>
                  {s.isAtm && (
                    <span className="ml-1 text-[8px] bg-white/20 px-1 py-0.2 rounded uppercase font-bold tracking-wider">
                      ATM
                    </span>
                  )}
                </td>

                {/* PE: LTP Button */}
                <td className="py-1 px-1.5 text-left border-l border-[#2a2e39]">
                  <button
                    onClick={() => {
                      setSelectedStrikeForOrder({ strike: s.strikePrice, type: 'PE', ltp: s.putLtp });
                      if (onSelectStrike) onSelectStrike(s.strikePrice, 'PE');
                    }}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all text-[11px] ${
                      isSelectedPut
                        ? 'bg-[#089981] text-white ring-2 ring-white/50'
                        : s.isPutItm
                        ? 'bg-[#089981]/20 text-[#089981] hover:bg-[#089981] hover:text-white'
                        : 'text-[#f0f3fa] hover:bg-[#1e222d]'
                    }`}
                  >
                    {curr}{s.putLtp.toFixed(1)}
                  </button>
                </td>

                {/* PE: Compact Mode OI */}
                {mode === 'compact' && (
                  <td className="py-1.5 px-1.5 text-left relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none"
                      style={{ width: `${putOiRatio}%` }}
                    />
                    <span className="relative z-1 text-[10px] text-[#9ca3af]">
                      {(s.putOi / 1000).toFixed(0)}k
                    </span>
                  </td>
                )}

                {/* PE: Standard Mode */}
                {mode === 'standard' && (
                  <>
                    <td className="py-1.5 px-1.5 text-left text-[#787b86]">
                      {s.putIv}%
                    </td>
                    <td className="py-1.5 px-1.5 text-left relative">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none"
                        style={{ width: `${putOiRatio}%` }}
                      />
                      <span className="relative z-1">{(s.putOi / 1000).toFixed(0)}k</span>
                    </td>
                  </>
                )}

                {/* PE: Full Mode extra columns */}
                {mode === 'full' && (
                  <>
                    <td className="py-1.5 px-1.5 text-left text-[#d1d4dc]">
                      {s.putDelta}
                    </td>
                    <td className="py-1.5 px-1.5 text-left text-[#787b86]">
                      {s.putIv}%
                    </td>
                    <td className="py-1.5 px-1.5 text-left text-[#787b86]">
                      {(s.putVolume / 1000).toFixed(0)}k
                    </td>
                    <td className="py-1.5 px-1.5 text-left relative">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none"
                        style={{ width: `${putOiRatio}%` }}
                      />
                      <span className="relative z-1">{s.putOi.toLocaleString()}</span>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#131722] text-[#d1d4dc] select-none p-2.5 sm:p-3 overflow-hidden font-sans">
      {/* 1. Header with Symbol, Expiry, Mode Switcher, and Expand Actions */}
      <div className="flex flex-col gap-2 pb-2.5 border-b border-[#2a2e39] shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Symbol & OpenBull Tag */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm text-white tracking-tight truncate">
              {symbol}
            </span>
            <span className="bg-[#089981]/20 border border-[#089981]/30 text-[#089981] text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
              OpenBull
            </span>
          </div>

          {/* Right Action Icons: Width toggle & Fullscreen Modal */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleWide && (
              <button
                onClick={onToggleWide}
                className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
                title={isWide ? 'Contract dock' : 'Expand dock'}
              >
                {isWide ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-[#2962ff] hover:bg-[#1e222d] transition-colors"
              title="Pop out Fullscreen Modal"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* Expiry Selector + View Mode Switcher */}
        <div className="flex items-center justify-between gap-2">
          {/* Expiry Dropdown */}
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={expiryIndex}
              onChange={(e) => setExpiryIndex(Number(e.target.value))}
              aria-label="Select option expiry date"
              className="w-full bg-[#1e222d] border border-[#2a2e39] text-[#f0f3fa] text-xs font-semibold rounded px-2 py-1 pr-6 cursor-pointer hover:border-[#2962ff] transition-colors appearance-none"
            >
              <option value={0}>15-OCT-2026 (Weekly)</option>
              <option value={1}>22-OCT-2026 (Weekly)</option>
              <option value={2}>29-OCT-2026 (Monthly)</option>
              <option value={3}>26-NOV-2026 (Monthly)</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2 pointer-events-none text-[#787b86]" />
          </div>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center bg-[#1e222d] p-0.5 rounded border border-[#2a2e39] shrink-0 text-[10px] font-semibold">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'compact' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'standard' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'full' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Greeks
            </button>
          </div>
        </div>

        {/* Institutional Summary Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
          {/* Spot */}
          <div className="bg-[#171b26] border border-[#2a2e39] px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
            <span className="text-[#787b86]">Spot:</span>
            <span className="text-white font-bold">{curr}{formatPrice(currentPrice, isUsOrCrypto ? 2 : 1)}</span>
          </div>

          {/* PCR */}
          <div className="bg-[#171b26] border border-[#2a2e39] px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
            <span className="text-[#787b86]">PCR:</span>
            <span className={`font-bold ${chain.pcr >= 1 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {chain.pcr}
            </span>
          </div>

          {/* Max Pain */}
          <div className="bg-[#171b26] border border-[#2a2e39] px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
            <span className="text-[#787b86]">Pain:</span>
            <span className="text-[#ff9800] font-bold">{chain.maxPainStrike}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual OI Distribution Bar (Call OI vs Put OI) */}
      <div className="py-1.5 shrink-0 border-b border-[#2a2e39]/60 flex items-center justify-between text-[10px] font-mono text-[#787b86]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-sm bg-[#f23645] shrink-0" />
          <span className="truncate">Res: <strong className="text-white">{chain.highestCallOiStrike}</strong> ({(chain.totalCallOi / 100000).toFixed(1)}L)</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-sm bg-[#089981] shrink-0" />
          <span className="truncate">Sup: <strong className="text-white">{chain.highestPutOiStrike}</strong> ({(chain.totalPutOi / 100000).toFixed(1)}L)</span>
        </div>
      </div>

      {/* 3. Tabular Option Chain Table */}
      {renderChainTable(viewMode)}

      {/* 4. Bottom 1-Click Order Execution Drawer (if a strike is selected) */}
      {selectedStrikeForOrder && (
        <div className="mt-2 p-2 bg-[#1e222d] border border-[#2a2e39] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in duration-150 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Zap size={14} className="text-[#ff9800] shrink-0" />
            <span className="font-bold text-xs text-white truncate">
              {symbol} {selectedStrikeForOrder.strike} {selectedStrikeForOrder.type}
            </span>
            <span className="font-mono text-xs text-[#089981] font-bold">
              {curr}{selectedStrikeForOrder.ltp.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleExecuteOptionOrder('buy')}
              disabled={isExecutingOrder}
              className="px-2.5 py-1 rounded bg-[#089981] hover:bg-[#078570] text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpRight size={12} />
              <span>BUY 1 LOT</span>
            </button>
            <button
              onClick={() => handleExecuteOptionOrder('sell')}
              disabled={isExecutingOrder}
              className="px-2.5 py-1 rounded bg-[#f23645] hover:bg-[#d92c3a] text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowDownRight size={12} />
              <span>SELL / WRITE</span>
            </button>
            <button
              onClick={() => setSelectedStrikeForOrder(null)}
              className="text-[#787b86] hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {orderNotification && (
        <div className="mt-1 px-2.5 py-1 rounded bg-[#089981]/20 border border-[#089981] text-[#089981] text-xs font-mono shrink-0 animate-in fade-in">
          {orderNotification}
        </div>
      )}

      {/* 5. Fullscreen Popout Modal for Advanced Analysis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in">
          <div className="bg-[#131722] border border-[#2a2e39] rounded-xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-3 px-4 border-b border-[#2a2e39] flex items-center justify-between bg-[#171b26]">
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-[#2962ff]" />
                <span className="font-bold text-base text-white">
                  {symbol} Full Institutional Option Chain
                </span>
                <span className="bg-[#089981]/20 border border-[#089981]/30 text-[#089981] text-xs font-bold px-2 py-0.5 rounded font-mono">
                  OpenBull Analytics
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 flex flex-col min-h-0 gap-3">
              <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="bg-[#1e222d] px-3 py-1 rounded border border-[#2a2e39]">
                    Spot: <strong className="text-white">{curr}{formatPrice(currentPrice, isUsOrCrypto ? 2 : 1)}</strong>
                  </div>
                  <div className="bg-[#1e222d] px-3 py-1 rounded border border-[#2a2e39]">
                    PCR: <strong className={chain.pcr >= 1 ? 'text-[#089981]' : 'text-[#f23645]'}>{chain.pcr} ({chain.pcrSentiment})</strong>
                  </div>
                  <div className="bg-[#1e222d] px-3 py-1 rounded border border-[#2a2e39]">
                    Max Pain: <strong className="text-[#ff9800]">{chain.maxPainStrike}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#787b86]">Mode: Full Greeks</span>
                </div>
              </div>

              {renderChainTable('full')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
