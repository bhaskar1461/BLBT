'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  TrendingUp,
  CandlestickChart,
  Layers,
  Sparkles,
  BarChart2,
  Trophy,
  ShieldCheck,
  RotateCcw,
  Wallet,
  X,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Server,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChartStore } from '@/stores/useChartStore';
import { AssetIcon } from '@/components/ui/TradingViewIcons';

interface CommandItem {
  id: string;
  category: 'SYMBOLS' | 'NAVIGATION' | 'RESEARCH & TOOLS';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  action: () => void;
}

interface TerminalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectViewMode?: (mode: 'summary' | 'chart') => void;
  onOpenRightTab?: (tab: string) => void;
  onOpenBrokerModal?: () => void;
}

export const TerminalCommandPalette: React.FC<TerminalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectViewMode,
  onOpenRightTab,
  onOpenBrokerModal,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build command palette catalog
  const COMMANDS: CommandItem[] = [
    // Symbols
    {
      id: 'sym-nifty',
      category: 'SYMBOLS',
      title: 'NIFTY 50',
      subtitle: 'NSE • National Stock Exchange Benchmark',
      icon: TrendingUp,
      badge: 'Index',
      action: () => {
        setActiveSymbol('NIFTY');
        onClose();
      },
    },
    {
      id: 'sym-banknifty',
      category: 'SYMBOLS',
      title: 'BANKNIFTY',
      subtitle: 'NSE • Indian Banking Sector Index',
      icon: TrendingUp,
      badge: 'Index',
      action: () => {
        setActiveSymbol('BANKNIFTY');
        onClose();
      },
    },
    {
      id: 'sym-sensex',
      category: 'SYMBOLS',
      title: 'SENSEX',
      subtitle: 'BSE • Bombay Stock Exchange Benchmark',
      icon: TrendingUp,
      badge: 'Index',
      action: () => {
        setActiveSymbol('SENSEX');
        onClose();
      },
    },
    {
      id: 'sym-btc',
      category: 'SYMBOLS',
      title: 'BTCUSDT',
      subtitle: 'Binance • Bitcoin Perpetual Spot',
      icon: TrendingUp,
      badge: 'Crypto',
      action: () => {
        setActiveSymbol('BTCUSDT');
        onClose();
      },
    },
    {
      id: 'sym-reliance',
      category: 'SYMBOLS',
      title: 'RELIANCE',
      subtitle: 'NSE • Reliance Industries Ltd.',
      icon: TrendingUp,
      badge: 'Stock',
      action: () => {
        setActiveSymbol('RELIANCE');
        onClose();
      },
    },
    // Navigation / Terminal Views
    {
      id: 'nav-summary',
      category: 'NAVIGATION',
      title: 'Market summary Overview',
      subtitle: 'Vibrant glowing spline area chart & market cap hero',
      icon: TrendingUp,
      badge: 'View',
      action: () => {
        if (onSelectViewMode) onSelectViewMode('summary');
        onClose();
      },
    },
    {
      id: 'nav-supercharts',
      category: 'NAVIGATION',
      title: 'Candlestick Supercharts',
      subtitle: 'Institutional technical candlestick terminal with indicators',
      icon: CandlestickChart,
      badge: 'View',
      action: () => {
        if (onSelectViewMode) onSelectViewMode('chart');
        onClose();
      },
    },
    {
      id: 'nav-broker',
      category: 'NAVIGATION',
      title: 'OpenAlgo Broker Gateway',
      subtitle: 'Multi-broker execution routing for Zerodha Kite, Upstox, Dhan, & Paper Sandbox',
      icon: Server,
      badge: 'Broker',
      action: () => {
        if (onOpenBrokerModal) onOpenBrokerModal();
        onClose();
      },
    },
    {
      id: 'nav-options',
      category: 'NAVIGATION',
      title: 'OpenBull Option Chain',
      subtitle: 'Calls, Puts, Greeks, OI Tracker, and Max Pain',
      icon: Layers,
      badge: 'Options',
      action: () => {
        if (onOpenRightTab) onOpenRightTab('options');
        onClose();
      },
    },
    {
      id: 'nav-heatmap',
      category: 'NAVIGATION',
      title: 'Market Sector Heatmap',
      subtitle: 'Live treemap of S&P 500 and Top Crypto performance',
      icon: BarChart2,
      badge: 'Heatmap',
      action: () => {
        if (onOpenRightTab) onOpenRightTab('heatmap');
        onClose();
      },
    },
    {
      id: 'nav-ai',
      category: 'RESEARCH & TOOLS',
      title: 'AI Research Desk',
      subtitle: 'Ask causal questions on price action, OI walls, and FII flows',
      icon: Sparkles,
      badge: 'AI',
      action: () => {
        if (onOpenRightTab) onOpenRightTab('ai');
        onClose();
      },
    },
    {
      id: 'nav-backtest',
      category: 'RESEARCH & TOOLS',
      title: 'Honest Backtester',
      subtitle: 'Zero curve-fitting backtest engine with fee drag & BTC benchmark',
      icon: RotateCcw,
      badge: 'Page',
      action: () => {
        router.push('/backtest');
        onClose();
      },
    },
    {
      id: 'nav-tournaments',
      category: 'RESEARCH & TOOLS',
      title: 'Zero-Fee Tournaments',
      subtitle: 'Risk-adjusted competitions with verifiable cryptographic root',
      icon: Trophy,
      badge: 'Page',
      action: () => {
        router.push('/tournaments');
        onClose();
      },
    },
    {
      id: 'nav-transparency',
      category: 'RESEARCH & TOOLS',
      title: 'Cryptographic Transparency',
      subtitle: 'SHA-256 daily root ledger verification & proof of invariants',
      icon: ShieldCheck,
      badge: 'Page',
      action: () => {
        router.push('/transparency');
        onClose();
      },
    },
  ];

  const filtered = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 select-none animate-in fade-in duration-100">
      <div
        className="w-full max-w-xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39] bg-[#171b26]">
          <Search size={18} className="text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a symbol, command, or feature (e.g. NIFTY, Options, Heatmap)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#787b86] outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2e39] text-[10px] font-mono text-[#787b86]">ESC</kbd>
            <button onClick={onClose} className="p-1 hover:text-white text-[#787b86]">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#2a2e39]/50 p-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787b86]">
              No commands or symbols found matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer group ${
                    isSelected ? 'bg-[#2962ff] text-white' : 'hover:bg-[#2a2e39]/60 text-[#d1d4dc]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#171b26] text-[#787b86] group-hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#171b26] text-[#787b86]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#787b86]'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-transparent group-hover:text-[#787b86]'} />
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Shortcut Footer */}
        <div className="px-4 py-2 border-t border-[#2a2e39] bg-[#171b26] flex items-center justify-between text-[11px] font-mono text-[#787b86]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Bhaskar Terminal Command System</span>
        </div>
      </div>
    </div>
  );
};
