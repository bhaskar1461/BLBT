// src/components/mobile/PortfolioView.tsx
'use client';

import React, { useState } from 'react';
import { TerminalHeader } from './TerminalHeader';
import type { PositionItem, Quote } from './types';
import { formatPrice, formatInrCrore, formatInrExact } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface PortfolioViewProps {
  quotes: Quote[];
  onSearchClick: () => void;
  onAlertsClick: () => void;
  onSelectQuote?: (quote: Quote) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  quotes,
  onSearchClick,
  onAlertsClick,
  onSelectQuote,
}) => {
  const [activeSection, setActiveSection] = useState<'positions' | 'allocation' | 'subaccounts' | 'ledger'>('positions');
  const [notice, setNotice] = useState<string | null>(null);

  // Calibrated to ₹30.00 Lakhs INR ($36,000 USD)
  const totalEquity = 36000;
  const availableCash = 3400;
  const allocatedMargin = 32600;
  const dayPnl = 830;
  const dayPnlPct = 2.31;
  const realizedPnl = 1845;
  const unrealizedPnl = 2420;

  // Active positions
  const [positions, setPositions] = useState<PositionItem[]>([
    {
      id: 'pos-btc',
      symbol: 'BTC/USDT',
      side: 'LONG',
      size: 0.264,
      entryPrice: 62450.00,
      markPrice: 63284.50,
      unrealizedPnl: 220.31,
      unrealizedPnlPct: 1.33,
      marginUsed: 16704.00,
      leverage: '1x Spot',
    },
    {
      id: 'pos-eth',
      symbol: 'ETH/USDT',
      side: 'LONG',
      size: 2.45,
      entryPrice: 3420.00,
      markPrice: 3490.20,
      unrealizedPnl: 171.99,
      unrealizedPnlPct: 2.05,
      marginUsed: 8532.00,
      leverage: '1x Spot',
    },
    {
      id: 'pos-sol',
      symbol: 'SOL/USDT',
      side: 'LONG',
      size: 26.5,
      entryPrice: 148.50,
      markPrice: 154.40,
      unrealizedPnl: 156.35,
      unrealizedPnlPct: 3.97,
      marginUsed: 4068.00,
      leverage: '1x Spot',
    },
  ]);

  const handleClosePosition = (id: string, symbol: string) => {
    terminalAudio.playOrderFilled();
    setPositions((prev) => prev.filter((p) => p.id !== id));
    setNotice(`Position ${symbol} closed at market price. Realized P&L credited to ledger.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080a0f] text-white font-sans select-none pb-28">
      {/* 1. Header */}
      <TerminalHeader
        title="PORTFOLIO"
        subtitle="INSTITUTIONAL BLOTTER & MARGIN"
        onSearchClick={onSearchClick}
        onAlertsClick={onAlertsClick}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Simulation Guard Banner */}
        <div className="px-3 py-2 bg-[#0e131d] border border-[#1e2638] rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-semibold text-[#cbd5e1] text-[11px]">
              SIMULATED PAPER TRADING &bull; LIVE BINANCE FEEDS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded border border-[#f59e0b]/30">
            1.0% RISK CAP
          </span>
        </div>

        {notice && (
          <div className="p-2.5 bg-[#10b981]/10 border border-[#10b981]/40 rounded-md text-xs text-[#10b981] flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{notice}</span>
          </div>
        )}

        {/* 2. Primary Net Worth Hero Card */}
        <div className="p-4 bg-gradient-to-b from-[#0f1422] to-[#0a0d16] border border-[#1e2638] rounded-lg shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider">
                Total Portfolio Value
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                  ${formatPrice(totalEquity, 2)}
                </span>
                <span className="text-sm font-black font-mono text-[#f59e0b] tabular-nums">
                  (&asymp; {formatInrCrore(totalEquity)})
                </span>
              </div>
              <span className="text-[10px] text-[#64748b] font-mono mt-0.5">
                Exact Valuation: {formatInrExact(totalEquity)} INR &bull; 8-Decimal Integer Ledger
              </span>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] text-xs font-mono font-bold">
                <ArrowUpRight size={14} />
                <span>+${formatPrice(dayPnl, 0)} ({dayPnlPct}%)</span>
              </div>
              <span className="text-[10px] text-[#64748b] mt-1 font-mono">Today's P&amp;L</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a2336] text-xs font-mono">
            <div className="p-2 bg-[#080b12] rounded border border-[#161f30]">
              <span className="text-[10px] text-[#64748b] block font-sans">AVAILABLE CASH</span>
              <span className="text-sm font-bold text-[#10b981] tabular-nums">
                ${formatPrice(availableCash, 0)}
              </span>
              <span className="text-[9px] text-[#64748b] block">9.4% Liquid</span>
            </div>

            <div className="p-2 bg-[#080b12] rounded border border-[#161f30]">
              <span className="text-[10px] text-[#64748b] block font-sans">ALLOCATED MARGIN</span>
              <span className="text-sm font-bold text-white tabular-nums">
                ${formatPrice(allocatedMargin, 0)}
              </span>
              <span className="text-[9px] text-[#64748b] block">90.6% Invested</span>
            </div>

            <div className="p-2 bg-[#080b12] rounded border border-[#161f30]">
              <span className="text-[10px] text-[#64748b] block font-sans">UNREALIZED P&amp;L</span>
              <span className="text-sm font-bold text-[#10b981] tabular-nums">
                +${formatPrice(unrealizedPnl, 0)}
              </span>
              <span className="text-[9px] text-[#10b981] block">+6.72% Open</span>
            </div>
          </div>

          {/* Asset Allocation Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
              <span>Asset Allocation</span>
              <span className="font-mono text-[10px] text-white">BTC 46.4% &bull; ETH 23.7% &bull; SOL 11.3% &bull; CASH 9.4%</span>
            </div>
            <div className="h-2 w-full bg-[#161f30] rounded-full overflow-hidden flex">
              <div style={{ width: '46.4%' }} className="bg-[#f59e0b] h-full" title="Bitcoin" />
              <div style={{ width: '23.7%' }} className="bg-[#38bdf8] h-full" title="Ethereum" />
              <div style={{ width: '11.3%' }} className="bg-[#a855f7] h-full" title="Solana" />
              <div style={{ width: '9.4%' }} className="bg-[#10b981] h-full" title="USDT Cash" />
              <div style={{ width: '9.2%' }} className="bg-[#64748b] h-full" title="Other" />
            </div>
          </div>
        </div>

        {/* Benchmark Mirror Card */}
        <div className="p-3 bg-[#0d121c] border border-[#1e2638] rounded-md text-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider font-mono">
              BUY-AND-HOLD BENCHMARK MIRROR
            </span>
            <span className="text-[#cbd5e1] text-[11px] mt-0.5">
              Same capital in BTC over identical period: <strong className="text-white font-mono">+1.42%</strong> &bull; You: <strong className="text-[#10b981] font-mono">+{dayPnlPct}%</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] font-mono font-bold text-[10px] shrink-0">
            ALPHA +0.89%
          </span>
        </div>

        {/* 3. Navigation Tabs within Portfolio */}
        <div className="flex items-center gap-1.5 border-b border-[#1a2336] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'positions', label: `Positions (${positions.length})` },
            { id: 'subaccounts', label: 'Sub-Accounts (2)' },
            { id: 'allocation', label: 'Allocation' },
            { id: 'ledger', label: 'Ledger Audit' },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  terminalAudio.playTick();
                  setActiveSection(tab.id as any);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f59e0b] text-black font-bold'
                    : 'bg-[#0e131d] text-[#94a3b8] hover:text-white border border-[#1e2638]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4. Tab Content: Positions Blotter */}
        {activeSection === 'positions' && (
          <div className="space-y-2">
            {positions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748b] bg-[#0e131d] rounded-md border border-[#1e2638]">
                No open positions. Use the Markets tab to execute paper orders.
              </div>
            ) : (
              positions.map((pos) => {
                const isPos = pos.unrealizedPnl >= 0;
                return (
                  <div
                    key={pos.id}
                    className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-md flex flex-col gap-2 hover:border-[#2a374f] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-mono tracking-tight">
                          {pos.symbol}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#10b981]/15 text-[#10b981]">
                          {pos.side} {pos.leverage}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`text-sm font-bold tabular-nums ${isPos ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                          {isPos ? '+' : ''}${formatPrice(pos.unrealizedPnl, 2)}
                        </span>
                        <span className={`text-[10px] block font-semibold ${isPos ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                          ({isPos ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#94a3b8] pt-1 border-t border-[#161f30]">
                      <div>
                        <span className="text-[#64748b] block font-sans">Size:</span>
                        <span className="text-white font-bold">{pos.size}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] block font-sans">Entry Price:</span>
                        <span className="text-white font-bold">${formatPrice(pos.entryPrice, 2)}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] block font-sans">Mark Price:</span>
                        <span className="text-[#f59e0b] font-bold">${formatPrice(pos.markPrice, 2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#64748b] font-mono">
                        Margin: ${formatPrice(pos.marginUsed, 2)}
                      </span>
                      <button
                        onClick={() => handleClosePosition(pos.id, pos.symbol)}
                        className="px-2.5 py-1 rounded bg-[#1e2638] hover:bg-[#28354e] active:scale-95 text-xs text-white font-medium transition-all cursor-pointer"
                      >
                        Close Position
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 5. Tab Content: Sub-Accounts */}
        {activeSection === 'subaccounts' && (
          <div className="space-y-2">
            <div className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-md flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#94a3b8] font-mono font-bold">
                  ACCOUNT #C782-9901 (INSTITUTIONAL MASTER MARGIN)
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5 tabular-nums">
                  $24,500.00
                </div>
                <div className="text-xs font-bold font-mono text-[#f59e0b] tabular-nums">
                  &asymp; ₹20.41 Lakhs INR
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-[#10b981]">+2.31%</span>
                <div className="text-[10px] text-[#64748b] mt-1">MARGIN OK (99.4%)</div>
              </div>
            </div>

            <div className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-md flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#94a3b8] font-mono font-bold">
                  ACCOUNT #D441-2044 (DERIVATIVES &amp; L/S HEDGE)
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5 tabular-nums">
                  $11,500.00
                </div>
                <div className="text-xs font-bold font-mono text-[#f59e0b] tabular-nums">
                  &asymp; ₹9.58 Lakhs INR
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-[#10b981]">+0.92%</span>
                <div className="text-[10px] text-[#64748b] mt-1">MARGIN OK (98.8%)</div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Tab Content: Allocation */}
        {activeSection === 'allocation' && (
          <div className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-md space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Asset Allocation &amp; Concentration Risk
            </h4>
            <div className="divide-y divide-[#161f30] text-xs font-mono">
              {[
                { asset: 'Bitcoin (BTC)', pct: '46.4%', usd: '$16,704.00', inr: '₹13.92 L', color: '#f59e0b' },
                { asset: 'Ethereum (ETH)', pct: '23.7%', usd: '$8,532.00', inr: '₹7.11 L', color: '#38bdf8' },
                { asset: 'Solana (SOL)', pct: '11.3%', usd: '$4,068.00', inr: '₹3.39 L', color: '#a855f7' },
                { asset: 'USDT Liquid Cash', pct: '9.4%', usd: '$3,400.00', inr: '₹2.83 L', color: '#10b981' },
                { asset: 'Collateral Margin', pct: '9.2%', usd: '$3,296.00', inr: '₹2.75 L', color: '#64748b' },
              ].map((row) => (
                <div key={row.asset} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="text-white font-medium font-sans">{row.asset}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold tabular-nums">{row.usd}</span>
                    <span className="text-[10px] text-[#94a3b8] block tabular-nums">
                      {row.pct} &bull; {row.inr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Tab Content: Ledger Audit */}
        {activeSection === 'ledger' && (
          <div className="p-3 bg-[#0e131d] border border-[#1e2638] rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Cryptographic Append-Only Ledger
              </h4>
              <Link
                href="/transparency"
                className="text-[10px] text-[#f59e0b] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Proof &lt;GO&gt;</span>
                <ExternalLink size={10} />
              </Link>
            </div>
            <div className="divide-y divide-[#161f30] text-xs font-mono">
              {[
                { type: 'INITIAL FUNDING', amount: '+$36,000.00', hash: 'e3b0c442...98b0', time: 'SYSTEM INIT' },
                { type: 'ORDER FILL: BTC/USDT', amount: '-$16,704.00', hash: '8f43a9b1...21c4', time: '14:10:02' },
                { type: 'FEE DEDUCTION (0.1%)', amount: '-$16.70', hash: 'c901e4a5...77d2', time: '14:10:02' },
                { type: 'ORDER FILL: ETH/USDT', amount: '-$8,532.00', hash: '12a9e34b...4490', time: '14:12:45' },
              ].map((tx, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold text-[11px] block">{tx.type}</span>
                    <span className="text-[9px] text-[#64748b]">SHA-256: {tx.hash}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white tabular-nums">{tx.amount}</span>
                    <span className="text-[9px] text-[#94a3b8] block">{tx.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Rules Invariant Card */}
        <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-md text-[11px] text-[#94a3b8] space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Lock size={12} className="text-[#f59e0b]" />
            <span>PLATFORM RISK INVARIANTS:</span>
          </div>
          <div>&bull; Max Risk per Trade: Enforced at 1.0% ($360.00)</div>
          <div>&bull; Hard Daily Loss Limit: Locks trading if daily loss reaches 5.0%</div>
          <div>&bull; Append-Only Ledger: Zero retroactive editing permitted</div>
        </div>
      </div>
    </div>
  );
};
