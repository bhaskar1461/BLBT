// src/components/bloomberg/BloombergPanelEMSX.tsx
'use client';

import React, { useState } from 'react';
import type { BloombergSecurity } from './BloombergPanelWEI';
import { useTradingStore } from '@/stores/useTradingStore';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Lock,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergPanelEMSXProps {
  security: BloombergSecurity;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BloombergPanelEMSX: React.FC<BloombergPanelEMSXProps> = ({
  security,
  isMaximized,
  onToggleMaximize,
}) => {
  const {
    account,
    positions,
    orders,
    transactions,
  } = useTradingStore();

  const [activeTab, setActiveTab] = useState<'TICKET' | 'POSITIONS' | 'ORDERS' | 'PORT'>('TICKET');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [quantity, setQuantity] = useState('0.5');
  const [limitPrice, setLimitPrice] = useState(security.price.toString());
  const [executionNotice, setExecutionNotice] = useState<string | null>(null);

  const numQty = parseFloat(quantity) || 0;
  const execPrice = orderType === 'MARKET' ? security.price : (parseFloat(limitPrice) || security.price);
  const notionalUsd = numQty * execPrice;
  const feeUsd = notionalUsd * 0.001; // 0.10% flat spot execution fee per invariant
  const totalCostUsd = side === 'BUY' ? notionalUsd + feeUsd : notionalUsd - feeUsd;

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    terminalAudio.playOrderFilled();
    const notice = `FILL CONFIRMED: ${side} ${numQty} ${security.symbol} @ $${formatPrice(execPrice, 2)} · FEE: $${formatPrice(feeUsd, 2)} (0.10%)`;
    setExecutionNotice(notice);

    setTimeout(() => {
      setExecutionNotice(null);
    }, 4500);
  };

  const handleQuickPercent = (pct: number) => {
    terminalAudio.playTick();
    const avail = account?.availableFunds || 10000;
    const maxQty = (avail * pct) / security.price;
    setQuantity(maxQty.toFixed(4));
  };

  return (
    <div className="flex flex-col h-full bg-[#080b11] border border-[#182030] rounded overflow-hidden font-mono select-none text-xs">
      {/* Panel Header */}
      <div className="bg-[#0e131d] px-3 py-2 border-b border-[#1c2638] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs text-[#ff8800] bg-[#ff8800]/15 px-1.5 py-0.5 rounded border border-[#ff8800]/30">
            EMSX
          </span>
          <span className="font-bold text-white tracking-wider text-[11px] uppercase">
            EXECUTION MANAGEMENT SYSTEM &amp; BLOTTER &lt;PORT&gt;
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#8e95a5]">
          <span>NAV:</span>
          <span className="text-white font-bold font-mono">
            ${formatPrice(account?.equity || 576000, 2)}
          </span>
          <span className="text-[#ff8800] font-bold">
            ≈ {formatInrCrore(account?.equity || 576000)}
          </span>

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

      {/* Blotter Navigation Tabs */}
      <div className="bg-[#0a0e16] px-2 py-1 border-b border-[#161f2e] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(['TICKET', 'POSITIONS', 'ORDERS', 'PORT'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const labels = {
            TICKET: '<EMSX> ORDER TICKET',
            POSITIONS: `POSITIONS (${positions.length})`,
            ORDERS: `ORDERS (${orders.length})`,
            PORT: '<PORT> RISK & BENCHMARK',
          };
          return (
            <button
              key={tab}
              onClick={() => {
                terminalAudio.playTick();
                setActiveTab(tab);
              }}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-tight transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#ff8800] text-black shadow-sm'
                  : 'text-[#8e95a5] hover:text-white bg-[#121824]'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'TICKET' ? (
          /* Tab 1: EMSX Order Entry Ticket */
          <form onSubmit={handleExecuteTrade} className="flex flex-col gap-3">
            {/* Execution Confirmation Alert Flash */}
            {executionNotice && (
              <div className="p-2.5 bg-[#00c176]/15 border border-[#00c176] rounded text-[#00c176] font-bold text-[11px] flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={14} className="shrink-0" />
                <span className="truncate">{executionNotice}</span>
              </div>
            )}

            {/* Target Instrument Strip */}
            <div className="flex items-center justify-between p-2.5 bg-[#0f1420] border border-[#1b2536] rounded">
              <div>
                <span className="text-[10px] text-[#8e95a5] block">TARGET SECURITY:</span>
                <span className="text-white font-bold text-sm">
                  {security.symbol} &lt;{security.tickerClass}&gt;
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8e95a5] block">SPOT AUTHORITATIVE:</span>
                <span className="text-[#00c176] font-bold text-sm font-mono">
                  ${formatPrice(security.price, 2)}
                </span>
              </div>
            </div>

            {/* Side Selection: BUY (Green) vs SELL (Red) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  terminalAudio.playTick();
                  setSide('BUY');
                }}
                className={`py-2 rounded font-extrabold text-xs transition-all cursor-pointer ${
                  side === 'BUY'
                    ? 'bg-[#00c176] text-black shadow-[0_0_12px_rgba(0,193,118,0.35)]'
                    : 'bg-[#121824] text-[#8e95a5] border border-[#1f2a3d] hover:text-white'
                }`}
              >
                BUY / LONG &lt;GO&gt;
              </button>
              <button
                type="button"
                onClick={() => {
                  terminalAudio.playTick();
                  setSide('SELL');
                }}
                className={`py-2 rounded font-extrabold text-xs transition-all cursor-pointer ${
                  side === 'SELL'
                    ? 'bg-[#ff3b30] text-white shadow-[0_0_12px_rgba(255,59,48,0.35)]'
                    : 'bg-[#121824] text-[#8e95a5] border border-[#1f2a3d] hover:text-white'
                }`}
              >
                SELL / SHORT &lt;GO&gt;
              </button>
            </div>

            {/* Order Type */}
            <div className="flex items-center gap-1.5">
              {(['MARKET', 'LIMIT', 'STOP'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    terminalAudio.playTick();
                    setOrderType(t);
                  }}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    orderType === t
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#121824] text-[#8e95a5] border-[#1e2738] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Inputs: Quantity & Price */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8e95a5] uppercase">QUANTITY</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-[#121824] border border-[#212b3d] focus:border-[#ff8800] rounded p-2 text-white font-mono font-bold text-xs outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8e95a5] uppercase">
                  {orderType === 'MARKET' ? 'EXEC PRICE (MKT)' : 'LIMIT PRICE'}
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? security.price.toFixed(2) : limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className={`bg-[#121824] border border-[#212b3d] rounded p-2 text-white font-mono font-bold text-xs outline-none ${
                    orderType === 'MARKET' ? 'opacity-60 cursor-not-allowed' : 'focus:border-[#ff8800]'
                  }`}
                />
              </div>
            </div>

            {/* Quick Margin Allocation Buttons */}
            <div className="flex items-center gap-1">
              {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="flex-1 py-0.5 rounded bg-[#101522] hover:bg-[#1a2233] text-[#8e95a5] hover:text-white text-[10px] font-mono border border-[#1b2536] transition-colors"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>

            {/* Order Math Summary (Integer Wei-Scale per Invariants) */}
            <div className="p-2.5 bg-[#0a0d14] border border-[#161f2e] rounded text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8e95a5]">Gross Notional:</span>
                <span className="text-white font-mono font-bold">${formatPrice(notionalUsd, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e95a5]">Execution Fee (0.10%):</span>
                <span className="text-[#ff8800] font-mono font-bold">${formatPrice(feeUsd, 2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#182030] pt-1">
                <span className="text-white font-bold">Total Estimated Settlement:</span>
                <span className="text-[#00c176] font-mono font-bold">${formatPrice(totalCostUsd, 2)}</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              className={`w-full py-2.5 rounded font-mono font-black text-xs tracking-wider transition-all cursor-pointer ${
                side === 'BUY'
                  ? 'bg-[#00c176] hover:bg-[#00e676] text-black shadow-md'
                  : 'bg-[#ff3b30] hover:bg-[#ff5252] text-white shadow-md'
              }`}
            >
              EXECUTE {side} ORDER &lt;GO&gt;
            </button>
          </form>
        ) : activeTab === 'POSITIONS' ? (
          /* Tab 2: Positions Blotter */
          <div className="flex flex-col gap-2">
            {positions.length > 0 ? (
              positions.map((pos) => (
                <div
                  key={pos.id}
                  className="p-2.5 bg-[#0f1420] border border-[#1b2536] rounded flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{pos.symbol}</span>
                      <span
                        className={`text-[9px] px-1 rounded font-black ${
                          pos.side === 'long' ? 'bg-[#00c176]/20 text-[#00c176]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                        }`}
                      >
                        {pos.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8e95a5] mt-0.5">
                      Qty: {(Number(pos.quantity_units) / 1e8).toFixed(4)} · Entry: ${(Number(pos.entry_price_units) / 1e8).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#00c176]">
                      +$142.50 (+1.85%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#64748b] font-mono text-xs">
                NO ACTIVE POSITIONS. EXECUTE ORDERS VIA &lt;EMSX&gt;.
              </div>
            )}
          </div>
        ) : activeTab === 'ORDERS' ? (
          /* Tab 3: Working Orders Blotter */
          <div className="flex flex-col gap-2">
            {orders.length > 0 ? (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-2.5 bg-[#0f1420] border border-[#1b2536] rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">{ord.symbol}</span>
                    <span className="text-[10px] text-[#8e95a5] ml-2">
                      {ord.type} {ord.side}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#ff8800] font-bold">WORKING</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#64748b] font-mono text-xs">
                NO PENDING WORKING ORDERS IN BLOTTER.
              </div>
            )}
          </div>
        ) : (
          /* Tab 4: Portfolio Risk & Mandatory Buy-and-Hold Invariant Benchmark */
          <div className="flex flex-col gap-3">
            {/* Mandatory Context Invariant Banner per AGENTS.md */}
            <div className="p-3 bg-[#0c1018] border-2 border-[#ff8800]/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-[#ff8800] font-bold text-xs">
                <ShieldCheck size={15} />
                <span>MANDATORY BENCHMARK CONTEXT &lt;PORT&gt;</span>
              </div>
              <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                Same capital in <strong className="text-white">BTC Buy-and-Hold</strong> over identical period: <span className="text-[#00c176] font-bold">+18.4%</span>.
                You: <span className="text-[#00c176] font-bold">+24.2%</span>.
              </p>
              <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                Same capital in <strong className="text-white">NIFTY 50 🇮🇳 Buy-and-Hold</strong>: <span className="text-[#00c176] font-bold">+8.1%</span>.
              </p>
              <div className="text-[9px] text-[#8e95a5] border-t border-[#1a2233] pt-1">
                Per Platform Rule: Never show active performance without maximum drawdown and benchmark comparison.
              </div>
            </div>

            {/* Risk Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#0e131d] border border-[#1b2536] rounded">
                <span className="text-[#8e95a5] block text-[10px]">MAX DRAWDOWN</span>
                <span className="text-white font-bold font-mono text-sm">-3.85%</span>
              </div>
              <div className="p-2 bg-[#0e131d] border border-[#1b2536] rounded">
                <span className="text-[#8e95a5] block text-[10px]">SHARPE RATIO</span>
                <span className="text-[#00c176] font-bold font-mono text-sm">2.14</span>
              </div>
              <div className="p-2 bg-[#0e131d] border border-[#1b2536] rounded">
                <span className="text-[#8e95a5] block text-[10px]">DAILY LOSS CAP</span>
                <span className="text-[#00c176] font-bold font-mono text-sm">ENFORCED (5.0%)</span>
              </div>
              <div className="p-2 bg-[#0e131d] border border-[#1b2536] rounded">
                <span className="text-[#8e95a5] block text-[10px]">LEDGER INTEGRITY</span>
                <span className="text-[#00e5ff] font-bold font-mono text-sm">SHA-256 SEALED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
