import React, { useState } from 'react';
import {
  DollarSign,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { alertsEngine } from '../../services/alertsEngine';
import { formatPrice, getSymbolInfo } from '../../services/symbols';
import { storage } from '../../services/storage';
import { useTradingStore } from '@/stores/useTradingStore';
import type { Portfolio } from '../../types/trading';
import { BenchmarkComparisonBanner } from './BenchmarkComparisonBanner';
import { DailyLossLockBanner } from './DailyLossLockBanner';
import { RevengeTradeWarningBanner } from './RevengeTradeWarningBanner';
import type { DailyLossStatus, RevengeTradeStatus } from '@/lib/lossProtectionService';

interface PaperTradingPanelProps {
  currentSymbol: string;
  currentPrice: number;
  portfolio: Portfolio;
}

export const PaperTradingPanel: React.FC<PaperTradingPanelProps> = ({
  currentSymbol,
  currentPrice,
  portfolio,
}) => {
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
    <aside className="terminal-trade-panel">
      {/* Panel Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <DollarSign size={15} color="var(--bull)" />
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
            Paper Trading
          </span>
          <span className="badge badge-bull" style={{ fontSize: '10px' }}>
            SIMULATED
          </span>
        </div>
        <button
          className="btn"
          onClick={async () => {
            if (confirm('Reset simulated paper balance back to 10,000.00 USDT?')) {
              await resetAccount(user.id);
            }
          }}
          style={{ padding: '3px 8px', fontSize: '11px', gap: '4px' }}
          title="Reset paper trading funds"
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* 🚫 CRITICAL FROZEN USER BANNER (Prompt 2 & 5 Requirement) */}
      {isFrozen && (
        <div className="bg-bear/20 border-b border-bear/40 p-3 flex items-start gap-2.5 text-xs text-bear animate-pulse">
          <Lock size={15} className="shrink-0 mt-0.5 text-bear" />
          <div>
            <div className="font-bold">Trading Privileges Suspended</div>
            <div className="text-[11px] text-white/90 mt-0.5">
              Your account has been frozen by an administrator. Order submission and closing positions are disabled.
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
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Wallet Equity</span>
          <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
            ${account?.formattedEquity ?? formatPrice(portfolio.equity, 2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Avail Balance:</span>
          <span className="font-mono" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            ${account?.formattedBalance ?? formatPrice(portfolio.balance, 2)}
          </span>
        </div>
      </div>

      {/* ₿ PROMPT 3.1: BTC BUY-AND-HOLD BENCHMARK CONTEXT */}
      <div className="p-2.5 bg-canvas border-b border-subtle">
        <BenchmarkComparisonBanner userId={user.id} variant="banner" />
      </div>

      {/* Buy / Sell Tabs */}
      <div style={{ display: 'flex', padding: '10px 14px 4px', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`btn ${side === 'buy' ? 'btn-bull' : ''}`}
          style={{ flex: 1, padding: '8px 0', fontSize: '13px' }}
        >
          <ArrowUpRight size={14} />
          <span>Buy / Long</span>
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`btn ${side === 'sell' ? 'btn-bear' : ''}`}
          style={{ flex: 1, padding: '8px 0', fontSize: '13px' }}
        >
          <ArrowDownRight size={14} />
          <span>Sell / Short</span>
        </button>
      </div>

      {/* Order Type Switcher */}
      <div style={{ display: 'flex', padding: '6px 14px', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setOrderType('market')}
          style={{
            flex: 1,
            padding: '5px',
            background: orderType === 'market' ? 'var(--bg-elevated)' : 'transparent',
            border: orderType === 'market' ? '1px solid var(--border-card)' : '1px solid transparent',
            color: orderType === 'market' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Market Order
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderType('limit');
            if (!limitPrice && currentPrice > 0) setLimitPrice(String(currentPrice));
          }}
          style={{
            flex: 1,
            padding: '5px',
            background: orderType === 'limit' ? 'var(--bg-elevated)' : 'transparent',
            border: orderType === 'limit' ? '1px solid var(--border-card)' : '1px solid transparent',
            color: orderType === 'limit' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Limit Order
        </button>
      </div>

      {/* Inline Error Message */}
      {errorMsg && (
        <div className="mx-3.5 my-1.5 p-2 bg-bear/15 border border-bear/30 rounded text-xs text-bear flex items-start gap-1.5">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Form */}
      <form onSubmit={handleSubmit} style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {orderType === 'limit' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>
              <span>Order Price</span>
              <span className="font-mono">USDT</span>
            </div>
            <input
              type="number"
              step="any"
              className="form-input font-mono"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Target price"
              required
            />
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>
            <span>Order Quantity</span>
            <span className="font-mono">{symbolInfo.baseAsset}</span>
          </div>
          <input
            type="number"
            step="any"
            className="form-input font-mono"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: ${symbolInfo.minQty}`}
            required
            disabled={isFrozen}
          />
        </div>

        {/* Percentage Chips */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              className="btn btn-pill"
              onClick={() => handleQuickPercent(pct)}
              disabled={isFrozen}
              style={{
                flex: 1,
                padding: '3px 0',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-card)',
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* TP / SL Target Inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <div className="flex justify-between text-[10px] text-faint mb-1">
              <span>Take Profit</span>
              <span className="text-bull font-mono">USDT</span>
            </div>
            <input
              type="number"
              step="any"
              className="form-input font-mono text-xs w-full py-1"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="TP Price"
              disabled={isFrozen}
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-faint mb-1">
              <span>Stop Loss</span>
              <span className="text-bear font-mono">USDT</span>
            </div>
            <input
              type="number"
              step="any"
              className="form-input font-mono text-xs w-full py-1"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="SL Price"
              disabled={isFrozen}
            />
          </div>
        </div>

        {/* Execution Engine Notice */}
        {orderType === 'limit' && (
          <div className="text-[10px] text-faint bg-card/60 p-2 rounded border border-subtle flex items-start gap-1.5">
            <Clock size={12} className="text-primary mt-0.5 shrink-0" />
            <span>
              Limit fills and TP/SL brackets execute at the next check interval when live price crosses target (up to 1 min delay).
            </span>
          </div>
        )}

        {/* Order Cost & 0.1% Fee Live Calculation */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated Cost:</span>
            <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              ${formatPrice(orderTotalUSDT, 2)} USDT
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-faint)' }}>
            <span>Est. Fee (0.1% flat):</span>
            <span className="font-mono">${formatPrice(feeEstimate, 4)} USDT</span>
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
          className={`btn ${side === 'buy' ? 'btn-bull' : 'btn-bear'}`}
          style={{
            padding: '10px 0',
            fontSize: '14px',
            fontWeight: 700,
            cursor:
              numAmount <= 0 || isFrozen || dailyStatus?.isLocked || revengeStatus?.isCooldownActive
                ? 'not-allowed'
                : 'pointer',
            opacity:
              numAmount <= 0 || isFrozen || dailyStatus?.isLocked || revengeStatus?.isCooldownActive
                ? 0.6
                : 1,
            boxShadow:
              side === 'buy'
                ? '0 0 15px rgba(0,240,144,0.3)'
                : '0 0 15px rgba(255,59,87,0.3)',
          }}
        >
          {isFrozen
            ? 'TRADING FROZEN'
            : dailyStatus?.isLocked
            ? 'DAILY LIMIT REACHED'
            : revengeStatus?.isCooldownActive
            ? '5-MIN BREAK ACTIVE'
            : `${side === 'buy' ? 'BUY / LONG' : 'SELL / SHORT'} ${symbolInfo.baseAsset}`}
        </button>
      </form>
    </aside>
  );
};
