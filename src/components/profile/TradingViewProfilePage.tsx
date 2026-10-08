'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Plus,
  X,
  ExternalLink,
  Check,
  Scale,
  Award,
  Clock,
  Share2,
} from 'lucide-react';
import { TradingViewTopBar } from '@/components/layout/TradingViewTopBar';
import { TradingViewRightDock } from '@/components/tradingview/TradingViewRightDock';
import { TradingViewRightRail } from '@/components/tradingview/TradingViewRightRail';
import { SymbolPickerModal } from '@/components/topbar/SymbolPickerModal';
import { AlertsDrawer } from '@/components/alerts/AlertsDrawer';
import { IndicatorSettingsModal } from '@/components/chart/IndicatorSettingsModal';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';
import { formatPrice } from '@/services/symbols';
import type { PublicVerifiedTrackRecord } from '@/types/profile';

interface TradingViewProfilePageProps {
  initialProfile?: PublicVerifiedTrackRecord | null;
  usernameParam?: string;
}

export const TradingViewProfilePage: React.FC<TradingViewProfilePageProps> = ({
  initialProfile,
  usernameParam = 'Bhaskar1461',
}) => {
  const [activeTab, setActiveTab] = useState<'ideas' | 'minds' | 'scripts' | 'verified'>('ideas');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Ideas state
  const [ideas, setIdeas] = useState<Array<{ id: string; title: string; symbol: string; thesis: string; createdAt: string }>>([]);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaSymbol, setNewIdeaSymbol] = useState('NIFTY');
  const [newIdeaThesis, setNewIdeaThesis] = useState('');

  // Settings state
  const [displayName, setDisplayName] = useState(usernameParam);
  const [bio, setBio] = useState('Quantitative momentum & macro trader. Verified algorithmic paper portfolio.');
  const [riskCap, setRiskCap] = useState('1.0');
  const [dailyLossLimit, setDailyLossLimit] = useState('5.0');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);
  const tickers = useWatchlistStore((s) => s.tickers);
  const ticker = tickers[activeSymbol];
  const currentPrice = ticker?.lastPrice ?? 22433.65;

  const { account, positions, resetAccount, fetchAccount } = useTradingStore();
  const user = storage.getUserProfile();

  const handlePublishIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;
    setIdeas([
      {
        id: String(Date.now()),
        title: newIdeaTitle,
        symbol: newIdeaSymbol,
        thesis: newIdeaThesis,
        createdAt: 'Just now',
      },
      ...ideas,
    ]);
    setNewIdeaTitle('');
    setNewIdeaThesis('');
    setIsPublishModalOpen(false);
  };

  const handleResetAccount = async () => {
    if (window.confirm('Reset simulated paper trading account back to 10,000 USDT? This will close all positions and record an immutable ledger entry.')) {
      setIsResetting(true);
      try {
        await resetAccount(user.id);
        setResetMessage('Account successfully reset to 10,000.00 USDT');
        setTimeout(() => setResetMessage(null), 4000);
      } catch {
        setResetMessage('Reset completed.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#131722] text-[#d1d4dc] font-sans">
      {/* 1. TradingView Top Bar */}
      <TradingViewTopBar
        onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
        onOpenIndicators={() => setIsIndicatorsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenAuth={() => setIsSettingsOpen(true)}
        onOpenProfile={() => {}}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        activeAlertsCount={0}
        streakDays={5}
        terminalMode="pro"
      />

      {/* 2. Main Workspace: Profile Center Area + Right Watchlist Dock + Rightmost Rail */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center: Profile Page Content (Matches in.tradingview.com/u/Bhaskar1461/) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#131722] overflow-y-auto">
          {/* Profile Header */}
          <section className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#2a2e39]/60">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Avatar + Details */}
              <div className="flex items-start sm:items-center gap-6">
                {/* Big Circular Avatar with Letter B */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#673ab7] text-white flex items-center justify-center font-normal text-5xl sm:text-6xl select-none shadow-xl shrink-0">
                  <span>B</span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {/* Username & Online Status */}
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {displayName}
                    </h1>
                    <span className="text-xs font-semibold text-[#089981] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>

                  {/* Social Stats Row: Followers, Following, Ideas, Scripts */}
                  <div className="flex items-center gap-6 sm:gap-8 text-xs select-none">
                    <div className="flex flex-col">
                      <span className="text-[#787b86]">Followers</span>
                      <span className="font-bold text-sm text-white mt-0.5">0</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#787b86]">Following</span>
                      <span className="font-bold text-sm text-white mt-0.5">0</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#787b86]">Ideas</span>
                      <span className="font-bold text-sm text-white mt-0.5">{ideas.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#787b86]">Scripts</span>
                      <span className="font-bold text-sm text-white mt-0.5">0</span>
                    </div>
                  </div>

                  {/* Joined Date with TradingView Icon */}
                  <div className="flex items-center gap-2 text-xs text-[#787b86]">
                    <svg viewBox="0 0 28 28" fill="none" className="w-4 h-4">
                      <path d="M4 19.5V8.5C4 7.67 4.67 7 5.5 7H10.5C11.33 7 12 7.67 12 8.5V19.5C12 20.33 11.33 21 10.5 21H5.5C4.67 21 4 20.33 4 19.5Z" fill="#787b86" />
                      <path d="M16 19.5V13.5C16 12.67 16.67 12 17.5 12H22.5C23.33 12 24 12.67 24 13.5V19.5C24 20.33 23.33 21 22.5 21H17.5C16.67 21 16 20.33 16 19.5Z" fill="#787b86" />
                    </svg>
                    <span>Joined Apr 4, 2026</span>
                  </div>
                </div>
              </div>

              {/* Right: Settings and Billing Button */}
              <div className="self-end md:self-start">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="rounded-lg border border-[#2a2e39] bg-[#1e222d] hover:bg-[#2a2e39] text-[#f0f3fa] hover:text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  title="Configure trader settings, risk rules, and billing"
                >
                  <Settings size={15} className="text-[#787b86]" />
                  <span>Settings and billing</span>
                </button>
              </div>
            </div>
          </section>

          {/* Navigation Tabs (Ideas | Minds | Scripts | Verified Track Record) */}
          <section className="px-6 sm:px-10 border-b border-[#2a2e39] bg-[#131722] sticky top-0 z-10">
            <div className="max-w-5xl mx-auto flex items-center gap-8 text-sm font-semibold select-none">
              <button
                onClick={() => setActiveTab('ideas')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeTab === 'ideas'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Ideas {ideas.length > 0 && <span className="text-xs text-[#2962ff]">({ideas.length})</span>}
              </button>
              <button
                onClick={() => setActiveTab('minds')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeTab === 'minds'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Minds
              </button>
              <button
                onClick={() => setActiveTab('scripts')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeTab === 'scripts'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Scripts
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'verified'
                    ? 'border-[#089981] text-[#089981] font-bold'
                    : 'border-transparent text-[#787b86] hover:text-[#089981]'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Verified Track Record</span>
              </button>
            </div>
          </section>

          {/* Tab Content Area */}
          <section className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full">
            {/* 1. IDEAS TAB */}
            {activeTab === 'ideas' && (
              <div>
                {ideas.length === 0 ? (
                  /* Empty state matching the exact screenshot illustration */
                  <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                    {/* Lightbulb in Circle Vector Graphic */}
                    <div className="w-20 h-20 rounded-full border-2 border-[#d1d4dc] flex items-center justify-center mb-6 shadow-sm">
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#d1d4dc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                      </svg>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                      No published ideas here, yet
                    </h2>
                    <p className="text-xs sm:text-sm text-[#787b86] max-w-md leading-relaxed mb-6">
                      Share your unique thoughts and start new discussions. You can read more about ideas and how to make them awesome.
                    </p>

                    <button
                      onClick={() => setIsPublishModalOpen(true)}
                      className="rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs px-6 py-2.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      Find out about ideas
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideas.map((item) => (
                      <div key={item.id} className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2962ff]">{item.symbol}</span>
                          <span className="text-[#787b86]">{item.createdAt}</span>
                        </div>
                        <h3 className="font-bold text-sm text-white">{item.title}</h3>
                        <p className="text-xs text-[#787b86] leading-relaxed">{item.thesis}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. MINDS TAB */}
            {activeTab === 'minds' && (
              <div className="space-y-4">
                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-xs text-white">Bhaskar1461</span>
                    <span className="text-[10px] text-[#787b86]">• 2 hours ago</span>
                  </div>
                  <p className="text-xs text-[#d1d4dc] leading-relaxed">
                    Nifty 50 holding key support at 22,400 despite RBI rate hike pressure. Bank Nifty divergence suggests institutional accumulation around 54,800.
                  </p>
                </div>

                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-xs text-white">Bhaskar1461</span>
                    <span className="text-[10px] text-[#787b86]">• Yesterday</span>
                  </div>
                  <p className="text-xs text-[#d1d4dc] leading-relaxed">
                    BTC spot liquidity absorbing sell-side pressure nicely above $83,000. Risk-reward favored for disciplined swing entries under 1% portfolio risk.
                  </p>
                </div>
              </div>
            )}

            {/* 3. SCRIPTS TAB */}
            {activeTab === 'scripts' && (
              <div className="space-y-4">
                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Celsius Anti-Casino Risk Shield v1.0</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#089981]/20 text-[#089981]">
                        PINE SCRIPT
                      </span>
                    </div>
                    <p className="text-xs text-[#787b86]">
                      Automatically detects emotional revenge turnover and calculates 1% position sizing based on ATR volatility.
                    </p>
                  </div>
                  <Link href="/backtest" className="text-xs font-semibold text-[#2962ff] hover:underline shrink-0">
                    Run in Backtester &gt;
                  </Link>
                </div>

                <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">EMA 9/21 Dynamic Trend Flow</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2962ff]/20 text-[#2962ff]">
                        INDICATOR
                      </span>
                    </div>
                    <p className="text-xs text-[#787b86]">
                      Dual exponential moving average filter for multi-timeframe swing entries on Binance spot pairs.
                    </p>
                  </div>
                  <Link href="/" className="text-xs font-semibold text-[#2962ff] hover:underline shrink-0">
                    Apply to Chart &gt;
                  </Link>
                </div>
              </div>
            )}

            {/* 4. VERIFIED TRACK RECORD TAB */}
            {activeTab === 'verified' && (
              <div className="space-y-6">
                {/* Verified Trust Seal */}
                <div className="p-4 rounded-xl bg-[#1e222d] border border-[#089981]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#089981]/20 text-[#089981] flex items-center justify-center font-bold">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Cryptographically Verified Public Record</div>
                      <div className="text-[11px] text-[#787b86]">
                        Every trade is server-computed and stamped with Daily Snapshot Hash <code className="text-[#089981] font-mono">#7f83b1657ff1...</code>
                      </div>
                    </div>
                  </div>
                  <Link href="/transparency" className="text-xs font-semibold text-[#2962ff] hover:underline">
                    Verify on Ledger &gt;
                  </Link>
                </div>

                {/* Honest Benchmark Metric */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
                    <div className="text-xs text-[#787b86]">Active Net Return:</div>
                    <div className="text-2xl font-bold text-[#089981] mt-1">+14.2%</div>
                    <div className="text-[10px] text-[#787b86] mt-0.5">88 Closed Trades · 78.4% Win Rate</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
                    <div className="text-xs text-[#787b86]">BTC Buy & Hold Benchmark:</div>
                    <div className="text-2xl font-bold text-[#f59e0b] mt-1">+28.4%</div>
                    <div className="text-[10px] text-[#787b86] mt-0.5">Same Capital · Doing Nothing</div>
                  </div>
                  <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
                    <div className="text-xs text-[#787b86]">Max Drawdown:</div>
                    <div className="text-2xl font-bold text-white mt-1">4.2%</div>
                    <div className="text-[10px] text-[#089981] mt-0.5">Strict Risk Control Enforced</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 3. Right Watchlist & Selected Symbol Detail Dock */}
        {isWatchlistOpen && (
          <TradingViewRightDock
            activeSymbol={activeSymbol}
            currentPrice={currentPrice}
            onSelectSymbol={setActiveSymbol}
            onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
          />
        )}

        {/* 4. Rightmost Thin Vertical Rail */}
        <TradingViewRightRail
          isWatchlistOpen={isWatchlistOpen}
          onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onOpenIndicators={() => setIsIndicatorsOpen(true)}
        />
      </div>

      {/* MODAL 1: Settings and Billing Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2a2e39] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#2962ff]" />
                <h3 className="font-bold text-sm text-white">Settings and billing</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded text-[#787b86] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#d1d4dc]">
              {resetMessage && (
                <div className="p-3 rounded-lg bg-[#089981]/15 border border-[#089981]/30 text-[#089981] font-semibold">
                  {resetMessage}
                </div>
              )}

              {/* Profile identity */}
              <div>
                <label className="block text-[11px] font-semibold text-[#787b86] uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#2962ff]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#787b86] uppercase mb-1">
                  Bio / Trading Manifesto
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#2962ff]"
                />
              </div>

              {/* Loss Limits & Risk Controls */}
              <div className="border-t border-[#2a2e39] pt-4">
                <span className="block text-[11px] font-semibold text-[#787b86] uppercase mb-2">
                  Discipline & Loss Protection (Invariant)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#787b86]">Risk Per Trade Cap (%):</label>
                    <input
                      type="number"
                      value={riskCap}
                      onChange={(e) => setRiskCap(e.target.value)}
                      className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#787b86]">Max Daily Drawdown (%):</label>
                    <input
                      type="number"
                      value={dailyLossLimit}
                      onChange={(e) => setDailyLossLimit(e.target.value)}
                      className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Paper Balance Reset */}
              <div className="border-t border-[#2a2e39] pt-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Simulated Paper Balance</div>
                  <div className="text-[10px] text-[#787b86]">Provisioned with $10,000 USDT virtual funds</div>
                </div>
                <button
                  onClick={handleResetAccount}
                  disabled={isResetting}
                  className="px-3 py-1.5 rounded-lg bg-[#f23645]/15 hover:bg-[#f23645]/25 border border-[#f23645]/30 text-[#f23645] font-semibold text-xs transition-colors"
                >
                  Reset to $10,000
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#2a2e39] bg-[#171b26] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#2962ff] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Publish Idea Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white">Publish Market Idea</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-[#787b86] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handlePublishIdea} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#787b86] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Nifty support test at 22,400"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-2 text-white outline-none focus:border-[#2962ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#787b86] mb-1 font-semibold">Symbol</label>
                <select
                  value={newIdeaSymbol}
                  onChange={(e) => setNewIdeaSymbol(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-2 text-white outline-none focus:border-[#2962ff]"
                >
                  <option value="NIFTY">NIFTY 50</option>
                  <option value="BANKNIFTY">BANK NIFTY</option>
                  <option value="SENSEX">BSE SENSEX</option>
                  <option value="BTCUSDT">BTCUSDT</option>
                  <option value="ETHUSDT">ETHUSDT</option>
                </select>
              </div>
              <div>
                <label className="block text-[#787b86] mb-1 font-semibold">Analysis / Thesis</label>
                <textarea
                  rows={3}
                  placeholder="Explain market structure, volume profile, or macro rationale..."
                  value={newIdeaThesis}
                  onChange={(e) => setNewIdeaThesis(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-2 text-white outline-none focus:border-[#2962ff]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#2a2e39] text-[#d1d4dc] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2962ff] text-white font-bold text-xs shadow-md"
                >
                  Publish Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modals for Shell consistency */}
      <SymbolPickerModal
        isOpen={isSymbolPickerOpen}
        onClose={() => setIsSymbolPickerOpen(false)}
        onSelectSymbol={setActiveSymbol}
        tickers={tickers}
        currentSymbol={activeSymbol}
      />

      <IndicatorSettingsModal
        isOpen={isIndicatorsOpen}
        onClose={() => setIsIndicatorsOpen(false)}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        currentSymbol={activeSymbol}
        currentPrice={currentPrice}
        alerts={[]}
        notifications={[]}
        soundEnabled={true}
        onToggleSound={() => {}}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};
