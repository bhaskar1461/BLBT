'use client';
import React, { useEffect, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  X,
  Wallet,
  DollarSign,
  ShieldAlert,
  RotateCcw,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  PieChart,
} from 'lucide-react';
import { formatPrice, getSymbolInfo } from '../../services/symbols';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';
import { fromBaseUnits, formatBaseUnits } from '@/lib/tradeUnits';
import { formatInrCrore } from '@/lib/utils';
import type { Position, Order, ClosedTradeRecord } from '../../types/trading';
import type { PaperOrderRecord } from '@/lib/paperTradingService';
import { ShareTradeModal } from './ShareTradeModal';
import { BenchmarkComparisonBanner } from './BenchmarkComparisonBanner';

interface PositionsAndOrdersProps {
  positions?: Position[];
  orders?: Order[];
  currentPrice: number;
}

export const PositionsAndOrders: React.FC<PositionsAndOrdersProps> = ({
  positions: legacyPositions = [],
  orders: legacyOrders = [],
  currentPrice,
}) => {
  const [selectedTradeForShare, setSelectedTradeForShare] = useState<ClosedTradeRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [closingPosId, setClosingPosId] = useState<string | null>(null);

  const {
    account,
    positions: storePositions,
    orders: storeOrders,
    transactions,
    activeBottomTab,
    setActiveBottomTab,
    isDockCollapsed,
    toggleDock,
    resetAccount,
    initAccount,
    fetchAccount,
  } = useTradingStore();

  const user = storage.getUserProfile();

  useEffect(() => {
    initAccount();
  }, [initAccount]);

  const handleReset = async () => {
    if (window.confirm('Reset simulated paper balance back to 10,000.00 USDT? This will close all positions and log an immutable reset transaction.')) {
      await resetAccount();
    }
  };

  const handleClosePosition = async (posId: string) => {
    setClosingPosId(posId);
    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({
          action: 'close_position',
          positionId: posId,
          userDisplayName: user.displayName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAccount(user.id);
        if (data.closedTrade) {
          setSelectedTradeForShare(data.closedTrade);
          setIsShareModalOpen(true);
        }
      } else {
        alert(data.error || 'Failed to close position');
      }
    } catch {
      alert('Network error closing position');
    } finally {
      setClosingPosId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ action: 'cancel_order', orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAccount(user.id);
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch {
      alert('Network error cancelling order');
    }
  };

  const handleShareTradeHistory = (ord: PaperOrderRecord) => {
    const qty = fromBaseUnits(ord.amount_units);
    const price = fromBaseUnits(ord.price_units);
    const fee = fromBaseUnits(ord.fee_units);
    const cost = fromBaseUnits(ord.total_cost_units);
    const fakeTrade: ClosedTradeRecord = {
      id: ord.id,
      userId: user.id,
      userDisplayName: user.displayName,
      symbol: ord.symbol,
      side: ord.side === 'buy' ? 'long' : 'short',
      entryPrice: price,
      exitPrice: price * 1.05,
      quantity: qty,
      margin: cost,
      realizedPnl: cost * 0.05,
      realizedPnlPct: 5.0,
      fee,
      durationSeconds: 3600,
      durationFormatted: '1h 00m',
      openedAt: ord.created_at,
      closedAt: ord.filled_at || ord.created_at,
    };
    setSelectedTradeForShare(fakeTrade);
    setIsShareModalOpen(true);
  };

  // Balance and equity metrics
  const displayBalance = account?.formattedBalance ?? '10,000.00';
  const displayEquity = account?.formattedEquity ?? '10,000.00';
  const displayAvailable = account?.formattedAvailableFunds ?? '10,000.00';
  const displayMargin = account?.margin ? `$${formatPrice(account.margin, 2)}` : '$0.00';

  // Merge store positions and fallback legacy positions
  const displayPositions = storePositions.length > 0 ? storePositions : legacyPositions.map((p) => ({
    id: p.id,
    user_id: 'usr_bhaskar_sharma',
    account_id: 'acc_demo',
    symbol: p.symbol,
    side: p.side,
    quantity_units: Math.round((p.size || 0) * 100_000_000).toString(),
    entry_price_units: Math.round((p.entryPrice || 0) * 100_000_000).toString(),
    margin_units: Math.round((p.margin || 0) * 100_000_000).toString(),
    realized_pnl_units: '0',
    opened_at: p.openedAt ? new Date(p.openedAt).toISOString() : new Date().toISOString(),
    updated_at: p.openedAt ? new Date(p.openedAt).toISOString() : new Date().toISOString(),
  }));

  const openOrdersCount = storeOrders.filter((o) => o.status === 'open').length + legacyOrders.filter((o) => o.status === 'open').length;
  const historyOrdersCount = storeOrders.filter((o) => o.status !== 'open').length + legacyOrders.filter((o) => o.status !== 'open').length;

  return (
    <div
      id="trading-tab-panel"
      className={`bottom-dock border-t border-subtle bg-canvas flex flex-col transition-all duration-200 ${
        isDockCollapsed ? 'h-9 min-h-[36px]' : 'h-64 min-h-[220px]'
      }`}
      style={{ zIndex: 15 }}
    >
      {/* Top Dock Header (TradingView Style) */}
      <div className="h-9 bg-card border-b border-subtle flex items-center justify-between px-3 select-none shrink-0 overflow-x-auto text-xs">
        {/* Left: Trading Title & Navigation Tabs */}
        <div className="flex items-center gap-1 min-w-max">
          <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-subtle text-primary font-bold">
            <DollarSign size={14} className="text-bull" />
            <span className="hidden sm:inline tracking-tight font-semibold">Trading Panel</span>
            <span className="badge badge-bull text-[9px] px-1.5 py-0 font-mono font-bold tracking-tight">
              ₹4.80 Cr PORTFOLIO
            </span>
          </div>

          <button
            onClick={() => {
              setActiveBottomTab('positions');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'positions' && !isDockCollapsed
                ? 'bg-elevated text-primary border border-cardborder'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Positions</span>
            <span className="badge badge-neutral text-[10px] px-1">
              {displayPositions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('holdings');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'holdings' && !isDockCollapsed
                ? 'bg-elevated text-bull border border-bull/40 shadow-sm shadow-bull/10'
                : 'text-muted hover:text-main'
            }`}
          >
            <PieChart size={12} className="text-bull" />
            <span>Holdings</span>
            <span className="badge bg-bull/15 text-bull border border-bull/30 text-[10px] px-1 font-mono font-bold">
              ₹4.80 Cr
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('orders');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'orders' && !isDockCollapsed
                ? 'bg-elevated text-primary border border-cardborder'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Open Orders</span>
            <span className="badge badge-neutral text-[10px] px-1">
              {openOrdersCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('history');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'history' && !isDockCollapsed
                ? 'bg-elevated text-primary border border-cardborder'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>Trade History</span>
            <span className="badge badge-neutral text-[10px] px-1">
              {historyOrdersCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('transactions');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'transactions' && !isDockCollapsed
                ? 'bg-elevated text-primary border border-cardborder'
                : 'text-muted hover:text-main'
            }`}
          >
            <BookOpen size={11} />
            <span>Ledger</span>
            <span className="badge badge-neutral text-[10px] px-1">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* Right: Live Financial Metric Pills & Collapse Toggle */}
        <div className="flex items-center gap-3 text-xs min-w-max ml-2">
          {/* Account Balance */}
          <div className="flex items-center gap-1 text-faint hidden md:flex">
            <span>Balance:</span>
            <span className="font-mono font-bold text-main">${displayBalance}</span>
          </div>

          {/* Wallet Equity */}
          <div className="flex items-center gap-1.5 bg-bull/10 border border-bull/30 px-2 py-0.5 rounded">
            <Wallet size={12} className="text-bull" />
            <span className="text-faint">Equity:</span>
            <span className="font-mono font-bold text-bull">${displayEquity}</span>
            <span className="text-[10px] bg-bull/20 text-bull font-mono font-bold px-1 rounded">
              ₹4.80 Cr
            </span>
          </div>

          {/* BTC Buy-and-Hold Truth Benchmark Pill (Prompt 3.1) */}
          <BenchmarkComparisonBanner userId={user.id} variant="pill" className="hidden sm:flex" />

          {/* Available Funds */}
          <div className="flex items-center gap-1 text-faint hidden sm:flex">
            <span>Available:</span>
            <span className="font-mono font-semibold text-main">${displayAvailable}</span>
          </div>

          {/* Reset Account Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-faint hover:text-bear transition-colors px-1.5 py-0.5 rounded hover:bg-elevated"
            title="Reset paper account to 10,000 USDT"
          >
            <RotateCcw size={11} />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={toggleDock}
            className="p-1 rounded hover:bg-elevated text-faint hover:text-main transition-colors"
            title={isDockCollapsed ? 'Expand Trading Panel' : 'Collapse Trading Panel'}
          >
            {isDockCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Bottom Dock Content Area */}
      {!isDockCollapsed && (
        <div className="flex-1 overflow-auto bg-canvas">
          {/* TAB 1: POSITIONS */}
          {activeBottomTab === 'positions' && (
            <div className="w-full overflow-x-auto">
              <div className="p-3 pb-1">
                <BenchmarkComparisonBanner userId={user.id} variant="banner" />
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-subtle bg-card/50 text-[11px] text-faint">
                    <th className="py-2 px-3 font-medium">Symbol</th>
                    <th className="py-2 px-3 font-medium">Side</th>
                    <th className="py-2 px-3 font-medium text-right">Size</th>
                    <th className="py-2 px-3 font-medium text-right">Entry Price</th>
                    <th className="py-2 px-3 font-medium text-right">Mark Price</th>
                    <th className="py-2 px-3 font-medium text-right">Margin (USDT)</th>
                    <th className="py-2 px-3 font-medium text-right">Unrealized P&L</th>
                    <th className="py-2 px-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle font-mono">
                  {displayPositions.map((pos) => {
                    const info = getSymbolInfo(pos.symbol);
                    const qty = fromBaseUnits(pos.quantity_units);
                    const entryPrice = fromBaseUnits(pos.entry_price_units);
                    const markPrice = currentPrice > 0 ? currentPrice : entryPrice;
                    const margin = fromBaseUnits(pos.margin_units);

                    const priceDiff = pos.side === 'long' ? markPrice - entryPrice : entryPrice - markPrice;
                    const unrealizedPnl = priceDiff * qty;
                    const unrealizedPnlPct = margin > 0 ? (unrealizedPnl / margin) * 100 : 0;
                    const isProfit = unrealizedPnl >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-card/40 transition-colors">
                        <td className="py-2 px-3 font-bold font-sans text-main">{pos.symbol}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`badge text-[10px] px-1.5 py-0.5 ${
                              pos.side === 'long' ? 'badge-bull' : 'badge-bear'
                            }`}
                          >
                            {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-main">
                          {qty.toFixed(4)} {info.baseAsset}
                        </td>
                        <td className="py-2 px-3 text-right text-muted">
                          ${formatPrice(entryPrice, info.pricePrecision)}
                        </td>
                        <td className="py-2 px-3 text-right text-main">
                          ${formatPrice(markPrice, info.pricePrecision)}
                        </td>
                        <td className="py-2 px-3 text-right text-muted">
                          ${formatPrice(margin, 2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-semibold ${isProfit ? 'text-bull' : 'text-bear'}`}>
                            {isProfit ? '+' : ''}${formatPrice(unrealizedPnl, 2)} ({isProfit ? '+' : ''}
                            {unrealizedPnlPct.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleClosePosition(pos.id)}
                            disabled={closingPosId === pos.id}
                            className="btn px-2.5 py-0.5 text-[11px] bg-elevated hover:bg-bear/20 hover:border-bear/40 border border-cardborder rounded text-main hover:text-bear transition-all font-semibold"
                          >
                            {closingPosId === pos.id ? 'Closing...' : 'Close'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {displayPositions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-faint font-sans">
                        <div className="flex flex-col items-center gap-1.5">
                          <DollarSign size={20} className="text-muted/40" />
                          <p className="text-sm">No open positions</p>
                          <p className="text-[11px] text-faint">
                            Use the Paper Trading panel to submit a simulated order at live Binance prices.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: CRYPTO HOLDINGS (4.8 Cr Multi-Asset Breakdown) */}
          {activeBottomTab === 'holdings' && (
            <div className="w-full p-4 flex flex-col gap-4">
              {/* Top Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card border border-bull/30 p-3 rounded-lg">
                  <div className="text-[10px] text-faint uppercase font-bold tracking-wider">Total Portfolio Net Worth</div>
                  <div className="text-lg font-bold font-mono text-bull mt-0.5">₹4.80 Crore</div>
                  <div className="text-[11px] font-mono text-muted">$576,000.00 USDT</div>
                </div>

                <div className="bg-card border border-subtle p-3 rounded-lg">
                  <div className="text-[10px] text-faint uppercase font-bold tracking-wider">Active Crypto Allocation</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">₹4.31 Crore</div>
                  <div className="text-[11px] font-mono text-muted">$517,620.00 (89.9%)</div>
                </div>

                <div className="bg-card border border-subtle p-3 rounded-lg">
                  <div className="text-[10px] text-faint uppercase font-bold tracking-wider">Liquid Margin Cash</div>
                  <div className="text-lg font-bold font-mono text-main mt-0.5">₹48.65 Lakh</div>
                  <div className="text-[11px] font-mono text-muted">$58,380.00 USDT (10.1%)</div>
                </div>

                <div className="bg-card border border-bull/30 p-3 rounded-lg">
                  <div className="text-[10px] text-faint uppercase font-bold tracking-wider">Total Realized Profit</div>
                  <div className="text-lg font-bold font-mono text-bull mt-0.5">+₹63.67 Lakh</div>
                  <div className="text-[11px] font-mono text-bull font-bold">+$76,400.00 (+15.28%)</div>
                </div>
              </div>

              {/* Visual Asset Allocation Bar */}
              <div className="flex flex-col gap-1.5 bg-card border border-subtle p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Asset Allocation Distribution</span>
                  <span className="text-faint font-mono text-[11px]">5 Cryptocurrencies + Cash Reserves</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/40">
                  <div style={{ width: '48.8%' }} className="bg-[#f7931a]" title="Bitcoin 48.8%" />
                  <div style={{ width: '25.2%' }} className="bg-[#627eea]" title="Ethereum 25.2%" />
                  <div style={{ width: '12.3%' }} className="bg-[#14f195]" title="Solana 12.3%" />
                  <div style={{ width: '6.6%' }} className="bg-[#f3ba2f]" title="BNB 6.6%" />
                  <div style={{ width: '3.1%' }} className="bg-[#e84142]" title="Avalanche 3.1%" />
                  <div style={{ width: '10.1%' }} className="bg-[#26a17b]" title="USDT Cash 10.1%" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted font-mono mt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f7931a]" /> BTC 48.8%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#627eea]" /> ETH 25.2%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#14f195]" /> SOL 12.3%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f3ba2f]" /> BNB 6.6%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e84142]" /> AVAX 3.1%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#26a17b]" /> USDT 10.1%</span>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto border border-subtle rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-subtle bg-card/60 text-[11px] text-faint">
                      <th className="py-2.5 px-3 font-medium">Asset</th>
                      <th className="py-2.5 px-3 font-medium text-right">Holdings</th>
                      <th className="py-2.5 px-3 font-medium text-right">Avg Entry</th>
                      <th className="py-2.5 px-3 font-medium text-right">Market Price</th>
                      <th className="py-2.5 px-3 font-medium text-right">Value (USDT)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Value (INR)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Unrealized P&L</th>
                      <th className="py-2.5 px-3 font-medium text-right">Portfolio %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50 font-mono">
                    <tr className="hover:bg-card/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#f7931a]/20 text-[#f7931a] flex items-center justify-center font-bold text-xs">₿</span>
                        <span>Bitcoin (BTC)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">4.25000000 BTC</td>
                      <td className="py-2.5 px-3 text-right text-muted">$62,800.00</td>
                      <td className="py-2.5 px-3 text-right text-white">${formatPrice(currentPrice > 0 ? currentPrice : 66200, 2)}</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">$281,350.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">₹2.34 Crore</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">+$14,450.00 (+5.41%)</td>
                      <td className="py-2.5 px-3 text-right text-muted">48.8%</td>
                    </tr>

                    <tr className="hover:bg-card/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#627eea]/20 text-[#627eea] flex items-center justify-center font-bold text-xs">⟠</span>
                        <span>Ethereum (ETH)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">42.00000000 ETH</td>
                      <td className="py-2.5 px-3 text-right text-muted">$3,220.00</td>
                      <td className="py-2.5 px-3 text-right text-white">$3,450.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">$144,900.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">₹1.21 Crore</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">+$9,660.00 (+7.14%)</td>
                      <td className="py-2.5 px-3 text-right text-muted">25.2%</td>
                    </tr>

                    <tr className="hover:bg-card/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#14f195]/20 text-[#14f195] flex items-center justify-center font-bold text-xs">◎</span>
                        <span>Solana (SOL)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">450.00000000 SOL</td>
                      <td className="py-2.5 px-3 text-right text-muted">$140.00</td>
                      <td className="py-2.5 px-3 text-right text-white">$158.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">$71,100.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">₹59.25 Lakh</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">+$8,100.00 (+12.86%)</td>
                      <td className="py-2.5 px-3 text-right text-muted">12.3%</td>
                    </tr>

                    <tr className="hover:bg-card/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#f3ba2f]/20 text-[#f3ba2f] flex items-center justify-center font-bold text-xs">🟡</span>
                        <span>BNB</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">65.00000000 BNB</td>
                      <td className="py-2.5 px-3 text-right text-muted">$560.00</td>
                      <td className="py-2.5 px-3 text-right text-white">$585.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">$38,025.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">₹31.69 Lakh</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">+$1,625.00 (+4.46%)</td>
                      <td className="py-2.5 px-3 text-right text-muted">6.6%</td>
                    </tr>

                    <tr className="hover:bg-card/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#e84142]/20 text-[#e84142] flex items-center justify-center font-bold text-xs">🔺</span>
                        <span>Avalanche (AVAX)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">600.00000000 AVAX</td>
                      <td className="py-2.5 px-3 text-right text-muted">$26.80</td>
                      <td className="py-2.5 px-3 text-right text-white">$29.50</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">$17,700.00</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">₹14.75 Lakh</td>
                      <td className="py-2.5 px-3 text-right text-bull font-bold">+$1,620.00 (+10.07%)</td>
                      <td className="py-2.5 px-3 text-right text-muted">3.1%</td>
                    </tr>

                    <tr className="hover:bg-card/40 bg-card/20">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#26a17b]/20 text-[#26a17b] flex items-center justify-center font-bold text-xs">💵</span>
                        <span>USDT Liquid Cash</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">58,380.00 USDT</td>
                      <td className="py-2.5 px-3 text-right text-muted">$1.00</td>
                      <td className="py-2.5 px-3 text-right text-white">$1.00</td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">$58,380.00</td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">₹48.65 Lakh</td>
                      <td className="py-2.5 px-3 text-right text-faint">Cash Reserve</td>
                      <td className="py-2.5 px-3 text-right text-muted">10.1%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-subtle bg-black/40 font-bold font-mono">
                      <td className="py-3 px-3 text-white font-sans">Total Holdings</td>
                      <td className="py-3 px-3 text-right text-faint">—</td>
                      <td className="py-3 px-3 text-right text-faint">—</td>
                      <td className="py-3 px-3 text-right text-faint">—</td>
                      <td className="py-3 px-3 text-right text-bull text-sm">$576,000.00 USDT</td>
                      <td className="py-3 px-3 text-right text-bull text-sm">₹4.80 Crore</td>
                      <td className="py-3 px-3 text-right text-bull">+₹63.67 Lakh</td>
                      <td className="py-3 px-3 text-right text-white">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: OPEN ORDERS */}
          {activeBottomTab === 'orders' && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-subtle bg-card/50 text-[11px] text-faint">
                    <th className="py-2 px-3 font-medium">Symbol</th>
                    <th className="py-2 px-3 font-medium">Side</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium text-right">Target Price</th>
                    <th className="py-2 px-3 font-medium text-right">Amount</th>
                    <th className="py-2 px-3 font-medium text-right">Total Cost</th>
                    <th className="py-2 px-3 font-medium text-right">Time</th>
                    <th className="py-2 px-3 font-medium text-center">Cancel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle font-mono">
                  {storeOrders.filter((o) => o.status === 'open').map((ord) => (
                    <tr key={ord.id} className="hover:bg-card/40 transition-colors">
                      <td className="py-2 px-3 font-bold font-sans text-main">{ord.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`badge text-[10px] ${ord.side === 'buy' ? 'badge-bull' : 'badge-bear'}`}>
                          {ord.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted">{ord.type.toUpperCase()}</td>
                      <td className="py-2 px-3 text-right text-main">
                        ${formatPrice(fromBaseUnits(ord.price_units), 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-main">
                        {fromBaseUnits(ord.amount_units).toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right text-muted">
                        ${formatPrice(fromBaseUnits(ord.total_cost_units), 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-faint text-[11px]">
                        {new Date(ord.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="btn btn-icon p-1 text-faint hover:text-bear"
                          title="Cancel pending order"
                        >
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {storeOrders.filter((o) => o.status === 'open').length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-faint font-sans">
                        No pending limit orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TRADE HISTORY */}
          {activeBottomTab === 'history' && (
            <div className="w-full overflow-x-auto">
              <div className="p-3 pb-1">
                <BenchmarkComparisonBanner userId={user.id} variant="banner" />
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-subtle bg-card/50 text-[11px] text-faint">
                    <th className="py-2 px-3 font-medium">Symbol</th>
                    <th className="py-2 px-3 font-medium">Side</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium text-right">Fill Price</th>
                    <th className="py-2 px-3 font-medium text-right">Amount</th>
                    <th className="py-2 px-3 font-medium text-right">Total (USDT)</th>
                    <th className="py-2 px-3 font-medium text-right">Fee (0.1%)</th>
                    <th className="py-2 px-3 font-medium text-center">Status</th>
                    <th className="py-2 px-3 font-medium text-center">Share</th>
                    <th className="py-2 px-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle font-mono">
                  {storeOrders.filter((o) => o.status !== 'open').map((ord) => (
                    <tr key={ord.id} className="hover:bg-card/40 transition-colors">
                      <td className="py-2 px-3 font-bold font-sans text-main">{ord.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`badge text-[10px] ${ord.side === 'buy' ? 'badge-bull' : 'badge-bear'}`}>
                          {ord.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted">{ord.type.toUpperCase()}</td>
                      <td className="py-2 px-3 text-right text-main">
                        ${formatPrice(fromBaseUnits(ord.price_units), 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-main">
                        {fromBaseUnits(ord.amount_units).toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right text-muted">
                        ${formatPrice(fromBaseUnits(ord.total_cost_units), 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-faint">
                        ${formatPrice(fromBaseUnits(ord.fee_units), 4)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="badge badge-bull text-[9px] px-1 py-0">
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleShareTradeHistory(ord)}
                          className="btn p-1 text-[11px] text-faint hover:text-bull rounded hover:bg-elevated transition-colors"
                          title="Generate Share Card"
                        >
                          <Share2 size={13} />
                        </button>
                      </td>
                      <td className="py-2 px-3 text-right text-faint text-[11px]">
                        {new Date(ord.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {storeOrders.filter((o) => o.status !== 'open').length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-faint font-sans">
                        No trade history recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: IMMUTABLE TRANSACTION LEDGER */}
          {activeBottomTab === 'transactions' && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-subtle bg-card/50 text-[11px] text-faint">
                    <th className="py-2 px-3 font-medium">Tx ID</th>
                    <th className="py-2 px-3 font-medium">Ledger Type</th>
                    <th className="py-2 px-3 font-medium text-right">Delta (USDT)</th>
                    <th className="py-2 px-3 font-medium text-right">Balance After</th>
                    <th className="py-2 px-3 font-medium">Symbol / Notes</th>
                    <th className="py-2 px-3 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle font-mono">
                  {transactions.map((tx) => {
                    const deltaUnits = BigInt(tx.amount_units || '0');
                    const isPositive = deltaUnits >= 0n;
                    const deltaStr = formatBaseUnits(deltaUnits, 2);
                    const balAfterStr = formatBaseUnits(tx.balance_after_units || '0', 2);

                    return (
                      <tr key={tx.id} className="hover:bg-card/40 transition-colors">
                        <td className="py-2 px-3 text-faint text-[11px] truncate max-w-[120px]" title={tx.id}>
                          {tx.id}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span className="badge badge-neutral text-[10px]">
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-semibold ${isPositive ? 'text-bull' : 'text-bear'}`}>
                            {isPositive ? '+' : ''}${deltaStr}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-main">
                          ${balAfterStr}
                        </td>
                        <td className="py-2 px-3 text-faint font-sans text-[11px]">
                          {tx.symbol || (tx.details as { description?: string })?.description || 'Virtual paper transaction'}
                        </td>
                        <td className="py-2 px-3 text-right text-faint text-[11px]">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-faint font-sans">
                        Ledger initialized. All transactions will append here immutably.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Share Trade Modal */}
      <ShareTradeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trade={selectedTradeForShare}
      />
    </div>
  );
};
