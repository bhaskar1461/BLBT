'use client';

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { TradingViewTopBar } from './TradingViewTopBar';
import { TradingViewDrawingToolbar } from '@/components/chart/TradingViewDrawingToolbar';
import { TradingViewSymbolRibbon } from '@/components/chart/TradingViewSymbolRibbon';
import { TradingViewMarketCards } from '@/components/chart/TradingViewMarketCards';
import { TradingViewRightDock } from '@/components/tradingview/TradingViewRightDock';
import { TradingViewRightRail } from '@/components/tradingview/TradingViewRightRail';
import { Sidebar } from './Sidebar';
import { TimeframeBar } from '@/components/chart/TimeframeBar';
import { Chart } from '@/components/chart/Chart';
import { SubChartRSI } from '@/components/chart/SubChartRSI';
import { SubChartMACD } from '@/components/chart/SubChartMACD';

import { IndicatorSettingsModal } from '@/components/chart/IndicatorSettingsModal';
import { SymbolPickerModal } from '@/components/topbar/SymbolPickerModal';
import { AlertsDrawer } from '@/components/alerts/AlertsDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { PaperTradingPanel } from '@/components/trading/PaperTradingPanel';
import { PositionsAndOrders } from '@/components/trading/PositionsAndOrders';
import { AnnouncementBanner } from '@/components/announcements/AnnouncementBanner';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { MobileTabBar } from './MobileTabBar';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { HonestOnboardingModal } from '@/components/onboarding/HonestOnboardingModal';
import { PostSessionReviewModal } from '@/components/trading/PostSessionReviewModal';
import { LandingHeroBanner } from './LandingHeroBanner';
import { TerminalSentimentStrip } from '@/components/sentiment/TerminalSentimentStrip';
import { BeginnerTradingSuite } from '@/components/trading/BeginnerTradingSuite';
import type { SessionReviewSummary } from '@/lib/lossProtectionService';
import { WeeklyRecapBanner } from '@/components/notifications/WeeklyRecapBanner';
import { analytics } from '@/lib/analytics';
import type { WeeklyRecap } from '@/types/trading';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useTradingStore } from '@/stores/useTradingStore';
import { storage } from '@/services/storage';
import { alertsEngine } from '@/services/alertsEngine';

