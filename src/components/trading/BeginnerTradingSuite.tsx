'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  AlertCircle,
  X,
  Play,
  Award,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { TiltCard3D } from '@/components/3d/TiltCard3D';

const HolographicCoin = dynamic(
  () => import('@/components/3d/HolographicCoin').then((m) => m.HolographicCoin),
  {
    ssr: false,
    loading: () => (
      <div className="w-[180px] h-[180px] rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-sm text-amber-400 font-bold animate-pulse">
        CRYPTO 3D
      </div>
    ),
  }
);
import { useTradingStore } from '@/stores/useTradingStore';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { formatPrice } from '@/services/symbols';
import { storage } from '@/services/storage';
import { fromBaseUnits } from '@/lib/tradeUnits';

interface BeginnerTradingSuiteProps {
  onSwitchToPro: () => void;
}

export const BeginnerTradingSuite: React.FC<BeginnerTradingSuiteProps> = ({
  onSwitchToPro,
}) => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);
  const tickers = useWatchlistStore((s) => s.tickers);
  const candles = useChartStore((s) => s.candles);

  const account = useTradingStore((s) => s.account);
  const positions = useTradingStore((s) => s.positions);
  const fetchAccount = useTradingStore((s) => s.fetchAccount);

  const user = storage.getUserProfile();

  // Beginner State
  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [selectedDirection, setSelectedDirection] = useState<'buy' | 'sell'>('buy');
  const [isExecuting, setIsExecuting] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const [successTrade, setSuccessTrade] = useState<{
    symbol: string;
    direction: 'buy' | 'sell';
    amount: number;
    price: number;
  } | null>(null);

  // Coins Available for Beginners
  const beginnerCoins = [
    {
      symbol: 'BTCUSDT',
      coin: 'BTC' as const,
      name: 'Bitcoin',
      description: 'The digital gold standard. Macro crypto leader.',
      badge: 'Most Popular',
    },
    {
      symbol: 'ETHUSDT',
      coin: 'ETH' as const,
      name: 'Ethereum',
      description: 'The world computer powering smart contracts & apps.',
      badge: 'DeFi Standard',
    },
    {
      symbol: 'SOLUSDT',
      coin: 'SOL' as const,
      name: 'Solana',
      description: 'High-speed blockchain with sub-second finality.',
      badge: 'High Momentum',
    },
  ];

  const currentCoinConfig = beginnerCoins.find((c) => c.symbol === activeSymbol) || beginnerCoins[0];
  const ticker = tickers[activeSymbol];
  const currentPrice = ticker?.lastPrice ?? (candles[candles.length - 1]?.close ?? 83000);
  const priceChange = ticker?.priceChangePercent ?? 0;

  // Account virtual balance
  const balanceUsdt = account ? account.balance : 10000;

  // Calculations for simulated trade
  const estimatedQuantity = currentPrice > 0 ? tradeAmount / currentPrice : 0;
  const maxProtectedLoss = tradeAmount * 0.01; // 1% stop loss
  const potentialProfit5Pct = tradeAmount * 0.05;

  const currentPositionsForCoin = positions.filter((p) => p.symbol === activeSymbol);

  // Execute Beginner 1-Click Practice Trade
  const handleExecuteTrade = async () => {
    if (isExecuting || currentPrice <= 0) return;
    setIsExecuting(true);

    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          symbol: activeSymbol,
          side: selectedDirection,
          type: 'market',
          quantity: estimatedQuantity,
          price: currentPrice,
          takeProfit:
            selectedDirection === 'buy'
              ? currentPrice * 1.05
              : currentPrice * 0.95,
          stopLoss:
            selectedDirection === 'buy'
              ? currentPrice * 0.99
              : currentPrice * 1.01,
          userDisplayName: user.displayName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAccount(user.id);
        setSuccessTrade({
          symbol: activeSymbol,
          direction: selectedDirection,
          amount: tradeAmount,
          price: currentPrice,
        });
      } else {
        alert(data.error || 'Failed to execute practice order');
      }
    } catch (err) {
      console.error('Beginner order failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Close active practice position
  const handleClosePosition = async (posId: string) => {
    setClosingId(posId);
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
      } else {
        alert(data.error || 'Failed to close position');
      }
    } catch {
      alert('Network error closing position');
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-8 space-y-8">
      {/* 1. Header Bar: Beginner Mode Banner & Pro Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-subtle shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bull/15 border border-bull/30 flex items-center justify-center text-bull">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                Simple Practice Mode
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bull/20 text-bull border border-bull/40">
                100% Risk Free
              </span>
            </div>
            <p className="text-xs text-muted">
              Designed for new traders. Practice in real Binance spot markets with automatic 1% risk shields.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowAcademyModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-subtle text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span>Trading 101</span>
          </button>

          <button
            onClick={onSwitchToPro}
            className="px-3.5 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-primary/20"
          >
            <Zap size={14} />
            <span>Switch to Pro Terminal</span>
          </button>
        </div>
      </div>

      {/* 2. Core Interactive Area: 3D Hologram + 1-Click Trade Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Coin Hologram & Market Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-subtle p-6 flex flex-col items-center justify-center text-center shadow-xl">
            {/* Interactive 3D Coin */}
            <div className="my-2 z-10">
              <HolographicCoin
                symbol={currentCoinConfig.coin}
                size={180}
                interactive={true}
                showRings={true}
              />
            </div>

            <div className="z-10 space-y-1 mt-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  {currentCoinConfig.name}
                </h2>
                <span className="text-xs font-mono text-faint uppercase px-2 py-0.5 rounded bg-white/5 border border-subtle">
                  {currentCoinConfig.symbol}
                </span>
              </div>
              <p className="text-xs text-muted max-w-xs">
                {currentCoinConfig.description}
              </p>
            </div>

            {/* Live Price Display */}
            <div className="mt-4 z-10 flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  priceChange >= 0
                    ? 'bg-bull/15 text-bull border border-bull/30'
                    : 'bg-bear/15 text-bear border border-bear/30'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)}% (24h)
              </span>
            </div>

            {/* Coin Picker Chips */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 z-10">
              {beginnerCoins.map((c) => {
                const isSelected = c.symbol === activeSymbol;
                return (
                  <button
                    key={c.symbol}
                    onClick={() => setActiveSymbol(c.symbol)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-canvas border-subtle text-muted hover:text-white hover:border-muted'
                    }`}
                  >
                    <div>{c.coin}</div>
                    <div className="text-[10px] font-normal text-faint truncate">
                      {c.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Account Balance Card */}
          <div className="p-4 rounded-xl bg-surface border border-subtle flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-muted block text-[11px]">Your Virtual Practice Balance</span>
              <span className="text-white text-base font-bold">
                ${balanceUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              Full $10k Ready
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Simple Trade Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-surface border border-subtle p-6 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-subtle pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Step 1: Choose Your Practice Amount
                </h3>
                <p className="text-xs text-muted">
                  How many virtual dollars do you want to practice with?
                </p>
              </div>
              <span className="text-xs font-mono text-faint">Virtual Paper Dollars</span>
            </div>

            {/* Quick Amount Selector Chips */}
            <div className="grid grid-cols-4 gap-2.5">
              {[25, 50, 100, 250].map((amt) => {
                const isSelected = tradeAmount === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => setTradeAmount(amt)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-mono font-bold text-sm transition-all ${
                      isSelected
                        ? 'bg-bull/20 border-bull text-white shadow-sm shadow-bull/20 scale-[1.02]'
                        : 'bg-canvas border-subtle text-muted hover:text-white hover:border-muted'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted font-mono">Or enter amount:</span>
              <div className="relative flex-1 max-w-[160px]">
                <span className="absolute left-3 top-2 text-xs font-mono text-muted">$</span>
                <input
                  type="number"
                  min="5"
                  max="5000"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(5, Number(e.target.value) || 5))}
                  className="w-full bg-canvas border border-subtle rounded-xl py-1.5 pl-7 pr-3 text-xs font-mono text-white focus:outline-none focus:border-primary"
                />
              </div>
              <span className="text-xs text-faint font-mono">
                ≈ {estimatedQuantity.toFixed(4)} {currentCoinConfig.coin}
              </span>
            </div>

            {/* Step 2: Choose Prediction (Long vs Short) */}
            <div className="space-y-3 pt-2 border-t border-subtle">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Step 2: What is your prediction?
                </h3>
                <p className="text-xs text-muted">
                  Pick whether you think the price will go up or down.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Buy / Rise Option */}
                <TiltCard3D maxTilt={6}>
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('buy')}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      selectedDirection === 'buy'
                        ? 'bg-bull/15 border-bull text-white shadow-lg shadow-bull/10'
                        : 'bg-canvas border-subtle text-muted hover:text-white hover:border-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-extrabold text-sm text-bull">
                        <TrendingUp size={18} />
                        <span>PRICE WILL RISE</span>
                      </div>
                      {selectedDirection === 'buy' && (
                        <CheckCircle2 size={16} className="text-bull" />
                      )}
                    </div>
                    <div className="text-xs text-zinc-300 font-medium">Go Long (Buy)</div>
                    <div className="text-[11px] text-faint mt-1">
                      You earn money if {currentCoinConfig.name} price goes up from here.
                    </div>
                  </button>
                </TiltCard3D>

                {/* Sell / Fall Option */}
                <TiltCard3D maxTilt={6}>
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('sell')}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      selectedDirection === 'sell'
                        ? 'bg-bear/15 border-bear text-white shadow-lg shadow-bear/10'
                        : 'bg-canvas border-subtle text-muted hover:text-white hover:border-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-extrabold text-sm text-bear">
                        <TrendingDown size={18} />
                        <span>PRICE WILL DROP</span>
                      </div>
                      {selectedDirection === 'sell' && (
                        <CheckCircle2 size={16} className="text-bear" />
                      )}
                    </div>
                    <div className="text-xs text-zinc-300 font-medium">Go Short (Sell)</div>
                    <div className="text-[11px] text-faint mt-1">
                      You earn money if {currentCoinConfig.name} price drops from here.
                    </div>
                  </button>
                </TiltCard3D>
              </div>
            </div>

            {/* The Honest Safety Shield Guarantee */}
            <div className="p-4 rounded-xl bg-bull/5 border border-bull/20 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-bull font-bold">
                <ShieldCheck size={16} />
                <span>Celsius Auto-Safety Shield Active</span>
              </div>
              <p className="text-muted leading-relaxed">
                Your maximum potential loss on this trade is capped at{' '}
                <strong className="text-white">${maxProtectedLoss.toFixed(2)} (1%)</strong>.
                If the market moves against you, our automated protective order will exit safely.
                You can never get liquidated.
              </p>
            </div>

            {/* Step 3: What-If Live Simulator */}
            <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-2 text-xs">
              <span className="font-mono text-faint uppercase text-[10px] block">
                Live Scenario Simulator:
              </span>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-2.5 rounded-lg bg-surface border border-subtle">
                  <span className="text-muted block text-[11px]">If Market Moves +5%</span>
                  <span className="text-bull font-bold text-sm">
                    +${potentialProfit5Pct.toFixed(2)} Profit
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-subtle">
                  <span className="text-muted block text-[11px]">If Market Moves -5%</span>
                  <span className="text-zinc-300 font-bold text-sm">
                    -${maxProtectedLoss.toFixed(2)} (Shielded)
                  </span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={isExecuting}
              className={`w-full py-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                selectedDirection === 'buy'
                  ? 'bg-bull hover:bg-bull/90 text-black shadow-bull/20'
                  : 'bg-bear hover:bg-bear/90 text-white shadow-bear/20'
              }`}
            >
              {isExecuting ? (
                <span>Executing Practice Trade...</span>
              ) : (
                <>
                  <span>
                    Execute 1-Click Practice Trade (${tradeAmount} on {currentCoinConfig.coin})
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Active Practice Positions (If Any Exist) */}
      {currentPositionsForCoin.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Award size={16} className="text-primary" />
              <span>Your Active Practice Trades</span>
            </h3>
            <span className="text-xs font-mono text-muted">
              {currentPositionsForCoin.length} trade active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPositionsForCoin.map((pos) => {
              const entry = fromBaseUnits(pos.entry_price_units);
              const qty = fromBaseUnits(pos.quantity_units);
              const priceDiff = currentPrice - entry;
              const pnl = pos.side === 'long' ? priceDiff * qty : -priceDiff * qty;
              const pnlPct = entry > 0 ? (priceDiff / entry) * 100 * (pos.side === 'long' ? 1 : -1) : 0;
              const isProfit = pnl >= 0;

              return (
                <div
                  key={pos.id}
                  className="p-4 rounded-xl bg-surface border border-subtle flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{pos.symbol}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          pos.side === 'long'
                            ? 'bg-bull/15 text-bull border border-bull/30'
                            : 'bg-bear/15 text-bear border border-bear/30'
                        }`}
                      >
                        {pos.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-faint">
                      Bought at: {formatPrice(entry)} • Quantity: {qty.toFixed(4)}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isProfit ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {isProfit ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                    </div>
                    <button
                      onClick={() => handleClosePosition(pos.id)}
                      disabled={closingId === pos.id}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-white border border-subtle transition-colors"
                    >
                      {closingId === pos.id ? 'Closing...' : 'Close Trade'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Trading 101 Modal for Beginners */}
      {showAcademyModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Trading 101: The Plain English Guide
                  </h3>
                  <span className="text-xs text-muted">Zero Jargon. How Markets Really Work.</span>
                </div>
              </div>
              <button
                onClick={() => setShowAcademyModal(false)}
                className="text-faint hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-muted leading-relaxed">
              <div className="p-3 rounded-xl bg-canvas border border-subtle space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-bull" />
                  <span>1. What is "Going Long"?</span>
                </div>
                <p>
                  Going Long simply means buying an asset because you believe its price will rise.
                  If you buy Bitcoin at $80,000 and it climbs to $84,000, you made a +5% profit.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-canvas border border-subtle space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-bear" />
                  <span>2. What is "Going Short"?</span>
                </div>
                <p>
                  Going Short allows you to profit when prices crash. You borrow at a high price and buy back lower.
                  If Bitcoin drops -5%, you make +5% profit.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-canvas border border-subtle space-y-1">
                <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>3. Why do 90% of beginners lose money?</span>
                </div>
                <p>
                  Retail casino brokers tempt users with 50x-100x leverage and encourage frantic daily trading
                  to collect commissions. A 1% market wiggle wipes them out.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bull/10 border border-bull/20 space-y-1 text-bull">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>4. How Celsius protects you:</span>
                </div>
                <p className="text-zinc-300">
                  Every trade here has an enforced 1% risk shield. We hold up the Buy-and-Hold mirror,
                  charge zero commissions, and will never sell you hope.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAcademyModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
            >
              Got It, Let Me Practice
            </button>
          </div>
        </div>
      )}

      {/* 5. Success Trade Modal */}
      {successTrade && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md w-full p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-bull/20 border border-bull/40 text-bull flex items-center justify-center mx-auto shadow-lg shadow-bull/20">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                Practice Order Executed!
              </h3>
              <p className="text-xs text-muted">
                Your virtual order for ${successTrade.amount} of {successTrade.symbol} was filled against live Binance prices.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-subtle text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-faint">Executed Price:</span>
                <span className="text-white font-bold">{formatPrice(successTrade.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Direction:</span>
                <span className={successTrade.direction === 'buy' ? 'text-bull font-bold' : 'text-bear font-bold'}>
                  {successTrade.direction.toUpperCase()} ({successTrade.direction === 'buy' ? 'Long' : 'Short'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Auto-Stop Protection:</span>
                <span className="text-emerald-400 font-bold">1% Max Loss Shield Active</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessTrade(null)}
              className="w-full py-3 rounded-xl bg-bull hover:bg-bull/90 text-black font-extrabold text-xs"
            >
              View Active Trade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
