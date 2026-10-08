'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Bell,
  Sliders,
  Shield,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  DollarSign,
  Trophy,
  Flame,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Heart,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { getSymbolInfo } from '@/services/symbols';
import { formatPrice, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssetIcon } from '@/components/ui/TradingViewIcons';

interface TopBarProps {
  onOpenSymbolPicker: () => void;
  onOpenIndicators: () => void;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenFeedback: () => void;
  onOpenWallet?: (tab?: 'buy' | 'redeem' | 'info') => void;
  onToggleWatchlist: () => void;
  onToggleTradePanel: () => void;
  isWatchlistOpen: boolean;
  isTradePanelOpen: boolean;
  activeAlertsCount: number;
  streakDays?: number;
  terminalMode?: 'beginner' | 'pro';
  onToggleTerminalMode?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSymbolPicker,
  onOpenIndicators,
  onOpenAlerts,
  onOpenAuth,
  onOpenProfile,
  onOpenFeedback,
  onToggleWatchlist,
  onToggleTradePanel,
  isWatchlistOpen,
  isTradePanelOpen,
  activeAlertsCount,
  streakDays = 5,
  terminalMode = 'beginner',
  onToggleTerminalMode,
  onOpenWallet,
}) => {
  const account = useTradingStore((s) => s.account);
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const connectionStatus = useChartStore((s) => s.connectionStatus);
  const latencyMs = useChartStore((s) => s.latencyMs);

  const tickers = useWatchlistStore((s) => s.tickers);
  const ticker = tickers[activeSymbol];

  const symbolInfo = getSymbolInfo(activeSymbol);
  const currentPrice = ticker?.lastPrice ?? 0;
  const changePercent = ticker?.priceChangePercent ?? 0;
  const changeValue = ticker?.priceChange ?? 0;
  const isPositive = changePercent >= 0;

  // Price flash animation on ticks
  const [flashClass, setFlashClass] = useState<'animate-flash-up' | 'animate-flash-down' | ''>('');
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPriceRef.current !== null && currentPrice > 0) {
      if (currentPrice > prevPriceRef.current) {
        setFlashClass('animate-flash-up');
      } else if (currentPrice < prevPriceRef.current) {
        setFlashClass('animate-flash-down');
      }
      const timer = setTimeout(() => setFlashClass(''), 700);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  return (
    <header className="h-12 bg-surface border-b border-subtle flex items-center justify-between px-3 shrink-0 z-20 select-none">
      {/* Left: Brand & Symbol Selector */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="icon"
          size="icon"
          onClick={onToggleWatchlist}
          title={isWatchlistOpen ? 'Hide Watchlist' : 'Show Watchlist'}
        >
          {isWatchlistOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </Button>

        {/* Brand */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-bull to-primary flex items-center justify-center font-extrabold text-xs text-canvas shadow-md shadow-bull/20">
            °C
          </div>
          <span className="font-bold text-sm tracking-tight text-main hidden sm:inline">
            CELSIUS
          </span>
        </div>

        {/* Symbol Selector Button */}
        <button
          onClick={onOpenSymbolPicker}
          className="flex items-center gap-2 bg-elevated hover:bg-hover border border-cardborder px-2.5 py-1 rounded text-xs transition-colors"
        >
          <div className="shrink-0 flex items-center justify-center">
            <AssetIcon symbol={activeSymbol} size={18} />
          </div>
          <span className="font-bold text-main">{activeSymbol}</span>
          <Badge variant="neutral" className="text-[10px] px-1 py-0 hidden md:inline-flex">
            {symbolInfo.category}
          </Badge>
          <ChevronDown size={13} className="text-faint" />
        </button>
      </div>

      {/* Middle: Live Price with Price Flash & 24h Stats */}
      <div className="flex items-center gap-4">
        <div className={`px-2 py-0.5 rounded flex items-baseline gap-2 transition-colors ${flashClass}`}>
          <span className={`font-mono text-lg font-bold ${isPositive ? 'text-bull' : 'text-bear'}`}>
            ${currentPrice > 0 ? formatPrice(currentPrice, symbolInfo.pricePrecision) : '—'}
          </span>
          <Badge variant={isPositive ? 'bull' : 'bear'} className="text-[11px]">
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}% ({isPositive ? '+' : ''}
            {formatPrice(changeValue, 2)})
          </Badge>
        </div>

        {/* 24h Stats */}
        <div className="hidden lg:flex items-center gap-3.5 border-l border-subtle pl-3.5 text-[11px]">
          <div className="flex flex-col">
            <span className="text-[10px] text-faint">24h High</span>
            <span className="font-mono font-medium text-main">
              {ticker?.highPrice ? `$${formatPrice(ticker.highPrice, symbolInfo.pricePrecision)}` : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-faint">24h Low</span>
            <span className="font-mono font-medium text-main">
              {ticker?.lowPrice ? `$${formatPrice(ticker.lowPrice, symbolInfo.pricePrecision)}` : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-faint">24h Vol (USDT)</span>
            <span className="font-mono font-medium text-main">
              {ticker?.quoteVolume ? `$${formatNumber(ticker.quoteVolume)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Admin link, Status */}
      <div className="flex items-center gap-2">
        {/* WebSocket Live Badge */}
        <div
          className="flex items-center gap-1.5 bg-card border border-subtle px-2 py-1 rounded text-[11px]"
          title={`Binance WebSocket: ${connectionStatus} (${latencyMs}ms)`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-bull animate-pulse'
                : 'bg-gold'
            }`}
          />
          <span className="text-muted text-[10px]">
            {connectionStatus === 'connected' ? 'LIVE' : connectionStatus.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] text-faint">{latencyMs}ms</span>
        </div>

        {/* Indicators */}
        <Button variant="default" size="sm" onClick={onOpenIndicators} className="hidden sm:inline-flex gap-1.5">
          <Sliders size={13} />
          <span>Indicators</span>
        </Button>

        {/* Price Alerts */}
        <Button variant="default" size="sm" onClick={onOpenAlerts} className="relative gap-1.5">
          <Bell size={13} />
          <span className="hidden md:inline">Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-canvas rounded-full w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">
              {activeAlertsCount}
            </span>
          )}
        </Button>

        {/* Daily Visit Streak Badge */}
        <div
          className="flex items-center gap-1 bg-card border border-subtle px-2 py-1 rounded text-[11px] text-[#ff9f1c]"
          title={`${streakDays} Day Login Streak`}
        >
          <Flame size={12} className="fill-[#ff9f1c]" />
          <span className="font-bold font-mono">{streakDays}d</span>
        </div>

        {/* The Honest Terminal: Reality Check Link */}
        <Link href="/reality">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-bear/30 text-bear hover:text-white hidden lg:inline-flex"
            title="The Reality Check (Unfiltered Retail Stats)"
          >
            <AlertTriangle size={13} />
            <span className="hidden xl:inline">Reality Check</span>
          </Button>
        </Link>

        {/* The Honest Terminal: Transparency Ledger Proofs Link */}
        <Link href="/transparency">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-bull/30 text-bull hover:text-white hidden lg:inline-flex"
            title="Cryptographic Hash Ledger Proofs"
          >
            <ShieldCheck size={13} />
            <span className="hidden xl:inline">Transparency</span>
          </Button>
        </Link>

        {/* The Honest Terminal: The Backtester Link */}
        <Link href="/backtest">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:text-white hidden lg:inline-flex"
            title="The Honest Backtester (Zero Curve-Fitting)"
          >
            <RotateCcw size={13} />
            <span className="hidden xl:inline">Backtester</span>
          </Button>
        </Link>

        {/* Public Leaderboard Route Link */}
        <Link href="/leaderboard">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-[#ffd700]/30 text-[#ffd700] hover:text-white"
            title="Paper Trading Leaderboard"
          >
            <Trophy size={13} />
            <span className="hidden xl:inline">Leaderboard</span>
          </Button>
        </Link>

        {/* Risk-Adjusted Tournaments Link */}
        <Link href="/tournaments">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-amber-500/30 text-amber-400 hover:text-white hidden lg:inline-flex"
            title="Risk-Adjusted Tournaments (Anti-Casino Discipline)"
          >
            <Trophy size={13} />
            <span className="hidden xl:inline">Tournaments</span>
          </Button>
        </Link>

        {/* Transparent Funding Link */}
        <Link href="/funding">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:text-white hidden lg:inline-flex"
            title="Radical Financial Transparency (Zero Ads, Zero Affiliates)"
          >
            <Heart size={13} />
            <span className="hidden xl:inline">Funding</span>
          </Button>
        </Link>

        {/* Feedback Modal Trigger */}
        <Button
          variant="default"
          size="sm"
          onClick={onOpenFeedback}
          className="gap-1.5 text-muted hover:text-white hidden lg:inline-flex"
          title="Send Feedback to Platform Team"
        >
          <MessageSquare size={13} />
          <span className="hidden xl:inline">Feedback</span>
        </Button>

        {/* Mode Switcher: Beginner vs Pro Terminal */}
        {onToggleTerminalMode && (
          <button
            onClick={onToggleTerminalMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
              terminalMode === 'beginner'
                ? 'bg-bull/20 text-bull border-bull/40 shadow-sm shadow-bull/20'
                : 'bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/20'
            }`}
            title="Toggle between Simple Practice Mode and Pro Terminal"
          >
            <Sparkles size={12} className={terminalMode === 'beginner' ? 'text-bull animate-pulse' : 'text-primary'} />
            <span className="hidden sm:inline">
              {terminalMode === 'beginner' ? 'Beginner Mode' : 'Pro Mode'}
            </span>
          </button>
        )}

        {/* Quick Wallet & Redeem Balance Button */}
        {onOpenWallet && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onOpenWallet('buy')}
            className="gap-1.5 border-cardborder bg-card/80 hover:bg-hover text-white"
            title="Open Quick Wallet — Instant Buy & Redeem Balance"
          >
            <Wallet size={13} className="text-bull" />
            <span className="font-mono font-bold">
              ${account ? account.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '10,000'}
            </span>
            <span className="text-[10px] text-bull font-semibold hidden md:inline">USDT</span>
          </Button>
        )}

        {/* Paper Trade Panel Toggle */}
        <Button
          variant={isTradePanelOpen ? 'primary' : 'default'}
          size="sm"
          onClick={onToggleTradePanel}
          className="gap-1.5"
        >
          <DollarSign size={13} />
          <span className="hidden sm:inline">Paper Trade</span>
        </Button>

        {/* Admin Console Route Link */}
        <Link href="/admin">
          <Button variant="default" size="sm" className="gap-1.5 border-primary/30 text-primary hover:text-white">
            <Shield size={13} />
            <span className="hidden md:inline">Admin</span>
          </Button>
        </Link>

        {/* User Account / Profile Button */}
        <Button
          variant="default"
          size="sm"
          onClick={onOpenProfile || onOpenAuth}
          className="gap-2 bg-gradient-to-r from-elevated to-card border-cardborder hover:border-bull/50 transition-all shadow-sm pl-2 pr-2.5 h-8"
          title="Trader Profile & Account Settings"
        >
          <div className="w-5 h-5 rounded-full bg-bull/20 border border-bull/40 flex items-center justify-center font-bold text-[10px] text-bull shrink-0">
            BS
          </div>
          <div className="flex flex-col text-left hidden sm:flex leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs text-white max-w-[130px] truncate">
                Bhaskar R. Sharma
              </span>
              <span className="text-[8px] bg-bull/15 text-bull border border-bull/30 px-1 py-0 rounded font-mono font-bold">
                VIP
              </span>
            </div>
            <span className="text-[10px] font-mono text-bull font-bold">
              ₹4.80 Cr ($576k)
            </span>
          </div>
        </Button>
      </div>
    </header>
  );
};
