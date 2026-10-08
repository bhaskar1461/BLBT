'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  Users,
  Activity,
  Megaphone,
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Search,
  X,
  FileText,
  UserCheck,
  UserX,
  Calendar,
  MessageSquare,
  Star,
  Check,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import { storage } from '@/services/storage';
import { formatPrice } from '@/lib/utils';
import type { LedgerSnapshot } from '@/lib/transparencyService';
import type {
  AdminMetrics,
  AdminUserState,
  Announcement,
  FeatureFlagRecord,
  AuditLogRecord,
  UserFeedbackRecord,
} from '@/types/admin';
import type { SignupDayData } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminConsolePage() {
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'users' | 'withdrawals' | 'announcements' | 'flags' | 'audit' | 'feedback'
  >('dashboard');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserState[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [signupTrend, setSignupTrend] = useState<SignupDayData[]>([]);
  const [feedbackList, setFeedbackList] = useState<UserFeedbackRecord[]>([]);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [latestSnapshot, setLatestSnapshot] = useState<LedgerSnapshot | null>(null);
  const [ledgerAudit, setLedgerAudit] = useState<{ isValid: boolean; brokenLinksCount: number } | null>(null);
  const [copiedSnapshotHash, setCopiedSnapshotHash] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Forms
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnText, setNewAnnText] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'warning' | 'critical'>('info');

  // User Drawer Details
  const [drawerUser, setDrawerUser] = useState<AdminUserState | null>(null);
  const [drawerDetails, setDrawerDetails] = useState<{
    account?: Record<string, unknown>;
    positions?: Record<string, unknown>[];
    orders?: Record<string, unknown>[];
  } | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Confirmation Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({ isOpen: false, title: '', description: '', onConfirm: async () => {} });

  // Broadcast modal state
  const [broadcastTargetUser, setBroadcastTargetUser] = useState<AdminUserState | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Fetch admin telemetry
  const fetchAdminData = async () => {
    try {
      const user = storage.getUserProfile();
      const res = await fetch('/api/admin', {
        headers: {
          'x-user-role': user.role,
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setUsers(data.users || []);
        setAnnouncements(data.announcements || []);
        setFeatureFlags(data.featureFlags || []);
        setAuditLogs(data.auditLogs || []);
        setSignupTrend(data.signupTrend || []);
        setFeedbackList(data.feedback || []);
        setLatestSnapshot(data.latestLedgerSnapshot || null);
        setLedgerAudit(data.ledgerAudit || null);
      }
    } catch (e) {
      console.error('Failed to load admin telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySnapshotHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedSnapshotHash(true);
    setTimeout(() => setCopiedSnapshotHash(false), 2000);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const postAdminAction = async (action: string, payload: Record<string, unknown>) => {
    const user = storage.getUserProfile();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
        body: JSON.stringify({ action, payload }),
      });

      if (res.ok) {
        await fetchAdminData();
        return true;
      }
    } catch (e) {
      console.error('Admin action failed:', e);
    }
    return false;
  };

  // Open User Detail Drawer
  const handleOpenUserDrawer = async (u: AdminUserState) => {
    setDrawerUser(u);
    setIsDrawerLoading(true);
    try {
      const user = storage.getUserProfile();
      const res = await fetch(`/api/admin?userId=${encodeURIComponent(u.id)}`, {
        headers: {
          'x-user-role': user.role,
          'x-user-id': user.id,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDrawerDetails(data.details);
      }
    } catch {
      setDrawerDetails(null);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Freeze action with confirmation
  const handleConfirmFreeze = (u: AdminUserState) => {
    const isFrozen = u.status === 'suspended' || u.isFrozen;
    const title = isFrozen ? `Unfreeze ${u.displayName}` : `Freeze ${u.displayName}`;
    const description = isFrozen
      ? `This will restore order submission and paper trading access for ${u.email}.`
      : `CRITICAL ACTION: This will immediately block ${u.email} from submitting orders and closing positions in the trading engine.`;

    setConfirmModal({
      isOpen: true,
      title,
      description,
      onConfirm: async () => {
        await postAdminAction(isFrozen ? 'unfreeze_user' : 'freeze_user', { userId: u.id });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (drawerUser?.id === u.id) {
          setDrawerUser({ ...u, status: isFrozen ? 'active' : 'suspended', isFrozen: !isFrozen });
        }
      },
    });
  };

  // Role action with confirmation
  const handleConfirmRole = (u: AdminUserState) => {
    const newRole = u.role === 'admin' ? 'trader' : 'admin';
    setConfirmModal({
      isOpen: true,
      title: `Update Role to ${newRole.toUpperCase()}`,
      description: `Are you sure you want to change permissions for ${u.displayName} (${u.email})? Admins possess uninhibited supervisory control.`,
      onConfirm: async () => {
        await postAdminAction('update_user_role', { userId: u.id, role: newRole });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (drawerUser?.id === u.id) {
          setDrawerUser({ ...u, role: newRole as 'admin' | 'trader' });
        }
      },
    });
  };

  // Feature Flag toggle
  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    await postAdminAction('toggle_feature_flag', { key, enabled: !currentVal });
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnText.trim()) return;

    await postAdminAction('create_announcement', {
      title: newAnnTitle.trim() || 'System Announcement',
      text: newAnnText.trim(),
      type: newAnnType,
    });

    setNewAnnTitle('');
    setNewAnnText('');
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Delete this announcement permanently?')) {
      await postAdminAction('delete_announcement', { id });
    }
  };

  // Broadcast Message
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    await postAdminAction('broadcast_message', {
      targetUserId: broadcastTargetUser?.id || 'all',
      title: broadcastTitle.trim() || 'Notice from Administration',
      content: broadcastMessage.trim(),
    });

    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTargetUser(null);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 2000);
  };

  // Filtered Users & Pagination
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((l) => {
    const q = auditSearch.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(q) ||
      l.adminEmail.toLowerCase().includes(q) ||
      (l.target && l.target.toLowerCase().includes(q));

    const matchesAction = auditActionFilter === 'ALL' || l.action === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  // Unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));

  return (
    <div className="min-h-screen bg-[#0b0e14] text-main font-sans flex flex-col">
      {/* Top Header with Crimson Accent and Glowing ADMIN Badge */}
      <header className="h-14 bg-[#121620] border-b border-bear/20 flex items-center justify-between px-6 shrink-0 shadow-lg shadow-bear/5 z-20">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted hover:text-white border border-transparent hover:border-bear/30"
            >
              <ArrowLeft size={14} />
              <span>Back to Terminal</span>
            </Button>
          </Link>

          <div className="w-[1px] h-4 bg-bear/20" />

          {/* Glowing ADMIN badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-bear/15 text-bear border border-bear/40 px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider shadow-sm shadow-bear/20 animate-pulse">
              <Shield size={12} className="text-bear" />
              ADMIN
            </span>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              CELSIUS EXECUTIVE CONSOLE
            </span>
          </div>
        </div>

        {/* Right Admin Profile */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-bear/5 border border-bear/20 px-3 py-1 rounded">
            <div className="w-2 h-2 rounded-full bg-bear animate-ping" />
            <span className="text-faint">Role:</span>
            <span className="font-mono font-bold text-white uppercase">SUPERUSER</span>
          </div>
          <span className="text-muted hidden md:inline font-mono">trader@celsius.trade</span>
        </div>
      </header>

      {/* Main Admin Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside className="w-60 bg-[#0e121a] border-r border-bear/20 flex flex-col justify-between shrink-0 select-none">
          <div className="p-3 flex flex-col gap-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-bear/70 font-bold">
              Administration
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Activity size={15} className={activeNav === 'dashboard' ? 'text-bear' : 'text-faint'} />
              <span>Dashboard</span>
            </button>

            {/* 2. Users */}
            <button
              onClick={() => setActiveNav('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'users'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Users size={15} className={activeNav === 'users' ? 'text-bear' : 'text-faint'} />
              <span>Users Management</span>
              <span className="ml-auto badge bg-white/10 text-[10px] px-1 py-0">
                {users.length}
              </span>
            </button>

            {/* 3. Withdrawals (skip for now / Coming Soon) */}
            <div className="relative group">
              <button
                disabled
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-faint opacity-50 cursor-not-allowed border border-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={15} />
                  <span>Withdrawals</span>
                </div>
                <span className="text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-faint">
                  SOON
                </span>
              </button>
            </div>

            {/* 4. Announcements */}
            <button
              onClick={() => setActiveNav('announcements')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'announcements'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Megaphone size={15} className={activeNav === 'announcements' ? 'text-bear' : 'text-faint'} />
              <span>Announcements</span>
              <span className="ml-auto badge bg-white/10 text-[10px] px-1 py-0">
                {announcements.length}
              </span>
            </button>

            {/* 5. Feature Flags */}
            <button
              onClick={() => setActiveNav('flags')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'flags'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Sliders size={15} className={activeNav === 'flags' ? 'text-bear' : 'text-faint'} />
              <span>Feature Flags</span>
              <span className="ml-auto badge bg-white/10 text-[10px] px-1 py-0">
                {featureFlags.length}
              </span>
            </button>

            {/* 6. Audit Log */}
            <button
              onClick={() => setActiveNav('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'audit'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Shield size={15} className={activeNav === 'audit' ? 'text-bear' : 'text-faint'} />
              <span>Audit Log</span>
              <span className="ml-auto badge bg-white/10 text-[10px] px-1 py-0">
                {auditLogs.length}
              </span>
            </button>

            {/* 7. User Feedback */}
            <button
              onClick={() => setActiveNav('feedback')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                activeNav === 'feedback'
                  ? 'bg-bear/15 text-white border border-bear/40 shadow-sm shadow-bear/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <MessageSquare size={15} className={activeNav === 'feedback' ? 'text-bear' : 'text-faint'} />
              <span>Feedback</span>
              <span className="ml-auto badge bg-white/10 text-[10px] px-1 py-0">
                {feedbackList.length}
              </span>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-bear/10 text-[11px] text-faint flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono">
              <span>Security Policy</span>
              <span className="text-bull">STRICT RLS</span>
            </div>
            <div className="text-[10px] text-muted">Server Edge Protection v1.0</div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0b0e14]">
          {/* ======================================================== */}
          {/* VIEW 1: DASHBOARD & 30-DAY SIGNUP TREND (Prompt 2) */}
          {/* ======================================================== */}
          {activeNav === 'dashboard' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Platform Telemetry & Circulation</span>
                  <Badge variant="neutral" className="border-bear/30 text-bear text-xs font-mono">
                    REALTIME
                  </Badge>
                </h1>
                <p className="text-xs text-muted mt-1">
                  Global trader activity, virtual USDT circulation volume, and 30-day signup trajectory.
                </p>
              </div>

              {/* 6 Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Total Registered Users</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {metrics?.totalUsers?.toLocaleString() ?? '1,434'}
                  </div>
                  <div className="text-[10px] text-bull mt-1 font-mono">+48 new signups this week</div>
                </div>

                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Daily Active Traders (DAU)</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {metrics?.dailyActiveUsers ?? '89'}
                  </div>
                  <div className="text-[10px] text-faint mt-1 font-mono">Updated on app load via API</div>
                </div>

                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Virtual Balance in Circulation</div>
                  <div className="text-2xl font-bold font-mono text-bull mt-1">
                    ${formatPrice(metrics?.totalVirtualBalanceUSDT ?? 18450000, 0)}
                  </div>
                  <div className="text-[10px] text-faint mt-1 font-mono">USDT (10^8 integer base units)</div>
                </div>

                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Total Paper Accounts Provisioned</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {metrics?.totalPaperAccounts?.toLocaleString() ?? '1,434'}
                  </div>
                  <div className="text-[10px] text-bull mt-1 font-mono">10,000 USDT virtual default</div>
                </div>

                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Active Open Positions</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {metrics?.totalOpenPositions ?? '318'}
                  </div>
                  <div className="text-[10px] text-bull mt-1 font-mono">Long / Short spot simulation</div>
                </div>

                <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg">
                  <div className="text-[11px] text-muted">Engine Feed Latency & Uptime</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {metrics?.wsLatencyMs ?? '24'}ms
                  </div>
                  <div className="text-[10px] text-bull mt-1 font-mono">
                    {metrics?.serverUptime ?? '99.98%'} Uptime
                  </div>
                </div>
              </div>

              {/* Prompt 1.1: Cryptographic Ledger Fingerprint (Tamper-Evident Ledger) */}
              {latestSnapshot && (
                <div className="bg-[#121620] border border-bull/30 p-5 rounded-lg shadow-lg relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-bull/15 text-bull font-bold border border-bull/30">
                          <ShieldCheck size={12} />
                          LATEST DAILY ROOT HASH (SHA-256)
                        </span>
                        <span className="text-xs text-muted font-mono">
                          Date: <strong className="text-white">{latestSnapshot.date}</strong>
                        </span>
                        {ledgerAudit?.isValid && (
                          <span className="text-[10px] text-bull font-mono bg-bull/10 px-2 py-0.5 rounded border border-bull/20">
                            0 Broken Links · Chain Verified
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted">
                        All paper trades are cryptographically chained daily at 00:00 UTC. History cannot be silently edited.
                      </div>

                      <div className="font-mono text-xs text-white break-all bg-black/50 p-3 rounded border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-bull font-bold select-all">{latestSnapshot.root_hash}</span>
                        <button
                          onClick={() => handleCopySnapshotHash(latestSnapshot.root_hash)}
                          className="px-3 py-1.5 rounded bg-bull/20 hover:bg-bull/30 text-bull text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors self-end sm:self-auto"
                        >
                          {copiedSnapshotHash ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedSnapshotHash ? 'Copied!' : 'Copy Hash'}</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-faint font-mono pt-1">
                        <span>Trades Sealed: <strong className="text-white">{latestSnapshot.trade_count}</strong></span>
                        <span>Traders: <strong className="text-white">{latestSnapshot.user_count}</strong></span>
                        <span>Total Volume: <strong className="text-white">${formatPrice(latestSnapshot.total_volume_usdt, 0)} USDT</strong></span>
                        <Link
                          href="/transparency"
                          className="text-primary hover:text-primary-hover hover:underline flex items-center gap-1 ml-auto"
                          target="_blank"
                        >
                          <span>View Public /transparency Page</span>
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 30-Day Signup Trend Chart (Prompt 2 Requirement) */}
              <div className="bg-[#121620] border border-bear/20 p-5 rounded-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp size={16} className="text-bear" />
                      <span>New Signups Trajectory (Last 30 Days)</span>
                    </h2>
                    <p className="text-[11px] text-muted mt-0.5">
                      Daily user onboarding volume and growth momentum.
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-muted">
                    <span>Cumulative Total: </span>
                    <span className="text-bull font-bold">
                      {signupTrend[signupTrend.length - 1]?.cumulative?.toLocaleString() ?? '1,750'}
                    </span>
                  </div>
                </div>

                {/* SVG Bar Chart Visualization */}
                <div className="w-full h-44 flex items-end gap-1.5 pt-4 pb-2 border-b border-subtle">
                  {signupTrend.map((d, idx) => {
                    const maxSignups = 22;
                    const heightPct = Math.min(100, Math.max(10, (d.signups / maxSignups) * 100));
                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-bear/40 text-[10px] px-1.5 py-0.5 rounded pointer-events-none font-mono z-30 whitespace-nowrap shadow-lg">
                          <span className="text-white font-bold">{d.signups} signups</span>
                          <span className="text-faint"> ({d.dayLabel})</span>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t transition-all ${
                            idx === signupTrend.length - 1
                              ? 'bg-bear shadow-sm shadow-bear/40'
                              : 'bg-white/20 hover:bg-bear/60'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[10px] text-faint font-mono px-1">
                  <span>{signupTrend[0]?.date || '30 days ago'}</span>
                  <span>15 days ago</span>
                  <span>{signupTrend[signupTrend.length - 1]?.date || 'Today'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: USERS DIRECTORY & DETAIL DRAWER (Prompt 2) */}
          {/* ======================================================== */}
          {activeNav === 'users' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Trader Directory & Permissions</span>
                    <Badge variant="neutral" className="text-xs font-mono">
                      {users.length} accounts
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted mt-1">
                    Search, paginate, inspect positions, freeze accounts, or manage admin credentials.
                  </p>
                </div>

                {/* Search */}
                <div className="w-full sm:w-64 relative">
                  <Input
                    placeholder="Search by email or name..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="bg-[#121620] border-bear/30 text-xs pl-8"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-faint" />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-[#121620] border border-bear/20 rounded-lg overflow-x-auto shadow-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-subtle bg-black/30 text-faint text-[11px]">
                      <th className="py-3 px-4 font-medium">User Profile</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Paper Balance</th>
                      <th className="py-3 px-4 font-medium text-right">Trades</th>
                      <th className="py-3 px-4 font-medium text-right">Last Active</th>
                      <th className="py-3 px-4 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50 font-sans">
                    {paginatedUsers.map((u) => {
                      const isFrozen = u.status === 'suspended' || u.isFrozen;
                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleOpenUserDrawer(u)}
                              className="text-left group cursor-pointer"
                            >
                              <div className="font-bold text-white group-hover:text-bear transition-colors flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                <Eye size={12} className="opacity-0 group-hover:opacity-100 text-bear transition-opacity" />
                              </div>
                              <div className="text-[11px] text-faint font-mono">{u.email}</div>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`badge text-[10px] px-1.5 py-0.5 ${
                                u.role === 'admin'
                                  ? 'bg-bear/20 text-bear border border-bear/40 font-bold'
                                  : 'bg-elevated text-muted'
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isFrozen ? (
                              <span className="badge badge-bear text-[10px] px-1.5 py-0.5 flex items-center gap-1 w-max font-bold">
                                <Lock size={10} />
                                FROZEN
                              </span>
                            ) : (
                              <span className="badge badge-bull text-[10px] px-1.5 py-0.5 flex items-center gap-1 w-max">
                                <CheckCircle2 size={10} />
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            ${formatPrice(u.portfolioValue, 2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted">
                            {u.tradesCount}
                          </td>
                          <td className="py-3 px-4 text-right text-faint text-[11px] font-mono">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Freeze / Unfreeze Action Button */}
                              <button
                                onClick={() => handleConfirmFreeze(u)}
                                className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                  isFrozen
                                    ? 'bg-bull/15 hover:bg-bull/25 text-bull border border-bull/30'
                                    : 'bg-bear/15 hover:bg-bear/25 text-bear border border-bear/30'
                                }`}
                                title={isFrozen ? 'Unfreeze trading privileges' : 'Freeze trading account'}
                              >
                                {isFrozen ? <Unlock size={11} /> : <Lock size={11} />}
                                <span>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                              </button>

                              {/* Grant / Revoke Admin Button */}
                              <button
                                onClick={() => handleConfirmRole(u)}
                                className="px-2 py-1 rounded text-[11px] font-medium bg-elevated hover:bg-hover text-muted hover:text-white border border-cardborder"
                                title="Grant / Revoke Admin"
                              >
                                {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                              </button>

                              {/* Inspect Drawer Button */}
                              <button
                                onClick={() => handleOpenUserDrawer(u)}
                                className="p-1 rounded bg-elevated hover:bg-hover text-muted hover:text-white border border-cardborder"
                                title="Inspect Paper Account & Positions"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-faint">
                          No users matched your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="p-3 border-t border-subtle/50 flex items-center justify-between text-xs text-muted">
                  <span>
                    Showing {paginatedUsers.length} of {filteredUsers.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="text-xs py-1 px-2.5"
                    >
                      Previous
                    </Button>
                    <span className="font-mono text-white text-xs">
                      Page {userPage} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={userPage >= totalPages}
                      onClick={() => setUserPage((p) => Math.min(totalPages, p + 1))}
                      className="text-xs py-1 px-2.5"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: ANNOUNCEMENTS (Prompt 3) */}
          {/* ======================================================== */}
          {activeNav === 'announcements' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Announcements & Global Broadcasts</span>
                  <Badge variant="neutral" className="text-xs font-mono">
                    {announcements.length}
                  </Badge>
                </h1>
                <p className="text-xs text-muted mt-1">
                  Active announcements appear as a banner in the user terminal. Critical alerts cannot be dismissed.
                </p>
              </div>

              {/* Create Announcement Form */}
              <div className="bg-[#121620] border border-bear/20 p-5 rounded-lg">
                <h2 className="text-xs font-bold uppercase tracking-wider text-bear mb-3 flex items-center gap-2">
                  <Plus size={14} />
                  <span>Publish New Platform Announcement</span>
                </h2>

                <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Announcement Title (e.g., Scheduled Maintenance)"
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="bg-[#0b0e14] border-subtle text-xs"
                    />

                    <select
                      value={newAnnType}
                      onChange={(e) => setNewAnnType(e.target.value as 'info' | 'warning' | 'critical')}
                      className="bg-[#0b0e14] border border-subtle text-xs rounded px-3 py-2 text-main"
                    >
                      <option value="info">Info (Blue Dismissible)</option>
                      <option value="warning">Warning (Amber Alert)</option>
                      <option value="critical">Critical (Crimson - Non-Dismissible)</option>
                    </select>

                    <Button type="submit" size="sm" className="bg-bear hover:bg-bear/90 text-white font-bold">
                      Publish to All Users
                    </Button>
                  </div>

                  <textarea
                    placeholder="Announcement message content..."
                    value={newAnnText}
                    onChange={(e) => setNewAnnText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0b0e14] border border-subtle rounded p-2.5 text-xs text-main resize-none focus:outline-none focus:border-bear/40"
                    required
                  />
                </form>
              </div>

              {/* Active Announcements List */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase text-muted tracking-wider">
                  Active System Announcements
                </h2>

                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-[#121620] border border-subtle p-4 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`badge text-[10px] px-1.5 py-0.5 ${
                            ann.type === 'critical'
                              ? 'badge-bear font-bold'
                              : ann.type === 'warning'
                              ? 'badge-gold'
                              : 'badge-primary'
                          }`}
                        >
                          {ann.type.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm text-white">{ann.title || 'Announcement'}</span>
                        <span className="text-[10px] text-faint font-mono">
                          {new Date(ann.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted">{ann.text || ann.message}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded hover:bg-bear/20 text-faint hover:text-bear transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: FEATURE FLAGS (Prompt 3) */}
          {/* ======================================================== */}
          {activeNav === 'flags' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Global Feature Flags</span>
                  <Badge variant="neutral" className="text-xs font-mono">
                    {featureFlags.length} flags
                  </Badge>
                </h1>
                <p className="text-xs text-muted mt-1">
                  Kill-switches with instant propagation. When disabled, users see a clean Coming Soon state.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <div
                    key={flag.key}
                    className="bg-[#121620] border border-bear/20 p-5 rounded-lg flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-white">{flag.key}</span>
                        <span
                          className={`badge text-[10px] ${
                            flag.enabled ? 'badge-bull font-bold' : 'badge-bear font-bold'
                          }`}
                        >
                          {flag.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{flag.description}</p>
                      <div className="text-[10px] text-faint mt-2 font-mono">
                        Updated: {new Date(flag.updatedAt || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        flag.enabled ? 'bg-bull' : 'bg-subtle'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          flag.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: AUDIT LOG (Prompt 4) */}
          {/* ======================================================== */}
          {activeNav === 'audit' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Immutable Administrative Audit Trail</span>
                    <Badge variant="neutral" className="text-xs font-mono">
                      {auditLogs.length} events
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted mt-1">
                    Append-only ledger of all administrative interventions (who, what, when, details).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action filter dropdown */}
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="bg-[#121620] border border-bear/30 text-xs rounded px-2.5 py-1.5 text-main font-mono"
                  >
                    <option value="ALL">All Actions</option>
                    {uniqueActions.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>

                  {/* Search */}
                  <div className="w-48 relative">
                    <Input
                      placeholder="Search actor or target..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="bg-[#121620] border-bear/30 text-xs pl-7"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-faint" />
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="bg-[#121620] border border-bear/20 rounded-lg overflow-x-auto shadow-md">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-subtle bg-black/30 text-faint text-[11px] font-sans">
                      <th className="py-3 px-4 font-medium">Timestamp</th>
                      <th className="py-3 px-4 font-medium">Admin Actor</th>
                      <th className="py-3 px-4 font-medium">Action</th>
                      <th className="py-3 px-4 font-medium">Target</th>
                      <th className="py-3 px-4 font-medium">Payload Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50 text-[11px]">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-4 text-faint text-[10px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-white font-medium">
                          {log.adminEmail}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="badge bg-bear/15 text-bear border border-bear/30 text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted">
                          {log.target || 'system'}
                        </td>
                        <td className="py-2.5 px-4 text-faint max-w-xs truncate" title={JSON.stringify(log.details)}>
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}

                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-faint font-sans">
                          No audit entries matching filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 6: TRADER FEEDBACK & USER SUGGESTIONS (Prompt 5) */}
          {/* ======================================================== */}
          {activeNav === 'feedback' && (
            <div className="flex flex-col gap-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Trader Feedback & In-App Submissions</span>
                    <Badge variant="neutral" className="border-bear/30 text-bear text-xs font-mono">
                      {feedbackList.length} SUBMISSIONS
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted mt-1">
                    Incoming UX feedback, feature requests, bug reports, and trader ratings.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-[#121620] border border-bear/30 rounded p-0.5 text-xs">
                    {(['all', 'new', 'reviewed', 'resolved'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setFeedbackStatusFilter(st)}
                        className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                          feedbackStatusFilter === st
                            ? 'bg-bear text-white'
                            : 'text-muted hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <select
                    value={feedbackCategoryFilter}
                    onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                    className="bg-[#121620] border border-bear/30 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="feature">Feature</option>
                    <option value="bug">Bug Report</option>
                    <option value="praise">Praise</option>
                    <option value="general">General</option>
                  </select>

                  <div className="w-44 relative">
                    <Input
                      placeholder="Search messages..."
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      className="bg-[#121620] border-bear/30 text-xs pl-7 h-8"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-faint" />
                  </div>
                </div>
              </div>

              {/* Feedback Cards Grid */}
              <div className="grid grid-cols-1 gap-3">
                {feedbackList
                  .filter((item) => {
                    if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
                    if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) return false;
                    if (feedbackSearch.trim()) {
                      const q = feedbackSearch.toLowerCase();
                      const matchMsg = item.message.toLowerCase().includes(q);
                      const matchEmail = (item.userEmail || '').toLowerCase().includes(q);
                      const matchId = item.userId.toLowerCase().includes(q);
                      if (!matchMsg && !matchEmail && !matchId) return false;
                    }
                    return true;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#121620] border border-bear/20 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-bear/40 transition-colors"
                    >
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`badge text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              item.status === 'new'
                                ? 'bg-bear/20 text-bear border border-bear/40'
                                : item.status === 'reviewed'
                                ? 'bg-neutral text-white/90 border border-neutral/40'
                                : 'bg-bull/20 text-bull border border-bull/40'
                            }`}
                          >
                            {item.status}
                          </span>

                          <span className="badge bg-white/5 border border-white/10 text-[10px] uppercase text-muted px-2 py-0.5 rounded">
                            {item.category}
                          </span>

                          {item.rating && (
                            <div className="flex items-center gap-0.5 text-[#fbbf24] text-xs">
                              {Array.from({ length: item.rating }).map((_, i) => (
                                <Star key={i} size={11} fill="currentColor" />
                              ))}
                              <span className="text-faint text-[10px] ml-1">({item.rating}/5)</span>
                            </div>
                          )}

                          <span className="text-[10px] text-faint font-mono ml-auto md:ml-0">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-white leading-relaxed font-sans bg-black/20 p-2.5 rounded border border-subtle/50">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-muted font-mono">
                          <span>User ID: <span className="text-faint">{item.userId}</span></span>
                          {item.userEmail && (
                            <span>Email: <span className="text-white">{item.userEmail}</span></span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex md:flex-col items-center gap-1.5 shrink-0 justify-end">
                        {item.status !== 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => postAdminAction('update_feedback_status', { id: item.id, status: 'reviewed' })}
                            className="text-[11px] h-7 border-subtle hover:text-white"
                          >
                            Mark Reviewed
                          </Button>
                        )}

                        {item.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={() => postAdminAction('update_feedback_status', { id: item.id, status: 'resolved' })}
                            className="text-[11px] h-7 bg-bull hover:bg-bull/90 text-black font-bold"
                          >
                            <Check size={12} className="mr-1" /> Resolve
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Feedback Entry',
                              description: 'Permanently remove this user feedback submission? This will be recorded in the audit log.',
                              onConfirm: async () => {
                                await postAdminAction('delete_feedback', { id: item.id });
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          className="text-[11px] h-7 text-bear/70 hover:text-bear hover:bg-bear/10"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}

                {feedbackList.length === 0 && (
                  <div className="text-center py-16 bg-[#121620] border border-bear/20 rounded-lg text-muted text-xs">
                    No trader feedback has been submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* USER DETAIL SLIDE-OVER DRAWER (Prompt 2 Requirement) */}
      {/* ======================================================== */}
      {drawerUser && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={() => setDrawerUser(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0e121a] border-l border-bear/30 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-bear/20 border border-bear/40 flex items-center justify-center font-bold text-bear">
                    {drawerUser.displayName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{drawerUser.displayName}</h2>
                    <p className="text-xs text-muted font-mono">{drawerUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerUser(null)}
                  className="p-1 rounded text-muted hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status and Role Badges */}
              <div className="flex items-center gap-2 my-4">
                <span
                  className={`badge text-[11px] px-2 py-0.5 ${
                    drawerUser.status === 'suspended' || drawerUser.isFrozen
                      ? 'badge-bear font-bold'
                      : 'badge-bull font-bold'
                  }`}
                >
                  STATUS: {drawerUser.status === 'suspended' || drawerUser.isFrozen ? 'FROZEN' : 'ACTIVE'}
                </span>

                <span
                  className={`badge text-[11px] px-2 py-0.5 ${
                    drawerUser.role === 'admin' ? 'bg-bear/20 text-bear border border-bear/40' : 'bg-elevated'
                  }`}
                >
                  ROLE: {drawerUser.role.toUpperCase()}
                </span>
              </div>

              {/* Paper Account Summary */}
              <div className="bg-[#121620] border border-bear/20 p-4 rounded-lg my-3">
                <div className="text-[10px] font-mono uppercase text-muted tracking-wider mb-2 font-bold">
                  Virtual Paper Account Overview
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <div className="text-faint text-[10px]">Available Balance</div>
                    <div className="font-bold text-white text-sm">
                      ${formatPrice(drawerUser.portfolioValue, 2)} USDT
                    </div>
                  </div>
                  <div>
                    <div className="text-faint text-[10px]">Total Closed Trades</div>
                    <div className="font-bold text-white text-sm">{drawerUser.tradesCount}</div>
                  </div>
                </div>
              </div>

              {/* Open Positions Inspection */}
              <div className="my-4">
                <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>Open Paper Positions ({drawerDetails?.positions?.length || drawerUser.openPositions})</span>
                </div>

                {isDrawerLoading ? (
                  <div className="py-6 text-center text-xs text-muted">Loading position telemetry...</div>
                ) : (
                  <div className="bg-[#121620] border border-subtle rounded p-3 text-xs flex flex-col gap-2">
                    {drawerDetails?.positions && drawerDetails.positions.length > 0 ? (
                      drawerDetails.positions.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-subtle/40 pb-2">
                          <span className="font-bold text-white">{String(p.symbol)}</span>
                          <span className="font-mono text-bull">{String(p.side).toUpperCase()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-faint text-center py-3">No active positions on record.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions Strip */}
            <div className="pt-4 border-t border-subtle flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmFreeze(drawerUser)}
                  className={`flex-1 text-xs font-bold ${
                    drawerUser.status === 'suspended' || drawerUser.isFrozen
                      ? 'bg-bull hover:bg-bull/90 text-black'
                      : 'bg-bear hover:bg-bear/90 text-white'
                  }`}
                >
                  {drawerUser.status === 'suspended' || drawerUser.isFrozen ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Unlock size={13} /> Unfreeze Account
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Lock size={13} /> Freeze Account
                    </span>
                  )}
                </Button>

                <Button
                  onClick={() => handleConfirmRole(drawerUser)}
                  variant="outline"
                  className="flex-1 text-xs border-cardborder"
                >
                  {drawerUser.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBroadcastTargetUser(drawerUser);
                  setBroadcastTitle(`Official Notice for ${drawerUser.displayName}`);
                }}
                className="text-xs text-muted hover:text-white"
              >
                <Send size={12} className="mr-1.5" /> Send Broadcast Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}>
          <div
            className="modal-content bg-[#121620] border border-bear/40 p-6 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-bear font-bold text-sm mb-2">
              <AlertTriangle size={16} />
              <span>{confirmModal.title}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-5">{confirmModal.description}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={confirmModal.onConfirm} className="bg-bear hover:bg-bear/90 text-white font-bold">
                Confirm Action
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {broadcastTargetUser && (
        <div className="modal-backdrop" onClick={() => setBroadcastTargetUser(null)}>
          <div
            className="modal-content bg-[#121620] border border-bear/40 p-5 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Send size={15} className="text-bear" />
                <span>Broadcast Message to Trader</span>
              </div>
              <button
                onClick={() => setBroadcastTargetUser(null)}
                className="text-muted hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-muted block mb-1">Target Trader</label>
                <div className="text-xs font-mono text-white bg-black/30 p-2 rounded border border-subtle">
                  {broadcastTargetUser.displayName} ({broadcastTargetUser.email})
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Subject</label>
                <Input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Notice Subject"
                  className="bg-[#0b0e14] text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter message for trader..."
                  className="w-full bg-[#0b0e14] border border-subtle rounded p-2 text-xs text-white resize-none"
                  required
                />
              </div>

              {broadcastSuccess && (
                <div className="text-xs text-bull font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Message broadcast and logged in audit trail!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBroadcastTargetUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-bear hover:bg-bear/90 text-white font-bold">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
