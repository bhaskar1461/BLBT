'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Crown,
  Trophy,
  Flame,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Settings,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  AlertTriangle,
  Activity,
  Award,
  Clock,
  PieChart,
} from 'lucide-react';
import type { TraderProfile } from '@/types/profile';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { BenchmarkComparisonBanner } from '@/components/trading/BenchmarkComparisonBanner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onProfileUpdated?: (profile: TraderProfile) => void;
  onOpenShareCard?: (tradeId: string) => void;
  onOpenOnboarding?: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  userId = 'usr_celsius_demo',
  onProfileUpdated,
  onOpenShareCard,
  onOpenOnboarding,
}: ProfileModalProps) {
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dna' | 'positions' | 'journal' | 'badges' | 'settings'>('dna');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCountry, setEditCountry] = useState('US');
  const [editTradingStyle, setEditTradingStyle] = useState<TraderProfile['tradingStyle']>('day_trader');
  const [editTwitter, setEditTwitter] = useState('');
  const [editDiscord, setEditDiscord] = useState('');
  const [editTelegram, setEditTelegram] = useState('');
  const [editPublic, setEditPublic] = useState(true);
  const [editShowBalance, setEditShowBalance] = useState(true);
  const [editShowPositions, setEditShowPositions] = useState(true);
  const [editShowHistory, setEditShowHistory] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/profile', {
          headers: { 'x-user-id': userId },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile && isMounted) {
            setProfile(data.profile);
            initEditForm(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  function initEditForm(p: TraderProfile) {
    setEditDisplayName(p.displayName || '');
    setEditUsername(p.username || '');
    setEditBio(p.bio || '');
    setEditCountry(p.country || 'US');
    setEditTradingStyle(p.tradingStyle || 'day_trader');
    setEditTwitter(p.socials?.twitter || '');
    setEditDiscord(p.socials?.discord || '');
    setEditTelegram(p.socials?.telegram || '');
    setEditPublic(p.privacy.isPublicProfile);
    setEditShowBalance(p.privacy.showBalanceUsdt);
    setEditShowPositions(p.privacy.showOpenPositions);
    setEditShowHistory(p.privacy.showTradeHistory);
  }

  async function handleSaveSettings() {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          displayName: editDisplayName,
          username: editUsername,
          bio: editBio,
          country: editCountry,
          tradingStyle: editTradingStyle,
          socials: {
            twitter: editTwitter,
            discord: editDiscord,
            telegram: editTelegram,
          },
          privacy: {
            isPublicProfile: editPublic,
            showBalanceUsdt: editShowBalance,
            showOpenPositions: editShowPositions,
            showTradeHistory: editShowHistory,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        onProfileUpdated?.(data.profile);
        setStatusMessage('Profile updated successfully!');
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setStatusMessage(data.error || 'Failed to update profile.');
      }
    } catch {
      setStatusMessage('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetAccount() {
    setResetting(true);
    try {
      const res = await fetch('/api/profile/reset', {
        method: 'POST',
        headers: { 'x-user-id': userId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          onProfileUpdated?.(data.profile);
          setResetConfirmOpen(false);
          setStatusMessage('Account reset to default 10,000 USDT virtual funding.');
          setTimeout(() => setStatusMessage(null), 4000);
        }
      }
    } catch {
      setStatusMessage('Failed to reset account.');
    } finally {
      setResetting(false);
    }
  }

  function handleCopyShareLink() {
    if (!profile) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  if (!isOpen) return null;

  const isVip = profile?.tier === 'vip';
  const stats = profile?.stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-panel border border-subtle rounded-2xl shadow-2xl shadow-black/60 overflow-hidden text-main">
        {/* Modal Header & Profile Banner */}
        <div className="relative border-b border-subtle bg-gradient-to-r from-canvas via-panel to-canvas p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-faint hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-subtle" />
              <div className="space-y-2">
                <div className="w-48 h-5 bg-subtle rounded" />
                <div className="w-32 h-4 bg-subtle rounded" />
              </div>
            </div>
          ) : profile ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/40 shadow-lg shadow-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-canvas border border-subtle">
                    {isVip ? (
                      <Crown size={14} className="text-amber-400" />
                    ) : (
                      <Shield size={14} className="text-bull" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {profile.displayName}
                    </h2>
                    <span className="text-xs font-mono text-faint">
                      @{profile.username}
                    </span>
                    {profile.country && (
                      <span className="text-xs px-2 py-0.5 rounded bg-subtle text-muted font-mono font-bold">
                        {profile.country}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted max-w-lg mt-1 line-clamp-2">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {isVip ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown size={11} /> VIP Institutional Allocator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20">
                        <Shield size={11} /> Verified Paper Trader
                      </span>
                    )}

                    {stats?.leaderboardRank && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Trophy size={11} /> Leaderboard #{stats.leaderboardRank}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-bear/10 text-bear border border-bear/20">
                      <Flame size={11} /> {stats?.streakDays || 1}d Streak
                    </span>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-faint capitalize">
                      {profile.tradingStyle.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white border border-subtle transition-colors"
                >
                  {copiedLink ? <Check size={13} className="text-bull" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 -mb-4 overflow-x-auto no-scrollbar border-t border-subtle/50 pt-2">
            {[
              { id: 'dna', label: 'Trading DNA & KPIs', icon: Activity },
              { id: 'positions', label: 'Active Positions', icon: PieChart },
              { id: 'journal', label: 'Trade Journal', icon: Clock },
              { id: 'badges', label: 'Badges & Milestones', icon: Award },
              { id: 'settings', label: 'Settings & Security', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-faint hover:text-main hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="px-6 py-2.5 bg-primary/10 border-b border-primary/20 text-xs font-semibold text-primary flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TRADING DNA & KPIS */}
          {activeTab === 'dna' && stats && (
            <div className="space-y-6">
              {/* Primary Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-canvas border border-subtle">
                  <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
                    Net Equity
                  </span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    ${formatPrice(stats.currentEquity, 2)}
                  </div>
                  {isVip && (
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                      {formatInrCrore(stats.currentEquity)}
                    </div>
                  )}
                  <span className="text-[11px] text-muted">
                    Initial: ${formatPrice(stats.initialBalance, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-canvas border border-subtle">
                  <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
                    Realized Return
                  </span>
                  <div
                    className={`text-lg font-bold font-mono mt-0.5 ${
                      stats.totalRealizedPnl >= 0 ? 'text-bull' : 'text-bear'
                    }`}
                  >
                    {stats.totalRealizedPnl >= 0 ? '+' : ''}${formatPrice(stats.totalRealizedPnl, 2)}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      stats.realizedPnlPct >= 0 ? 'text-bull' : 'text-bear'
                    }`}
                  >
                    {stats.realizedPnlPct >= 0 ? '+' : ''}
                    {stats.realizedPnlPct}% P&L
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-canvas border border-subtle">
                  <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
                    Win Rate
                  </span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {stats.winRatePct}%
                  </div>
                  <span className="text-[11px] text-muted">
                    {stats.winningTrades}W / {stats.losingTrades}L ({stats.totalTrades} total)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-canvas border border-subtle">
                  <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
                    Profit Factor
                  </span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {stats.profitFactor}x
                  </div>
                  <span className="text-[11px] text-muted">
                    Avg Hold: {stats.averageTradeDuration}
                  </span>
                </div>
              </div>

              {/* ₿ PROMPT 3.1: BTC BUY-AND-HOLD BENCHMARK CONTEXT */}
              <BenchmarkComparisonBanner userId={userId} variant="banner" periodDays={30} />

              {/* Trading DNA Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Long vs Short Ratio */}
                <div className="p-4 rounded-xl bg-canvas border border-subtle">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-faint mb-3">
                    Position Direction Bias
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-semibold">
                      <span className="text-bull">LONGS: {stats.longShortRatio.longs}</span>
                      <span className="text-bear">SHORTS: {stats.longShortRatio.shorts}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-subtle overflow-hidden flex">
                      <div
                        className="h-full bg-bull transition-all"
                        style={{
                          width: `${
                            stats.totalTrades > 0
                              ? Math.round(
                                  (stats.longShortRatio.longs / stats.totalTrades) * 100
                                )
                              : 50
                          }%`,
                        }}
                      />
                      <div
                        className="h-full bg-bear transition-all"
                        style={{
                          width: `${
                            stats.totalTrades > 0
                              ? Math.round(
                                  (stats.longShortRatio.shorts / stats.totalTrades) * 100
                                )
                              : 50
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Favorite Pairs */}
                <div className="p-4 rounded-xl bg-canvas border border-subtle">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-faint mb-3">
                    Most Traded Pairs
                  </h4>
                  <div className="space-y-2">
                    {stats.favoritePairs.map((pair) => (
                      <div key={pair.symbol} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-white">{pair.symbol}</span>
                          <span className="text-faint font-mono text-[11px]">
                            {pair.tradesCount} trades ({pair.volumePct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-subtle overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pair.volumePct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best & Worst Trade Callouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-bull/5 border border-bull/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bull">
                      🏆 Best Trade
                    </span>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {stats.largestWin ? stats.largestWin.symbol : 'None yet'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-bull">
                      {stats.largestWin ? `+$${formatPrice(stats.largestWin.pnl, 2)}` : '$0.00'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-bear/5 border border-bear/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bear">
                      ⚠️ Largest Drawdown
                    </span>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {stats.largestLoss ? stats.largestLoss.symbol : 'None yet'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-bear">
                      {stats.largestLoss ? `-$${formatPrice(Math.abs(stats.largestLoss.pnl), 2)}` : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE POSITIONS */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-faint">
                  Live Open Positions
                </h3>
                <span className="text-xs text-muted">
                  Prices stream real-time from Binance Spot
                </span>
              </div>

              <div className="p-6 rounded-xl bg-canvas border border-subtle text-center text-sm text-faint">
                <p>Open active positions are managed in the main terminal dock panel.</p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-canvas hover:bg-primary-hover transition-colors"
                >
                  View in Terminal Dock
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TRADE JOURNAL */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-faint">
                  Closed Trades Journal
                </h3>
                <span className="text-xs text-muted">
                  Immutable execution ledger
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-subtle bg-canvas">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-subtle/40 border-b border-subtle text-faint uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Symbol</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3">Entry</th>
                      <th className="py-2.5 px-3">Exit</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">P&L ($)</th>
                      <th className="py-2.5 px-3">P&L (%)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/30">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">BTCUSDT</td>
                      <td className="py-3 px-3 text-bull font-bold">LONG</td>
                      <td className="py-3 px-3 text-muted">$62,450.00</td>
                      <td className="py-3 px-3 text-muted">$65,120.00</td>
                      <td className="py-3 px-3 text-faint">4h 00m</td>
                      <td className="py-3 px-3 text-bull font-bold">+$1,335.00</td>
                      <td className="py-3 px-3 text-bull font-bold">+4.27%</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenShareCard?.('trade_sample_01')}
                          className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-primary border border-subtle transition-colors"
                        >
                          Share Card
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">ETHUSDT</td>
                      <td className="py-3 px-3 text-bull font-bold">LONG</td>
                      <td className="py-3 px-3 text-muted">$3,280.00</td>
                      <td className="py-3 px-3 text-muted">$3,420.00</td>
                      <td className="py-3 px-3 text-faint">2h 15m</td>
                      <td className="py-3 px-3 text-bull font-bold">+$420.00</td>
                      <td className="py-3 px-3 text-bull font-bold">+4.27%</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenShareCard?.('trade_sample_02')}
                          className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-primary border border-subtle transition-colors"
                        >
                          Share Card
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BADGES & MILESTONES */}
          {activeTab === 'badges' && profile && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-faint">
                Trader Achievement Badges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all ${
                      badge.isUnlocked
                        ? 'bg-canvas border-primary/30 shadow-md shadow-primary/5'
                        : 'bg-canvas/50 border-subtle/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          badge.isUnlocked
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-white/5 text-faint border border-subtle'
                        }`}
                      >
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                        <span className="text-[10px] font-mono text-faint">
                          {badge.isUnlocked ? 'Unlocked' : `${badge.progressPct || 0}% Complete`}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed">
                      {badge.description}
                    </p>

                    {!badge.isUnlocked && (
                      <div className="w-full h-1 bg-subtle rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${badge.progressPct || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS & SECURITY */}
          {activeTab === 'settings' && profile && (
            <div className="space-y-6">
              {/* Identity & Bio Form */}
              <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-faint">
                  Profile Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-faint mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-panel border border-subtle text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-faint mb-1">
                      Username (@handle)
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-panel border border-subtle text-xs text-white font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-faint mb-1">
                    Bio / Trading Thesis
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-panel border border-subtle text-xs text-white focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-faint mb-1">
                      Twitter / X Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@handle"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-panel border border-subtle text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-faint mb-1">
                      Discord Username
                    </label>
                    <input
                      type="text"
                      placeholder="username#tag"
                      value={editDiscord}
                      onChange={(e) => setEditDiscord(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-panel border border-subtle text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-faint mb-1">
                      Telegram
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={editTelegram}
                      onChange={(e) => setEditTelegram(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-panel border border-subtle text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-faint">
                  Privacy & Public Visibility
                </h4>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-panel/60 border border-subtle/50 text-xs cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Make my track record public</span>
                      <span className="text-[11px] text-faint leading-relaxed block mt-0.5">
                        All-or-nothing: your complete trade history (every win and loss) will be publicly verifiable at /u/{editUsername || profile.username} and stamped with the daily ledger snapshot hash. No hiding losing months. A public profile is a resume, not a highlight reel.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editPublic}
                      onChange={(e) => setEditPublic(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-panel/60 border border-subtle/50 text-xs cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Show USDT Balance</span>
                      <span className="text-[11px] text-faint">
                        When off, public viewers only see your % return, hiding exact dollars
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editShowBalance}
                      onChange={(e) => setEditShowBalance(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-panel/60 border border-subtle/50 text-xs cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Show Trade History</span>
                      <span className="text-[11px] text-faint">
                        Allow other traders to inspect closed trade journal
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editShowHistory}
                      onChange={(e) => setEditShowHistory(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                {onOpenOnboarding && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white font-medium text-xs border border-subtle transition-colors flex items-center gap-1.5"
                  >
                    <span>⚖️ Review Honest Onboarding</span>
                  </button>
                )}
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-canvas font-bold text-xs transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 ml-auto"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

              {/* Danger Zone: Account Reset */}
              <div className="p-4 rounded-xl bg-bear/5 border border-bear/20 space-y-3">
                <div className="flex items-center gap-2 text-bear font-bold text-xs">
                  <AlertTriangle size={15} />
                  <span>Account Reset (Virtual Balance)</span>
                </div>
                <p className="text-[11px] text-muted">
                  Wipe all simulated positions, open orders, and restore your virtual balance back to 10,000.00 USDT. An immutable reset ledger record will be appended.
                </p>

                {resetConfirmOpen ? (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleResetAccount}
                      disabled={resetting}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-bear text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {resetting ? 'Resetting...' : 'Yes, Reset to 10,000 USDT'}
                    </button>
                    <button
                      onClick={() => setResetConfirmOpen(false)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-faint"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetConfirmOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-bear/10 hover:bg-bear/20 text-bear border border-bear/30 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Account to 10,000 USDT</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
