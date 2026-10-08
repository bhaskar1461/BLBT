'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Flame,
  Bell,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Heart,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';

interface TradingViewTopBarProps {
  onOpenSymbolPicker: () => void;
  onOpenIndicators: () => void;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenFeedback: () => void;
  activeAlertsCount: number;
  streakDays?: number;
  terminalMode?: 'beginner' | 'pro';
  onToggleTerminalMode?: () => void;
}

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
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const connectionStatus = useChartStore((s) => s.connectionStatus);
  const latencyMs = useChartStore((s) => s.latencyMs);

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

  // Keyboard shortcut Ctrl+K / Cmd+K
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

  return (
    <header className="h-12 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between px-3 shrink-0 z-30 select-none text-[#d1d4dc]">
      {/* Left: Brand Monogram + Search Input + Navigation Links */}
      <div className="flex items-center gap-3.5" ref={dropdownRef}>
        {/* TradingView / Celsius Monogram Logo */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="w-7 h-7 rounded flex items-center justify-center font-black text-sm text-white tracking-tighter">
            <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
              <path d="M4 19.5V8.5C4 7.67 4.67 7 5.5 7H10.5C11.33 7 12 7.67 12 8.5V19.5C12 20.33 11.33 21 10.5 21H5.5C4.67 21 4 20.33 4 19.5Z" fill="#ffffff" />
              <path d="M16 19.5V13.5C16 12.67 16.67 12 17.5 12H22.5C23.33 12 24 12.67 24 13.5V19.5C24 20.33 23.33 21 22.5 21H17.5C16.67 21 16 20.33 16 19.5Z" fill="#2962ff" />
            </svg>
          </div>
        </Link>

        {/* Search (Ctrl+K) Pill Input (Matches TradingView Screenshot!) */}
        <button
          onClick={onOpenSymbolPicker}
          className="flex items-center gap-2 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] hover:border-[#434651] px-3.5 py-1.5 rounded-full text-xs text-[#787b86] hover:text-[#d1d4dc] transition-all w-44 sm:w-56 justify-between group shadow-inner"
          title="Search symbols, indices, crypto pairs (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={14} className="text-[#787b86] group-hover:text-[#2962ff] transition-colors shrink-0" />
            <span className="truncate text-xs">Search (Ctrl+K)</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] bg-[#131722] border border-[#2a2e39] px-1.5 py-0.2 rounded text-[#787b86]">
            ⌘K
          </span>
        </button>

        {/* Navigation Links (Matches Products, Community, Markets, Brokers, More) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          {/* Products Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'products' ? null : 'products')}
              className="px-2.5 py-1.5 rounded hover:bg-[#1e222d] text-[#d1d4dc] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Products</span>
              <ChevronDown size={12} className="text-[#787b86]" />
            </button>
            {openDropdown === 'products' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl p-1.5 text-xs z-50">
                <Link
                  href="/"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
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
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
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
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
                >
                  <Trophy size={14} className="text-[#f59e0b]" />
                  <div>
                    <div className="font-bold">Tournaments</div>
                    <div className="text-[10px] text-[#787b86]">Risk-adjusted competitions</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Community Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'community' ? null : 'community')}
              className="px-2.5 py-1.5 rounded hover:bg-[#1e222d] text-[#d1d4dc] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Community</span>
              <ChevronDown size={12} className="text-[#787b86]" />
            </button>
            {openDropdown === 'community' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl p-1.5 text-xs z-50">
                <Link
                  href="/leaderboard"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
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
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
                >
                  <ShieldCheck size={14} className="text-[#089981]" />
                  <div>
                    <div className="font-bold">Ledger Proofs</div>
                    <div className="text-[10px] text-[#787b86]">Cryptographic daily roots</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Markets Link */}
          <button
            onClick={onOpenSymbolPicker}
            className="px-2.5 py-1.5 rounded hover:bg-[#1e222d] text-[#d1d4dc] hover:text-white transition-colors"
          >
            Markets
          </button>

          {/* Brokers / Paper Trading */}
          <Link
            href="/reality"
            className="px-2.5 py-1.5 rounded hover:bg-[#1e222d] text-[#d1d4dc] hover:text-white transition-colors"
          >
            Brokers
          </Link>

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
              className="px-2.5 py-1.5 rounded hover:bg-[#1e222d] text-[#d1d4dc] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>More</span>
              <ChevronDown size={12} className="text-[#787b86]" />
            </button>
            {openDropdown === 'more' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl p-1.5 text-xs z-50">
                <Link
                  href="/reality"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
                >
                  <AlertTriangle size={14} className="text-[#f23645]" />
                  <div>
                    <div className="font-bold">The Reality Check</div>
                    <div className="text-[10px] text-[#787b86]">78.2% lose money retail stats</div>
                  </div>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
                >
                  <ExternalLink size={14} className="text-[#2962ff]" />
                  <div>
                    <div className="font-bold">Manifesto & Mission</div>
                    <div className="text-[10px] text-[#787b86]">Why brokers liquidate you</div>
                  </div>
                </Link>
                <Link
                  href="/funding"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded hover:bg-[#2a2e39] text-[#f0f3fa]"
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
        </nav>
      </div>

      {/* Right: Latency, Mode Switcher, Upgrade Purple Button, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection status */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-[10px] font-mono text-[#787b86]"
          title={`Binance WebSocket: ${connectionStatus} (${latencyMs}ms)`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
          <span className="text-[#d1d4dc] font-semibold">LIVE</span>
          <span>{latencyMs}ms</span>
        </div>

        {/* Streak Badge */}
        <div
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-xs font-mono text-[#ff9f1c]"
          title={`${streakDays} Day Login Streak`}
        >
          <Flame size={13} className="fill-[#ff9f1c]" />
          <span className="font-bold">{streakDays}d</span>
        </div>

        {/* Beginner / Pro Mode Toggle */}
        {onToggleTerminalMode && (
          <button
            onClick={onToggleTerminalMode}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
              terminalMode === 'beginner'
                ? 'bg-[#089981]/20 text-[#089981] border-[#089981]/40'
                : 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
            }`}
            title="Toggle between Simple Practice Mode and Pro Terminal"
          >
            <Sparkles size={12} className={terminalMode === 'beginner' ? 'text-[#089981]' : 'text-[#2962ff]'} />
            <span>{terminalMode === 'beginner' ? 'Beginner' : 'Pro'}</span>
          </button>
        )}

        {/* Purple "Upgrade" Button (Exact Match to Screenshot!) */}
        <Link href="/funding">
          <button
            className="bg-gradient-to-r from-[#6200ea] to-[#7c4dff] hover:from-[#5300e8] hover:to-[#6f3bf5] text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md shadow-[#6200ea]/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            title="Upgrade to Pro / Support Open Truth"
          >
            <span>Upgrade</span>
          </button>
        </Link>

        {/* Notification Bell */}
        <button
          onClick={onOpenAlerts}
          className="w-8 h-8 rounded flex items-center justify-center text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] transition-colors relative"
          title="Price Alerts & Notifications"
        >
          <Bell size={16} />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f59e0b]" />
          )}
        </button>

        {/* User Profile Avatar "B" (Exact Match to User's Screenshot: Purple Circle with 'B') */}
        <Link
          href="/u/Bhaskar1461"
          className="w-8 h-8 rounded-full bg-[#6200ea] hover:ring-2 hover:ring-[#7c4dff] flex items-center justify-center font-bold text-xs text-white shadow-md transition-all shrink-0 cursor-pointer"
          title="Bhaskar1461 Profile & Account Settings"
        >
          <span>B</span>
        </Link>
      </div>
    </header>
  );
};
