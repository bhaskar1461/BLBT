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
  Server,
  Activity,
} from 'lucide-react';
import { formatPrice, getSymbolInfo } from '../../services/symbols';
import { useTradingStore } from '@/stores/useTradingStore';
import { useChartStore } from '@/stores/useChartStore';
import { openAlgoGateway } from '@/lib/broker/openalgo';
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
  onToggleMarketOverview?: () => void;
  isMarketOverviewOpen?: boolean;
  onOpenBrokerModal?: () => void;
}

export const PositionsAndOrders: React.FC<PositionsAndOrdersProps> = ({
  positions: legacyPositions = [],
  orders: legacyOrders = [],
  currentPrice,
  onToggleMarketOverview,
  isMarketOverviewOpen,
  onOpenBrokerModal,
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
  const [activeBroker, setActiveBroker] = useState(() => openAlgoGateway.getActiveBroker());

  useEffect(() => {
    initAccount();
  }, [initAccount]);

  useEffect(() => {
    return openAlgoGateway.subscribe(() => {
      setActiveBroker(openAlgoGateway.getActiveBroker());
    });
  }, []);

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
      {/* Top Dock Header (Authentic TradingView Style) */}
      <div className="h-8 bg-[#171b26] border-b border-[#2a2e39] flex items-center justify-between px-3 select-none shrink-0 overflow-x-auto text-xs text-[#787b86]">
        {/* Left: Trading Title & Navigation Tabs */}
        <div className="flex items-center gap-1 min-w-max">
          <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#2a2e39] text-[#089981] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#089981]" />
            <span className="tracking-tight font-semibold text-white">Trading Panel</span>
          </div>

          {/* OpenAlgo Active Gateway Status Pill */}
          <button
            onClick={onOpenBrokerModal}
            className="flex items-center gap-1.5 px-2 py-0.5 mr-1.5 rounded-[4px] bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[11px] transition-colors group cursor-pointer"
            title="Configure execution gateway via OpenAlgo (Zerodha, Upstox, Dhan, Paper)"
          >
            <Server size={11} className="text-[#2962ff]" />
            <span className="text-[#787b86]">Gateway:</span>
            <span className="font-semibold text-white group-hover:text-[#2962ff]">
              {activeBroker?.name || 'Celsius Paper'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeBroker?.isConnected ? 'bg-[#089981] animate-pulse' : 'bg-[#f59e0b]'
              }`}
            />
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('positions');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'positions' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <span>Positions</span>
            <span className="px-1.5 py-0.2 rounded bg-[#131722] text-[#d1d4dc] text-[10px] font-mono">
              {displayPositions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('orders');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'orders' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <span>Open Orders</span>
            <span className="px-1.5 py-0.2 rounded bg-[#131722] text-[#d1d4dc] text-[10px] font-mono">
              {openOrdersCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('history');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'history' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <span>Trade History</span>
            <span className="px-1.5 py-0.2 rounded bg-[#131722] text-[#d1d4dc] text-[10px] font-mono">
              {historyOrdersCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('holdings');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'holdings' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <PieChart size={12} className="text-[#089981]" />
            <span>Holdings</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomTab('transactions');
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'transactions' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <BookOpen size={11} />
            <span>Ledger</span>
            <span className="px-1.5 py-0.2 rounded bg-[#131722] text-[#d1d4dc] text-[10px] font-mono">
              {transactions.length}
            </span>
          </button>

          {/* OpenAlgo Market Depth (DOM) Tab */}
          <button
            onClick={() => {
              setActiveBottomTab('depth' as any);
              if (isDockCollapsed) toggleDock();
            }}
            className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-colors ${
              (activeBottomTab as string) === 'depth' && !isDockCollapsed
                ? 'bg-[#1e222d] text-white border border-[#2a2e39]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
            }`}
          >
            <Activity size={12} className="text-[#2962ff]" />
            <span>Market Depth</span>
          </button>
        </div>

        {/* Right: Live Financial Metric Pills & Collapse Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs min-w-max ml-2">
          {/* Account Balance */}
          <div className="flex items-center gap-1 text-[#787b86] hidden md:flex">
            <span>Bal:</span>
            <span className="font-mono font-bold text-white">${displayBalance}</span>
          </div>

          {/* Wallet Equity */}
          <div className="flex items-center gap-1.5 bg-[#089981]/10 border border-[#089981]/30 px-2 py-0.5 rounded-[4px]">
            <Wallet size={12} className="text-[#089981]" />
            <span className="text-[#787b86]">Equity:</span>
            <span className="font-mono font-bold text-[#089981]">${displayEquity}</span>
          </div>

          {/* BTC Buy-and-Hold Truth Benchmark Pill (Prompt 3.1) */}
          <BenchmarkComparisonBanner userId={user.id} variant="pill" className="hidden sm:flex" />

          {/* Optional Market Overview Ticker Button */}
          {onToggleMarketOverview && (
            <button
              onClick={onToggleMarketOverview}
              className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium transition-colors border ${
                isMarketOverviewOpen
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
                  : 'bg-[#1e222d] text-[#787b86] hover:text-white border-[#2a2e39]'
              }`}
              title="Toggle Market Overview Ticker"
            >
              <span>{isMarketOverviewOpen ? 'Hide Markets' : 'Markets Overview'}</span>
            </button>
          )}

          {/* Reset Account Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-[#787b86] hover:text-[#f23645] transition-colors px-1.5 py-0.5 rounded hover:bg-[#1e222d]"
            title="Reset paper account to 10,000 USDT"
          >
            <RotateCcw size={11} />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={toggleDock}
            className="p-1 rounded hover:bg-[#1e222d] text-[#787b86] hover:text-white transition-colors"
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
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#212A36] bg-[#161B22] text-[10px] text-[#787b86] uppercase tracking-wider">
                    <th className="py-1.5 px-3 font-semibold">Symbol</th>
                    <th className="py-1.5 px-3 font-semibold">Side</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Size</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Entry Price</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Mark Price</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Margin</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Unrealized P&L</th>
                    <th className="py-1.5 px-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212A36]/60 font-mono text-[11px]">
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

          {/* TAB: CRYPTO HOLDINGS & PORTFOLIO ALLOCATION */}
          {activeBottomTab === 'holdings' && (
            <div className="w-full flex flex-col h-full overflow-y-auto">
              {/* Compact Terminal Account Summary Strip */}
              <div className="bg-[#131722] border-b border-[#212a36] px-3 py-1.5 flex flex-wrap items-center justify-between text-xs gap-y-1 select-none shrink-0">
                <div className="flex items-center divide-x divide-[#212a36] text-[11px] overflow-x-auto">
                  <div className="pr-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Equity:</span>
                    <span className="font-mono font-bold text-white tabular-nums">${displayEquity}</span>
                  </div>
                  <div className="px-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Cash:</span>
                    <span className="font-mono font-semibold text-[#00c176] tabular-nums">${displayAvailable}</span>
                  </div>
                  <div className="px-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Margin:</span>
                    <span className="font-mono text-white tabular-nums">{displayMargin}</span>
                  </div>
                  <div className="px-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Unrealized:</span>
                    <span className="font-mono text-[#00c176] font-semibold tabular-nums">+$35,455.00 (+6.82%)</span>
                  </div>
                  <div className="px-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Realized:</span>
                    <span className="font-mono text-[#00c176] font-semibold tabular-nums">+${((account?.balance ?? 10000) - 10000 >= 0 ? '' : '-')}{Math.abs((account?.balance ?? 10000) - 10000).toFixed(2)}</span>
                  </div>
                  <div className="pl-3 flex items-center gap-1.5">
                    <span className="text-[#787b86] uppercase font-semibold">Day P&L:</span>
                    <span className="font-mono text-[#00c176] font-semibold tabular-nums">+$4,280.00 (+0.78%)</span>
                  </div>
                </div>

                {/* Compact Asset Allocation Ribbon */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#787b86]">
                  <div className="w-24 h-1.5 rounded-[2px] overflow-hidden flex bg-black/50" title="Asset Allocation">
                    <div style={{ width: '48.8%' }} className="bg-[#f7931a]" title="BTC 48.8%" />
                    <div style={{ width: '25.2%' }} className="bg-[#627eea]" title="ETH 25.2%" />
                    <div style={{ width: '12.3%' }} className="bg-[#14f195]" title="SOL 12.3%" />
                    <div style={{ width: '6.6%' }} className="bg-[#f3ba2f]" title="BNB 6.6%" />
                    <div style={{ width: '3.1%' }} className="bg-[#e84142]" title="AVAX 3.1%" />
                    <div style={{ width: '10.1%' }} className="bg-[#26a17b]" title="USDT 10.1%" />
                  </div>
                  <span className="text-[#d1d4dc]">5 Assets + USDT</span>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#212a36] bg-[#161b22] text-[10px] uppercase font-semibold text-[#787b86] tracking-wider sticky top-0">
                      <th className="py-1.5 px-3">Asset</th>
                      <th className="py-1.5 px-3 text-right">Holdings</th>
                      <th className="py-1.5 px-3 text-right">Avg Entry</th>
                      <th className="py-1.5 px-3 text-right">Market Price</th>
                      <th className="py-1.5 px-3 text-right">Value (USDT)</th>
                      <th className="py-1.5 px-3 text-right">Unrealized P&L</th>
                      <th className="py-1.5 px-3 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212a36]/60 font-mono text-xs">
                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#f7931a]/20 text-[#f7931a] flex items-center justify-center font-bold text-[10px]">₿</span>
                        <span>Bitcoin (BTC)</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">4.25000000</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$62,800.00</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">${formatPrice(currentPrice > 0 ? currentPrice : 66200, 2)}</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$281,350.00</td>
                      <td className="py-1.5 px-3 text-right text-[#00c176] font-semibold tabular-nums">+$14,450.00 (+5.41%)</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">48.8%</td>
                    </tr>

                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#627eea]/20 text-[#627eea] flex items-center justify-center font-bold text-[10px]">⟠</span>
                        <span>Ethereum (ETH)</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">42.00000000</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$3,220.00</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">$3,450.00</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$144,900.00</td>
                      <td className="py-1.5 px-3 text-right text-[#00c176] font-semibold tabular-nums">+$9,660.00 (+7.14%)</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">25.2%</td>
                    </tr>

                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#14f195]/20 text-[#14f195] flex items-center justify-center font-bold text-[10px]">◎</span>
                        <span>Solana (SOL)</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">450.00000000</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$140.00</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">$158.00</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$71,100.00</td>
                      <td className="py-1.5 px-3 text-right text-[#00c176] font-semibold tabular-nums">+$8,100.00 (+12.86%)</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">12.3%</td>
                    </tr>

                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#f3ba2f]/20 text-[#f3ba2f] flex items-center justify-center font-bold text-[10px]">🟡</span>
                        <span>BNB</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">65.00000000</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$560.00</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">$585.00</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$38,025.00</td>
                      <td className="py-1.5 px-3 text-right text-[#00c176] font-semibold tabular-nums">+$1,625.00 (+4.46%)</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">6.6%</td>
                    </tr>

                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#e84142]/20 text-[#e84142] flex items-center justify-center font-bold text-[10px]">🔺</span>
                        <span>Avalanche (AVAX)</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">600.00000000</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$26.80</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">$29.50</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$17,700.00</td>
                      <td className="py-1.5 px-3 text-right text-[#00c176] font-semibold tabular-nums">+$1,620.00 (+10.07%)</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">3.1%</td>
                    </tr>

                    <tr className="hover:bg-[#1e222d]/50 transition-colors">
                      <td className="py-1.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#26a17b]/20 text-[#26a17b] flex items-center justify-center font-bold text-[10px]">💵</span>
                        <span>USDT Liquid Cash</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">58,380.00</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">$1.00</td>
                      <td className="py-1.5 px-3 text-right text-white tabular-nums">$1.00</td>
                      <td className="py-1.5 px-3 text-right text-white font-semibold tabular-nums">$58,380.00</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">—</td>
                      <td className="py-1.5 px-3 text-right text-[#787b86] tabular-nums">10.1%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#212a36] bg-[#161b22] font-semibold font-mono text-xs">
                      <td className="py-2 px-3 text-white font-sans">Total Holdings</td>
                      <td className="py-2 px-3 text-right text-[#787b86]">—</td>
                      <td className="py-2 px-3 text-right text-[#787b86]">—</td>
                      <td className="py-2 px-3 text-right text-[#787b86]">—</td>
                      <td className="py-2 px-3 text-right text-white font-bold tabular-nums">${displayEquity} USDT</td>
                      <td className="py-2 px-3 text-right text-[#00c176] tabular-nums">+$35,455.00</td>
                      <td className="py-2 px-3 text-right text-white tabular-nums">100.0%</td>
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
          {/* TAB: OPENALGO MARKET DEPTH (DOM) */}
          {(activeBottomTab as string) === 'depth' && (() => {
            const activeSymbol = useChartStore.getState().activeSymbol || 'BTCUSDT';
            const depth = openAlgoGateway.getMarketDepth(activeSymbol, currentPrice || 83000);

            return (
              <div className="p-4 space-y-3 max-w-2xl">
                <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-[#2962ff]" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">
                      OpenAlgo 5-Level Market Depth (DOM) — {activeSymbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#089981] font-bold">Buy Pressure: {depth.buyPressurePercent}%</span>
                    <span className="text-[#787b86]">|</span>
                    <span className="text-[#f23645] font-bold">Sell Pressure: {100 - depth.buyPressurePercent}%</span>
                  </div>
                </div>

                {/* Pressure bar */}
                <div className="w-full h-1.5 bg-[#f23645]/40 rounded-full overflow-hidden flex">
                  <div className="bg-[#089981] h-full transition-all" style={{ width: `${depth.buyPressurePercent}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  {/* Bids */}
                  <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-2.5">
                    <div className="text-[10px] text-[#089981] font-bold uppercase mb-1.5 border-b border-[#2a2e39] pb-1">
                      Buy Orders (Bids) • Total: {depth.totalBuyQty.toLocaleString()}
                    </div>
                    <div className="grid grid-cols-3 text-[10px] text-[#787b86] pb-1">
                      <span>Orders</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right text-[#089981]">Price</span>
                    </div>
                    <div className="divide-y divide-[#2a2e39]/40">
                      {depth.levels.map((l, i) => (
                        <div key={i} className="grid grid-cols-3 py-1">
                          <span className="text-[#787b86]">{l.bidOrders}</span>
                          <span className="text-right text-white">{l.bidQty}</span>
                          <span className="text-right font-bold text-[#089981]">${formatPrice(l.bidPrice, 2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Asks */}
                  <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-2.5">
                    <div className="text-[10px] text-[#f23645] font-bold uppercase mb-1.5 border-b border-[#2a2e39] pb-1">
                      Sell Orders (Asks) • Total: {depth.totalSellQty.toLocaleString()}
                    </div>
                    <div className="grid grid-cols-3 text-[10px] text-[#787b86] pb-1">
                      <span className="text-[#f23645]">Price</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Orders</span>
                    </div>
                    <div className="divide-y divide-[#2a2e39]/40">
                      {depth.levels.map((l, i) => (
                        <div key={i} className="grid grid-cols-3 py-1">
                          <span className="font-bold text-[#f23645]">${formatPrice(l.askPrice, 2)}</span>
                          <span className="text-right text-white">{l.askQty}</span>
                          <span className="text-right text-[#787b86]">{l.askOrders}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