export const Shell: React.FC = () => {
  const [terminalMode, setTerminalMode] = useState<'beginner' | 'pro'>('pro');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);
  const [isTradePanelOpen, setIsTradePanelOpen] = useState(false);
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSessionReviewOpen, setIsSessionReviewOpen] = useState(false);
  const [sessionReview, setSessionReview] = useState<SessionReviewSummary | null>(null);
  const [streakDays, setStreakDays] = useState(5);
  const [weeklyRecap, setWeeklyRecap] = useState<WeeklyRecap | null>(null);

  React.useEffect(() => {
    const savedMode = localStorage.getItem('celsius_terminal_mode');
    if (savedMode === 'pro' || savedMode === 'beginner') {
      setTerminalMode(savedMode);
    }
  }, []);

  const handleToggleTerminalMode = () => {
    const nextMode = terminalMode === 'beginner' ? 'pro' : 'beginner';
    setTerminalMode(nextMode);
    localStorage.setItem('celsius_terminal_mode', nextMode);
  };

  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);
  const indicators = useChartStore((s) => s.indicators);
  const candles = useChartStore((s) => s.candles);

  const tickers = useWatchlistStore((s) => s.tickers);
  const ticker = tickers[activeSymbol];
  const currentPrice = ticker?.lastPrice ?? (candles[candles.length - 1]?.close ?? 0);

  // Storage synced states for alerts & trading
  const [user, setUser] = useState(() => storage.getUserProfile());
  const [portfolio] = useState(() => storage.getPortfolio());
  const [orders] = useState(() => storage.getOrders());
  const [positions] = useState(() => storage.getPositions());
  const [alerts] = useState(() => storage.getPriceAlerts());
  const [notifications] = useState(() => storage.getAlertNotifications());
  const [announcements, setAnnouncements] = useState(() => storage.getAnnouncements());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync trading store with user and live tickers
  const initAccount = useTradingStore((s) => s.initAccount);
  const updateLiveEquity = useTradingStore((s) => s.updateLiveEquity);

  React.useEffect(() => {
    initAccount(user.id);
    const hasCompleted = localStorage.getItem('celsius_onboarding_completed');
    if (!hasCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user.id, initAccount]);

  React.useEffect(() => {
    const priceMap: Record<string, number> = {};
    for (const [sym, t] of Object.entries(tickers)) {
      if (t && t.lastPrice) priceMap[sym] = t.lastPrice;
    }
    if (Object.keys(priceMap).length > 0) {
      updateLiveEquity(priceMap);
    }
  }, [tickers, updateLiveEquity]);

  // Ping server on load to update last_active and fetch unread broadcasts & feature flags
  React.useEffect(() => {
    // 1. Ping user activity
    fetch('/api/user/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.isFrozen && user.status !== 'suspended') {
          const updated = { ...user, status: 'suspended' as const, isFrozen: true };
          storage.setUserProfile(updated);
          setUser(updated);
        }
        if (d?.unreadMessages && d.unreadMessages.length > 0) {
          const toastHandler = (alertsEngine as unknown as { toastCallback?: (t: string, m: string, y: 'success' | 'alert' | 'info') => void }).toastCallback;
          if (toastHandler) {
            d.unreadMessages.forEach((msg: { title: string; content: string }) => {
              toastHandler(`📢 ${msg.title}`, msg.content, 'info');
            });
          }
        }
        if (d?.streak?.currentStreak) {
          setStreakDays(d.streak.currentStreak);
        }
        if (d?.weeklyRecap) {
          setWeeklyRecap(d.weeklyRecap);
        }
        analytics.track('page_view', { page: '/' });
      })
      .catch(() => {});

    // 2. Fetch live feature flags and active announcements
    fetch('/api/features')
      .then((r) => r.json())
      .then((d) => {
        if (d?.announcements) {
          setAnnouncements(d.announcements);
        }
        if (d?.flags) {
          storage.setFeatureFlags({
            ...storage.getFeatureFlags(),
            paper_trading: d.flags.paper_trading !== false,
            indicators: d.flags.indicators !== false,
            alerts: d.flags.alerts !== false,
          });
        }
      })
      .catch(() => {});
  }, [user.id]);

  const activeAlertsCount = alerts.filter((a) => a.active).length;

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-canvas text-main font-sans">
      {/* 0. Weekly Performance Recap (Shown Mondays or active recap) */}
      <WeeklyRecapBanner
        recap={weeklyRecap}
        onDismiss={() => setWeeklyRecap(null)}
      />

      {/* 1. Global Announcement */}
      <AnnouncementBanner announcements={announcements} />

      {/* 2. Top Header Bar: TradingView Pro Navigation */}
      <TradingViewTopBar
        onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
        onOpenIndicators={() => setIsIndicatorsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        activeAlertsCount={activeAlertsCount}
        streakDays={streakDays}
        terminalMode={terminalMode}
        onToggleTerminalMode={handleToggleTerminalMode}
      />

      {/* 2.5 Landing Mission Hero Banner (Prompt 10.1) */}
      <LandingHeroBanner />

      {/* 3. Main Workspace: Beginner Guided Suite vs Pro TradingView Terminal */}
      {terminalMode === 'beginner' ? (
        <div className="flex-1 flex overflow-hidden relative">
          <BeginnerTradingSuite
            onSwitchToPro={() => {
              setTerminalMode('pro');
              localStorage.setItem('celsius_terminal_mode', 'pro');
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden relative bg-[#131722]">
          {/* 1. Left Vertical Drawing Tools Bar (TradingView Toolstrip) */}
          <TradingViewDrawingToolbar />

          {/* 2. Center Workspace: Symbol Ribbon + Live Chart + Market Cards + Positions Dock */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#131722] overflow-hidden">
            {/* Top Market Summary & Symbol Ribbon */}
            <TradingViewSymbolRibbon
              onOpenIndicators={() => setIsIndicatorsOpen(true)}
              onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
            />

            {/* Terminal Sentiment Context Strip */}
            <TerminalSentimentStrip symbol={activeSymbol} />

            {/* Lightweight Charts Canvas */}
            <div className="flex-1 min-h-0 relative bg-[#131722]">
              <Chart />
              {indicators.rsi.enabled && <SubChartRSI />}
              {indicators.macd.enabled && <SubChartMACD />}
            </div>

            {/* Bottom Market Cards (Major Indices BSE/NSE & Crypto Market Cap) */}
            <TradingViewMarketCards />

            {/* Bottom Collapsible Dock: Positions, Orders, Ledger Audit */}
            <PositionsAndOrders
              positions={positions}
              orders={orders}
              currentPrice={currentPrice}
            />
          </div>

          {/* 3. Right Watchlist & Selected Symbol Detail Dock (Daftar Pantau + Detail + 1-Click Buy/Sell) */}
          {isWatchlistOpen && (
            <TradingViewRightDock
              activeSymbol={activeSymbol}
              currentPrice={currentPrice}
              onSelectSymbol={setActiveSymbol}
              onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
              onToggleTradePanel={() => setIsTradePanelOpen(!isTradePanelOpen)}
            />
          )}

          {/* Optional Advanced Paper Trading Side Drawer */}
          {isTradePanelOpen && (
            <div className="w-80 border-l border-[#2a2e39] bg-[#1e222d] shrink-0 overflow-y-auto">
              <PaperTradingPanel
                currentSymbol={activeSymbol}
                currentPrice={currentPrice}
                portfolio={portfolio}
              />
            </div>
          )}

          {/* 4. Rightmost Thin Icon Rail (TradingView Right-side Toolbar) */}
          <TradingViewRightRail
            isWatchlistOpen={isWatchlistOpen}
            onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenIndicators={() => setIsIndicatorsOpen(true)}
            onToggleTradePanel={() => setIsTradePanelOpen(!isTradePanelOpen)}
          />
        </div>
      )}

      {/* 4. Mobile Bottom Navigation Bar with Trading Tab */}
      <MobileTabBar
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        onToggleTradePanel={() => setIsTradePanelOpen(!isTradePanelOpen)}
        isWatchlistOpen={isWatchlistOpen}
        isTradePanelOpen={isTradePanelOpen}
      />

      {/* 5. Modals */}
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
        alerts={alerts}
        notifications={notifications}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userId={user.id}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* 5b. Honest Onboarding & Discipline Setup (<60s) */}
      <HonestOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* 5c. Post-Session Review (Prompt 3.3) */}
      {sessionReview && (
        <PostSessionReviewModal
          isOpen={isSessionReviewOpen}
          onClose={() => setIsSessionReviewOpen(false)}
          review={sessionReview}
        />
      )}

      {/* 6. Toasts */}
      <ToastContainer />
    </div>
  );
};
