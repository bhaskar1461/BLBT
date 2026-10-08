import React, { useState } from 'react';
import {
  DollarSign,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  AlertTriangle,
  Clock,
  Server,
} from 'lucide-react';
import { alertsEngine } from '../../services/alertsEngine';
import { formatPrice, getSymbolInfo } from '../../services/symbols';
import { storage } from '../../services/storage';
import { useTradingStore } from '@/stores/useTradingStore';
import { openAlgoGateway } from '@/lib/broker/openalgo';
import type { Portfolio } from '../../types/trading';
import { BenchmarkComparisonBanner } from './BenchmarkComparisonBanner';
import { DailyLossLockBanner } from './DailyLossLockBanner';
import { RevengeTradeWarningBanner } from './RevengeTradeWarningBanner';
import type { DailyLossStatus, RevengeTradeStatus } from '@/lib/lossProtectionService';

interface PaperTradingPanelProps {
  currentSymbol: string;
  currentPrice: number;
  portfolio: Portfolio;
  onOpenBrokerModal?: () => void;
}

export const PaperTradingPanel: React.FC<PaperTradingPanelProps> = ({
  currentSymbol,
  currentPrice,
  portfolio,
  onOpenBrokerModal,
}) => {
  const [activeBroker, setActiveBroker] = useState(() => openAlgoGateway.getActiveBroker());

  React.useEffect(() => {
    return openAlgoGateway.subscribe(() => {
      setActiveBroker(openAlgoGateway.getActiveBroker());
    });
  }, []);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice > 0 ? String(currentPrice) : '');
  const [amount, setAmount] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const user = storage.getUserProfile();
  const featureFlags = storage.getFeatureFlags();
  const isPaperTradingEnabled = featureFlags.paperTradingEnabled !== false && featureFlags.paper_trading !== false;
  const isFrozen = user.status === 'suspended' || (user as { isFrozen?: boolean }).isFrozen === true;

  const { account, resetAccount, fetchAccount } = useTradingStore();

  const [dailyStatus, setDailyStatus] = useState<DailyLossStatus | null>(null);
  const [revengeStatus, setRevengeStatus] = useState<RevengeTradeStatus | null>(null);

  const loadProtectionStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/trade/protection?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.dailyStatus) setDailyStatus(data.dailyStatus);
        if (data?.revengeStatus) setRevengeStatus(data.revengeStatus);
      }
    } catch {}
  }, [user.id]);

  React.useEffect(() => {
    loadProtectionStatus();
  }, [loadProtectionStatus]);

  const symbolInfo = getSymbolInfo(currentSymbol);
  const activePrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const numAmount = parseFloat(amount) || 0;
  const orderTotalUSDT = numAmount * activePrice;
  const feeEstimate = orderTotalUSDT * 0.001; // 0.1% flat fee

  // Percentage quick-calc
  const handleQuickPercent = (pct: number) => {
    if (activePrice <= 0) return;
    const currentBal = account?.balance ?? portfolio.balance;
    const maxFunds = side === 'buy' ? currentBal : currentBal * 0.5;
    const targetUsdt = (maxFunds * pct) / 100;
    const calculatedQty = targetUsdt / activePrice;
    setAmount(calculatedQty.toFixed(symbolInfo.pricePrecision > 2 ? 4 : 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Prompt 5 check: Freeze block
    if (isFrozen) {
      setErrorMsg('Trading Suspended: Your account has been frozen by an administrator. Order rejected.');
      return;
    }

    // 🔒 PROMPT 3.3: Hard Daily Loss Limit Check
    if (dailyStatus?.isLocked) {
      setErrorMsg("Daily loss limit reached. Trading is locked for today. Great traders know when to walk away.");
      return;
    }

    if (revengeStatus?.isCooldownActive) {
      setErrorMsg("5-minute cooldown break is active. Please take a moment away from the screen.");
      return;
    }

    if (!isPaperTradingEnabled) {
      setErrorMsg('Paper Trading is temporarily disabled by platform administration.');
      return;
    }

    if (numAmount <= 0 || activePrice <= 0) return;

    setIsSubmitting(true);

    try {
      // Execute order via server API route
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          symbol: currentSymbol,
          side,
          type: orderType,
          quantity: numAmount,
          price: activePrice,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          userDisplayName: user.displayName,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        const toastHandler = (alertsEngine as unknown as { toastCallback?: (t: string, m: string, y: 'success' | 'alert' | 'info') => void }).toastCallback;
        if (toastHandler) {
          toastHandler(
            orderType === 'limit' ? 'Limit Order Placed' : 'Order Filled',
            data.message || `${orderType.toUpperCase()} ${side.toUpperCase()} for ${numAmount} ${currentSymbol}`,
            'success'
          );
        }
        setAmount('');
        setTakeProfit('');
        setStopLoss('');
        await fetchAccount(user.id);
        await loadProtectionStatus();
      } else {
        const msg = data.error || 'Order execution failed';
        setErrorMsg(msg);
        const toastHandler = (alertsEngine as unknown as { toastCallback?: (t: string, m: string, y: 'success' | 'alert' | 'info') => void }).toastCallback;
        if (toastHandler) {
          toastHandler('Order Rejected', msg, 'alert');
        }
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Network error submitting order to server');
    }
  };

  // Feature Flag: If paper trading is toggled off, show clean Coming Soon state
  if (!isPaperTradingEnabled) {
    return (
      <aside className="terminal-trade-panel p-6 flex flex-col items-center justify-center text-center">
        <Clock size={32} className="text-muted mb-2 animate-pulse" />
        <h3 className="text-sm font-bold text-white">Paper Trading Temporarily Offline</h3>
        <p className="text-xs text-faint mt-1 max-w-xs">
          The paper trading simulation engine has been placed in maintenance by platform administration. Check announcements for updates.
        </p>
      </aside>
    );
  }

  return (
    <aside className="bg-[#131722] border-l border-[#212a36] flex flex-col h-full select-none text-xs">
      {/* Panel Header */}
      <div className="h-8 px-3 border-b border-[#212a36] bg-[#161b22] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <DollarSign size={13} className="text-[#00c176]" />
          <span className="font-semibold text-xs text-white">Order Ticket</span>
          <span className="px-1.5 py-0.2 rounded-[2px] bg-[#00c176]/15 border border-[#00c176]/30 text-[#00c176] text-[9px] font-mono font-bold">
            PAPER
          </span>
        </div>
        <button
          onClick={async () => {
            if (confirm('Reset simulated paper balance back to 10,000.00 USDT?')) {
              await resetAccount(user.id);
            }
          }}
          className="flex items-center gap-1 text-[10px] text-[#787b86] hover:text-[#ff4d4f] transition-colors px-1.5 py-0.5 rounded hover:bg-[#1e222d]"
          title="Reset paper trading funds"
        >
          <RotateCcw size={10} />
          <span>Reset</span>
        </button>
      </div>

      {/* 🚫 CRITICAL FROZEN USER BANNER */}
      {isFrozen && (
        <div className="bg-[#ff4d4f]/15 border-b border-[#ff4d4f]/30 p-2.5 flex items-start gap-2 text-xs text-[#ff4d4f]">
          <Lock size={14} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Trading Privileges Suspended</div>
            <div className="text-[10px] text-white/90 mt-0.5">
              Account frozen by admin. Order submission disabled.
            </div>
          </div>
        </div>
      )}

      {/* 🔒 PROMPT 3.3: DAILY LOSS CIRCUIT BREAKER BANNER */}
      {dailyStatus && <DailyLossLockBanner status={dailyStatus} />}

      {/* ⚠️ PROMPT 3.3: REVENGE TRADE DETECTOR & 5-MIN BREAK BANNER */}
      {revengeStatus && (
        <RevengeTradeWarningBanner
          status={revengeStatus}
          userId={user.id}
          onBreakActivated={loadProtectionStatus}
        />
      )}

      {/* Account Equity Bar */}
      <div className="px-3 py-2 bg-[#161b22]/70 border-b border-[#212a36] flex flex-col gap-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#787b86]">Wallet Equity</span>
          <span className="font-mono font-bold text-white tabular-nums">
            ${account?.formattedEquity ?? formatPrice(portfolio.equity, 2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#787b86]">Avail Balance</span>
          <span className="font-mono text-[#00c176] font-semibold tabular-nums">
            ${account?.formattedBalance ?? formatPrice(portfolio.balance, 2)}
          </span>
        </div>
      </div>

      {/* ₿ PROMPT 3.1: BTC BUY-AND-HOLD BENCHMARK CONTEXT */}
      <div className="p-2 bg-[#131722] border-b border-[#212a36]">
        <BenchmarkComparisonBanner userId={user.id} variant="banner" />
      </div>

      {/* OpenAlgo Execution Gateway Route */}
      <div className="px-3 py-1.5 bg-[#161b22] border-b border-[#212a36] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <Server size={11} className="text-[#2962ff]" />
          <span className="text-[#787b86]">Route:</span>
          <span className="font-semibold text-white">{activeBroker.name}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              activeBroker.isConnected ? 'bg-[#00c176]' : 'bg-[#f59e0b]'
            }`}
          />
        </div>
        {onOpenBrokerModal && (
          <button
            type="button"
            onClick={onOpenBrokerModal}
            className="text-[10px] text-[#2962ff] hover:text-[#5b8cff] font-medium transition-colors cursor-pointer"
          >
            Config
          </button>
        )}
      </div>

      {/* Order Entry Body */}
      <div className="p-3 flex flex-col gap-2.5 overflow-y-auto flex-1">
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-1.5 rounded-[3px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${
              side === 'buy'
                ? 'bg-[#00c176] text-black shadow-none'
                : 'bg-[#161b22] text-[#787b86] hover:text-white border border-[#212a36]'
            }`}
          >
            <ArrowUpRight size={13} />
            <span>BUY</span>
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-1.5 rounded-[3px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${
              side === 'sell'
                ? 'bg-[#ff4d4f] text-white shadow-none'
                : 'bg-[#161b22] text-[#787b86] hover:text-white border border-[#212a36]'
            }`}
          >
            <ArrowDownRight size={13} />
            <span>SELL</span>
          </button>
        </div>

        {/* Order Type Switcher (Market / Limit) */}
        <div className="p-0.5 bg-[#0d1117] rounded-[3px] border border-[#212a36] grid grid-cols-2 text-[11px]">
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className={`py-1 rounded-[2px] font-semibold transition-colors ${
              orderType === 'market'
                ? 'bg-[#1e222d] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderType('limit');
              if (!limitPrice && currentPrice > 0) setLimitPrice(String(currentPrice));
            }}
            className={`py-1 rounded-[2px] font-semibold transition-colors ${
              orderType === 'limit'
                ? 'bg-[#1e222d] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            Limit
          </button>
        </div>

        {/* Inline Error Message */}
        {errorMsg && (
          <div className="p-2 bg-[#ff4d4f]/15 border border-[#ff4d4f]/30 rounded-[3px] text-[11px] text-[#ff4d4f] flex items-start gap-1.5">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {orderType === 'limit' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#787b86]">
                <span>Limit Price</span>
                <span className="font-mono">USDT</span>
              </div>
              <input
                type="number"
                step="any"
                className="w-full bg-[#0d1117] border border-[#212a36] focus:border-[#2962ff] focus:outline-none rounded-[3px] py-1 px-2.5 text-xs font-mono tabular-nums text-white placeholder-[#787b86]"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Target price"
                required
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-[#787b86]">
              <span>Quantity</span>
              <span className="font-mono text-white">{symbolInfo.baseAsset}</span>
            </div>
            <input
              type="number"
              step="any"
              className="w-full bg-[#0d1117] border border-[#212a36] focus:border-[#2962ff] focus:outline-none rounded-[3px] py-1 px-2.5 text-xs font-mono tabular-nums text-white placeholder-[#787b86]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: ${symbolInfo.minQty}`}
              required
              disabled={isFrozen}
            />
          </div>

          {/* Percentage Chips */}
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                disabled={isFrozen}
                className="py-1 text-[10px] font-mono bg-[#161b22] border border-[#212a36] hover:border-[#2962ff] text-[#787b86] hover:text-white rounded-[2px] transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* TP / SL Target Inputs */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-[#787b86]">
                <span>Take Profit</span>
                <span className="text-[#00c176] font-mono">USDT</span>
              </div>
              <input
                type="number"
                step="any"
                className="w-full bg-[#0d1117] border border-[#212a36] focus:border-[#00c176] focus:outline-none rounded-[3px] py-1 px-2 text-xs font-mono tabular-nums text-white placeholder-[#787b86]"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="TP Price"
                disabled={isFrozen}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-[#787b86]">
                <span>Stop Loss</span>
                <span className="text-[#ff4d4f] font-mono">USDT</span>
              </div>
              <input
                type="number"
                step="any"
                className="w-full bg-[#0d1117] border border-[#212a36] focus:border-[#ff4d4f] focus:outline-none rounded-[3px] py-1 px-2 text-xs font-mono tabular-nums text-white placeholder-[#787b86]"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="SL Price"
                disabled={isFrozen}
              />
            </div>
          </div>

          {/* Execution Engine Notice */}
          {orderType === 'limit' && (
            <div className="text-[10px] text-[#787b86] bg-[#161b22] p-1.5 rounded-[3px] border border-[#212a36] flex items-start gap-1.5">
              <Clock size={11} className="text-[#2962ff] mt-0.5 shrink-0" />
              <span>
                Limit fills and TP/SL evaluate against live market price ticks.
              </span>
            </div>
          )}

          {/* Order Cost & 0.1% Fee Live Calculation */}
          <div className="bg-[#161b22] p-2 rounded-[3px] border border-[#212a36] flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-[#787b86]">Est. Cost:</span>
              <span className="font-mono font-semibold text-white tabular-nums">
                ${formatPrice(orderTotalUSDT, 2)} USDT
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#787b86]">
              <span>Fee (0.1%):</span>
              <span className="font-mono tabular-nums">${formatPrice(feeEstimate, 4)} USDT</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              numAmount <= 0 ||
              isFrozen ||
              Boolean(dailyStatus?.isLocked) ||
              Boolean(revengeStatus?.isCooldownActive)
            }
            className={`py-2 rounded-[3px] text-xs font-bold uppercase tracking-wider transition-colors ${
              side === 'buy'
                ? 'bg-[#00c176] hover:bg-[#00a866] text-black'
                : 'bg-[#ff4d4f] hover:bg-[#e03a3d] text-white'
            } ${
              numAmount <= 0 || isFrozen || dailyStatus?.isLocked || revengeStatus?.isCooldownActive
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {isFrozen
              ? 'TRADING FROZEN'
              : dailyStatus?.isLocked
              ? 'DAILY LIMIT REACHED'
              : revengeStatus?.isCooldownActive
              ? '5-MIN BREAK ACTIVE'
              : `${side === 'buy' ? 'BUY' : 'SELL'} ${symbolInfo.baseAsset}`}
          </button>
        </form>
      </div>
    </aside>
  );
};
