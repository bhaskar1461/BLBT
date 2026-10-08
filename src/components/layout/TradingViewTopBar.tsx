'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Flame,
  Bell,
  Sparkles,
  Sliders,
  Clock,
  Maximize2,
  Minimize2,
  Wallet,
  CandlestickChart,
  LineChart,
  BarChart2,
  RotateCcw,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Heart,
  ExternalLink,
  TrendingUp,
  Globe,
  Activity,
  Server,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { getSymbolInfo, formatPrice } from '@/services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';
import type { Timeframe } from '@/types/chart';

interface TradingViewTopBarProps {
  onOpenSymbolPicker: () => void;
  onOpenIndicators: () => void;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenFeedback: () => void;
  onOpenWallet?: (tab?: 'buy' | 'redeem' | 'info') => void;
  onOpenBrokerModal?: () => void;
  activeAlertsCount: number;
  streakDays?: number;
  terminalMode?: 'beginner' | 'pro';
  onToggleTerminalMode?: () => void;
  viewMode?: 'summary' | 'chart';
  onToggleViewMode?: (mode: 'summary' | 'chart') => void;
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

// Financial World Clocks component inspired by ErTasselli/OpenTerminal
const WorldClocks: React.FC = () => {
  const [clocks, setClocks] = useState<{ ny: string; lon: string; tyo: string } | null>(null);
  const [nyOpen, setNyOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClocks({
        ny: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' }),
        lon: now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false, hour: '2-digit', minute: '2-digit' }),
        tyo: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }),
      });
      const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const day = nyDate.getDay();
      const mins = nyDate.getHours() * 60 + nyDate.getMinutes();
      setNyOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960);
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!clocks) return null;

  return (
    <div className="hidden 2xl:flex items-center gap-2 px-2 py-0.5 rounded bg-[#171b26] border border-[#2a2e39] text-[10px] font-mono text-[#787b86]">
      <span className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${nyOpen ? 'bg-[#089981] animate-pulse' : 'bg-[#787b86]'}`} />
        <span className={nyOpen ? 'text-[#089981] font-bold' : 'text-[#787b86]'}>
          {nyOpen ? 'NYSE OPEN' : 'NYSE CLOSED'}
        </span>
      </span>
      <span>•</span>
      <span>NY <strong className="text-[#d1d4dc] font-medium">{clocks.ny}</strong></span>
      <span>LON <strong className="text-[#d1d4dc] font-medium">{clocks.lon}</strong></span>
      <span>TYO <strong className="text-[#d1d4dc] font-medium">{clocks.tyo}</strong></span>
    </div>
  );
};

export const TradingViewTopBar: React.FC<TradingViewTopBarProps> = ({
  onOpenSymbolPicker,
  onOpenIndicators,
  onOpenAlerts,
  onOpenAuth,
  onOpenProfile,
  onOpenFeedback,
  activeAlertsCount,
  streakDays = 5,
  terminalMode = 'pro',
  onToggleTerminalMode,
  onOpenWallet,
  onOpenBrokerModal,
  viewMode = 'summary',
  onToggleViewMode,
}) => {
  const account = useTradingStore((s) => s.account);
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const timeframe = useChartStore((s) => s.timeframe);
  const setTimeframe = useChartStore((s) => s.setTimeframe);
  const chartType = useChartStore((s) => s.chartType);
  const setChartType = useChartStore((s) => s.setChartType);
  const connectionStatus = useChartStore((s) => s.connectionStatus);
  const latencyMs = useChartStore((s) => s.latencyMs);
  const candles = useChartStore((s) => s.candles);

  const tickers = useWatchlistStore((s) => s.tickers);
  const ticker = tickers[activeSymbol];

  const symbolInfo = getSymbolInfo(activeSymbol);
  const currentPrice = ticker?.lastPrice ?? (candles[candles.length - 1]?.close ?? 0);
  const changePercent = ticker?.priceChangePercent ?? -0.76;
  const isPositive = changePercent >= 0;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSymbolPicker();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSymbolPicker]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="h-[44px] bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between px-2.5 sm:px-3 shrink-0 z-30 select-none text-[#d1d4dc] text-xs">
      {/* ======================================================== */}
      {/* Left: TV Logo + Symbol Pill + Timeframes + Chart Style + Indicators */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0" ref={dropdownRef}>
        {/* TradingView / Celsius Monogram Logo */}
        <Link
          href="/"
          className="flex items-center justify-center p-1 rounded-md hover:bg-[#1e222d] transition-colors shrink-0 group"
          title="Celsius Network • The Honest Terminal"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5 transition-transform group-hover:scale-105">
              <path d="M4 19.5V8.5C4 7.67 4.67 7 5.5 7H10.5C11.33 7 12 7.67 12 8.5V19.5C12 20.33 11.33 21 10.5 21H5.5C4.67 21 4 20.33 4 19.5Z" fill="#ffffff" />
              <path d="M16 19.5V13.5C16 12.67 16.67 12 17.5 12H22.5C23.33 12 24 12.67 24 13.5V19.5C24 20.33 23.33 21 22.5 21H17.5C16.67 21 16 20.33 16 19.5Z" fill="#2962ff" />
            </svg>
          </div>
        </Link>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 shrink-0" />

        {/* Symbol Search & Quote Pill (Matches Authentic TradingView Header!) */}
        <button
          onClick={onOpenSymbolPicker}
          className="flex items-center gap-2 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] hover:border-[#434651] px-2.5 py-1 rounded-md text-xs transition-all group shadow-sm shrink-0"
          title="Search symbols, crypto, indices (Ctrl+K)"
        >
          <div className="shrink-0 flex items-center">
            <AssetIcon symbol={activeSymbol} size={18} />
          </div>
          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
            {activeSymbol}
          </span>
          <span className="font-mono text-[11px] text-[#f0f3fa] font-medium hidden sm:inline">
            {formatPrice(currentPrice, symbolInfo.pricePrecision)}
          </span>
          <span className={`font-mono text-[10px] font-semibold hidden md:inline ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
          <Search size={12} className="text-[#787b86] group-hover:text-white transition-colors ml-0.5" />
        </button>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 shrink-0 hidden sm:block" />

        {/* Timeframe Selector Pills (1m, 5m, 15m, 1h, 4h, 1D) */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 rounded-[4px] text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e222d] text-[#2962ff] font-bold ring-1 ring-[#2962ff]/40'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 shrink-0 hidden md:block" />

        {/* Chart Style Toggle: Candles vs Line */}
        <div className="hidden md:flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setChartType('candles')}
            className={`p-1.5 rounded-[4px] transition-colors ${
              chartType === 'candles'
                ? 'bg-[#1e222d] text-[#2962ff]'
                : 'text-[#787b86] hover:text-white hover:bg-[#1e222d]'
            }`}
            title="Candlestick Chart"
          >
            <CandlestickChart size={15} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-[4px] transition-colors ${
              chartType === 'line'
                ? 'bg-[#1e222d] text-[#2962ff]'
                : 'text-[#787b86] hover:text-white hover:bg-[#1e222d]'
            }`}
            title="Line / Area Chart"
          >
            <LineChart size={15} />
          </button>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 shrink-0 hidden md:block" />

        {/* Indicators Button */}
        <button
          onClick={onOpenIndicators}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-xs font-semibold text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors shrink-0"
          title="Indicators & Strategy Metrics"
        >
          <Sliders size={13} className="text-[#2962ff]" />
          <span>Indicators</span>
        </button>

        {/* Price Alerts Quick Button */}
        <button
          onClick={onOpenAlerts}
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-[4px] text-xs font-semibold text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors shrink-0"
          title="Create Price Alert"
        >
          <Clock size={13} />
          <span>Alert</span>
        </button>

        {/* Unified Platform Menu Dropdown (Replaces bloated 3-dropdown clutter with single TV Menu) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'menu' ? null : 'menu')}
            className="px-2 py-1 rounded-[4px] hover:bg-[#1e222d] text-[#787b86] hover:text-white flex items-center gap-1 transition-colors font-semibold text-[11px] shrink-0"
            title="Celsius Terminal Platform Menu"
          >
            <span>Menu</span>
            <ChevronDown size={11} className={`transition-transform duration-150 ${openDropdown === 'menu' ? 'rotate-180 text-white' : 'text-[#787b86]'}`} />
          </button>

          {openDropdown === 'menu' && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              {/* Products Section */}
              <div className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider px-2 py-1">Products</div>
              <Link
                href="/"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <BarChart2 size={14} className="text-[#2962ff]" />
                <div>
                  <div className="font-bold">Pro Terminal</div>
                  <div className="text-[10px] text-[#787b86]">TradingView layout & feeds</div>
                </div>
              </Link>
              <Link
                href="/backtest"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <RotateCcw size={14} className="text-[#089981]" />
                <div>
                  <div className="font-bold">Honest Backtester</div>
                  <div className="text-[10px] text-[#787b86]">Zero curve-fitting simulations</div>
                </div>
              </Link>
              <Link
                href="/tournaments"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <Trophy size={14} className="text-[#f59e0b]" />
                <div>
                  <div className="font-bold">Tournaments</div>
                  <div className="text-[10px] text-[#787b86]">Risk-adjusted competitions</div>
                </div>
              </Link>
              {onOpenBrokerModal && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onOpenBrokerModal();
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
                >
                  <Server size={14} className="text-[#2962ff]" />
                  <div>
                    <div className="font-bold">OpenAlgo Broker Gateway</div>
                    <div className="text-[10px] text-[#787b86]">Zerodha, Upstox, Dhan & Paper routing</div>
                  </div>
                </button>
              )}

              <div className="w-full h-[1px] bg-[#2a2e39] my-1.5" />

              {/* Community & Verification */}
              <div className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider px-2 py-1">Community & Trust</div>
              <Link
                href="/leaderboard"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <Trophy size={14} className="text-[#f59e0b]" />
                <div>
                  <div className="font-bold">Leaderboard</div>
                  <div className="text-[10px] text-[#787b86]">Disciplined paper traders</div>
                </div>
              </Link>
              <Link
                href="/transparency"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <ShieldCheck size={14} className="text-[#089981]" />
                <div>
                  <div className="font-bold">Ledger Proofs</div>
                  <div className="text-[10px] text-[#787b86]">Cryptographic daily roots</div>
                </div>
              </Link>
              <Link
                href="/reality"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <AlertTriangle size={14} className="text-[#f23645]" />
                <div>
                  <div className="font-bold">The Reality Check</div>
                  <div className="text-[10px] text-[#787b86]">78.2% lose money retail stats</div>
                </div>
              </Link>

              <div className="w-full h-[1px] bg-[#2a2e39] my-1.5" />

              {/* Mission & Funding */}
              <Link
                href="/about"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <ExternalLink size={14} className="text-[#2962ff]" />
                <div>
                  <div className="font-bold">Manifesto & Mission</div>
                  <div className="text-[10px] text-[#787b86]">Why brokers liquidate retail</div>
                </div>
              </Link>
              <Link
                href="/funding"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#2a2e39] text-[#f0f3fa] transition-colors"
              >
                <Heart size={14} className="text-[#089981]" />
                <div>
                  <div className="font-bold">Transparent Funding</div>
                  <div className="text-[10px] text-[#787b86]">Zero ads, $150/mo ledger</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Center: View Mode Toggle (Summary vs Supercharts)        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleViewMode && (
          <div className="hidden md:flex items-center bg-[#161b22] p-0.5 rounded-md border border-[#212a36] text-[11px]">
            <button
              onClick={() => onToggleViewMode('summary')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'summary'
                  ? 'bg-[#21262d] text-white font-bold shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1c2128]'
              }`}
              title="Market Summary Overview"
            >
              <TrendingUp size={12} className={viewMode === 'summary' ? 'text-[#2962ff]' : ''} />
              <span>Market summary</span>
            </button>
            <button
              onClick={() => onToggleViewMode('chart')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'chart'
                  ? 'bg-[#21262d] text-white font-bold shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1c2128]'
              }`}
              title="Candlestick Supercharts Terminal"
            >
              <CandlestickChart size={12} className={viewMode === 'chart' ? 'text-[#2962ff]' : ''} />
              <span>Supercharts</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Right: Latency, Streak, Wallet, Mode, Fullscreen, Profile */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Connection status & Multi-Feed Latencies (OpenTerminal) */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#1e222d] border border-[#2a2e39] text-[10px] font-mono text-[#787b86]"
          title={`Binance WebSocket: ${connectionStatus} (${latencyMs}ms) | Nasdaq & TV feeds fallback active`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
          <span className="text-[#d1d4dc] font-semibold">LIVE</span>
          <span>{latencyMs}ms</span>
          <span className="hidden xl:inline text-[#787b86]">• feeds: tv 14ms · cg 180ms</span>
        </div>

        {/* Login Streak */}
        <div
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#1e222d] border border-[#2a2e39] text-[11px] font-mono text-[#ff9f1c]"
          title={`${streakDays} Day Trading Streak`}
        >
          <Flame size={12} className="fill-[#ff9f1c]" />
          <span className="font-bold">{streakDays}d</span>
        </div>

        {/* Beginner / Pro Toggle */}
        {onToggleTerminalMode && (
          <button
            onClick={onToggleTerminalMode}
            className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-all border ${
              terminalMode === 'beginner'
                ? 'bg-[#089981]/20 text-[#089981] border-[#089981]/40'
                : 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
            }`}
            title="Toggle between Simple Practice Mode and Pro Terminal"
          >
            <Sparkles size={11} className={terminalMode === 'beginner' ? 'text-[#089981]' : 'text-[#2962ff]'} />
            <span>{terminalMode === 'beginner' ? 'Beginner' : 'Pro'}</span>
          </button>
        )}

        {/* Bloomberg PORT Net Worth Pill */}
        <Link
          href="/u/Bhaskar1461"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161B22] hover:bg-[#1c2128] border border-[#f59e0b]/50 text-[11px] font-mono text-[#d1d4dc] transition-all hover:border-[#f59e0b]"
          title="Bloomberg Portfolio (PORT) - View Total Net Worth"
        >
          <span className="px-1 py-0.2 rounded-[2px] bg-[#f59e0b] text-black font-black text-[9px] tracking-wider">
            PORT
          </span>
          <span className="font-bold text-white tabular-nums">
            ${account?.equity ? account.equity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '617,530'}
          </span>
        </Link>

        {/* Account Funds & Wallet Pill */}
        {onOpenWallet && (
          <button
            onClick={() => onOpenWallet('buy')}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161B22] hover:bg-[#1c2128] border border-[#212A36] text-[11px] font-mono text-[#d1d4dc] transition-colors cursor-pointer"
            title="Account Capital & Funds"
          >
            <span className="text-[#787b86] text-[10px]">CASH</span>
            <span className="font-bold text-[#00c176] tabular-nums">
              ${account ? account.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '58,380'}
            </span>
          </button>
        )}

        {/* Funding Link */}
        <Link href="/funding">
          <button
            className="px-2 py-0.5 rounded text-[11px] font-medium text-[#787b86] hover:text-white border border-[#212A36] hover:bg-[#161B22] transition-colors"
            title="Platform Funding & Transparency"
          >
            Funding
          </button>
        </Link>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="w-6 h-6 rounded hidden sm:flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#161B22] transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenAlerts}
          className="w-6 h-6 rounded flex items-center justify-center text-[#787b86] hover:text-white hover:bg-[#161B22] transition-colors relative"
          title="Price Alerts & Notifications"
        >
          <Bell size={13} />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          )}
        </button>

        {/* User Profile Avatar "B" */}
        <Link
          href="/u/Bhaskar1461"
          className="w-6 h-6 rounded bg-[#212A36] hover:bg-[#2D3745] border border-[#2D3745] flex items-center justify-center font-bold text-[11px] text-[#d1d4dc] transition-all shrink-0 ml-0.5"
          title="Bhaskar1461 Profile & Cryptographic Track Record"
        >
          <span>B</span>
        </Link>
      </div>
    </header>
  );
};
