import type {
  AdminMetrics,
  AuditLogRecord,
  FeatureFlagRecord,
  Announcement,
  AdminUserState,
  BroadcastMessage,
  UserFeedbackRecord,
} from '@/types/admin';
import { serverPaperTrading } from './paperTradingService';

export interface SignupDayData {
  date: string;
  dayLabel: string;
  signups: number;
  cumulative: number;
}

class AdminService {
  private auditLogs: AuditLogRecord[] = [
    {
      id: 'log_init_001',
      adminId: 'usr_celsius_demo',
      adminEmail: 'trader@celsius.trade',
      action: 'SYSTEM_BOOT',
      target: 'system',
      details: { message: 'Celsius Admin Console initialized with secure edge role verification.' },
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log_init_002',
      adminId: 'usr_celsius_demo',
      adminEmail: 'trader@celsius.trade',
      action: 'CONFIG_FEATURE_FLAGS',
      target: 'feature_flags',
      details: { paper_trading: true, indicators: true, alerts: true },
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  private featureFlags: FeatureFlagRecord[] = [
    {
      key: 'paper_trading',
      description: 'Virtual USDT paper trading simulation and order execution engine',
      enabled: true,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'indicators',
      description: 'Technical indicators (EMA, SMA, RSI, MACD) chart overlays',
      enabled: true,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'alerts',
      description: 'Real-time price alert trigger notifications and sound pings',
      enabled: true,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'loss_limits',
      description: 'Loss-protection rules: daily loss limits, revenge trading detector, and post-session review',
      enabled: true,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    },
  ];

  private announcements: Announcement[] = [
    {
      id: 'ann_1',
      title: 'The only trading platform that profits from you not losing money.',
      text: 'Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds.',
      message: 'Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds.',
      type: 'info',
      active: true,
      dismissible: true,
      createdAt: Date.now() - 3600000,
    },
  ];

  private broadcastMessages: BroadcastMessage[] = [
    {
      id: 'msg_001',
      userId: 'usr_celsius_demo',
      adminId: 'usr_celsius_demo',
      title: 'Account Verification Complete',
      content: 'Welcome to Celsius Network Paper Trading terminal. Your initial 10,000 USDT has been credited.',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  private feedbackItems: UserFeedbackRecord[] = [
    {
      id: 'fb_004',
      userId: 'usr_trader_7',
      userEmail: 'leverage_king@binance.vip',
      category: 'bug',
      message: 'Bug report: Placed a limit buy order for 0.5 BTC at $60,000, then traded all my USDT on ETH. When BTC dumped to $59,800, my limit order executed and balance went negative (-$184.20 USDT)! Balance should never go below zero.',
      rating: 1,
      status: 'resolved',
      adminNotes: 'Resolved: Added balance solvency pre-execution guard in checkAndExecuteAdvancedOrders and immutable limit_rejected ledger entry.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'fb_005',
      userId: 'usr_bhaskar_sharma',
      userEmail: 'bhaskar.sharma@celsius.trade',
      category: 'bug',
      message: 'Bug report: My realized PnL and trade count on the leaderboard are stuck at initial seed values even though I closed 3 profitable trades this morning.',
      rating: 2,
      status: 'resolved',
      adminNotes: 'Resolved: In getLeaderboard, dynamically aggregate closedTrades for all active traders with live rank re-sorting.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'fb_006',
      userId: 'usr_whale_1',
      userEmail: 'satoshi_vault@web3.eth',
      category: 'bug',
      message: 'Bug report: When sharing my trade card link to Discord, the preview embed is completely missing the trade card image. Just shows a plain URL.',
      rating: 2,
      status: 'resolved',
      adminNotes: 'Resolved: Configured metadataBase in RootLayout and absolute URL resolution for OpenGraph image crawlers.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'fb_001',
      userId: 'usr_whale_1',
      userEmail: 'satoshi_vault@web3.eth',
      category: 'feature',
      message: 'Can we get trailing stop orders alongside standard limit orders? Terminal speed is incredible.',
      rating: 5,
      status: 'reviewed',
      adminNotes: 'Queued for Phase 8 advanced engine expansion.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'fb_002',
      userId: 'usr_trader_5',
      userEmail: 'solana_sniper@phantom.app',
      category: 'praise',
      message: 'The Binance 20ms WebSocket streaming and TradingView charts are butter smooth! Best paper trader out there.',
      rating: 5,
      status: 'resolved',
      adminNotes: 'Thanked trader via broadcast message.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'fb_003',
      userId: 'usr_celsius_demo',
      userEmail: 'trader@celsius.trade',
      category: 'general',
      message: 'Would love an option to share my trades directly to Discord with high-res card preview.',
      rating: 4,
      status: 'resolved',
      adminNotes: 'OpenGraph preview support verified and enabled.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  private users: AdminUserState[] = [
    {
      id: 'usr_bhaskar_sharma',
      email: 'bhaskar.sharma@celsius.trade',
      displayName: 'Bhaskar Rustam Sharma',
      role: 'admin',
      status: 'active',
      createdAt: Date.now() - 180 * 86400000,
      lastLogin: Date.now(),
      lastActive: Date.now(),
      tradesCount: 88,
      portfolioValue: 576000, // 4.8 Crore INR equivalent
      openPositions: 5,
      isFrozen: false,
    },
    {
      id: 'usr_celsius_demo',
      email: 'bhaskar.sharma@celsius.trade',
      displayName: 'Bhaskar Rustam Sharma',
      role: 'admin',
      status: 'active',
      createdAt: Date.now() - 180 * 86400000,
      lastLogin: Date.now(),
      lastActive: Date.now(),
      tradesCount: 88,
      portfolioValue: 576000,
      openPositions: 5,
      isFrozen: false,
    },
    {
      id: 'usr_whale_1',
      email: 'satoshi_vault@web3.eth',
      displayName: 'SatoshiAcolyte',
      role: 'trader',
      status: 'active',
      createdAt: Date.now() - 15 * 86400000,
      lastLogin: Date.now() - 4200000,
      lastActive: Date.now() - 4200000,
      tradesCount: 156,
      portfolioValue: 348920,
      openPositions: 4,
      isFrozen: false,
    },
    {
      id: 'usr_arb_bot',
      email: 'hft_quant@celsius.internal',
      displayName: 'AlphaQuantBot',
      role: 'pro',
      status: 'active',
      createdAt: Date.now() - 60 * 86400000,
      lastLogin: Date.now() - 120000,
      lastActive: Date.now() - 120000,
      tradesCount: 1820,
      portfolioValue: 89040,
      openPositions: 1,
      isFrozen: false,
    },
    {
      id: 'usr_bad_actor',
      email: 'spammer_bot@suspicious.io',
      displayName: 'AirdropSpammer',
      role: 'trader',
      status: 'suspended',
      createdAt: Date.now() - 2 * 86400000,
      lastLogin: Date.now() - 86400000,
      lastActive: Date.now() - 86400000,
      tradesCount: 0,
      portfolioValue: 100000,
      openPositions: 0,
      isFrozen: true,
    },
    {
      id: 'usr_trader_5',
      email: 'solana_sniper@phantom.app',
      displayName: 'SolanaSniper',
      role: 'trader',
      status: 'active',
      createdAt: Date.now() - 10 * 86400000,
      lastLogin: Date.now() - 3600000,
      lastActive: Date.now() - 3600000,
      tradesCount: 88,
      portfolioValue: 112400,
      openPositions: 3,
      isFrozen: false,
    },
    {
      id: 'usr_trader_6',
      email: 'vitalik_fan@ethereum.org',
      displayName: 'GasOptimizer',
      role: 'trader',
      status: 'active',
      createdAt: Date.now() - 5 * 86400000,
      lastLogin: Date.now() - 7200000,
      lastActive: Date.now() - 7200000,
      tradesCount: 19,
      portfolioValue: 98400,
      openPositions: 1,
      isFrozen: false,
    },
  ];

  public logAction(
    adminId: string,
    adminEmail: string,
    action: string,
    target: string = 'system',
    details: Record<string, unknown> = {},
    ipAddress?: string
  ): AuditLogRecord {
    const entry: AuditLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId,
      adminEmail,
      action,
      target,
      details,
      ipAddress: ipAddress || '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  public getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs];
  }

  public getMetrics(): AdminMetrics {
    const totalVolume = this.users.reduce((acc, u) => acc + u.portfolioValue, 0);
    const totalPositions = this.users.reduce((acc, u) => acc + u.openPositions, 0);

    return {
      totalUsers: 1428 + this.users.length,
      newSignupsThisWeek: 48,
      dailyActiveUsers: 89,
      totalPaperAccounts: 1428 + this.users.length,
      totalVirtualBalanceUSDT: 18450000 + totalVolume,
      totalOpenPositions: 312 + totalPositions,
      totalTradesCount: 4210,
      wsLatencyMs: 24,
      serverUptime: '99.98%',
    };
  }

  public get30DaySignupTrend(): SignupDayData[] {
    const data: SignupDayData[] = [];
    const now = new Date();
    let cumulative = 1380;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      // Deterministic realistic variation
      const base = 12;
      const variation = Math.round(Math.sin(i * 0.4) * 5 + Math.cos(i * 0.8) * 3);
      const signups = Math.max(3, base + variation);
      cumulative += signups;

      data.push({
        date: dateStr,
        dayLabel,
        signups,
        cumulative,
      });
    }

    return data;
  }

  public getUsers(): AdminUserState[] {
    return [...this.users];
  }

  public async getUserDetails(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;

    const { account, positions, orders } = await serverPaperTrading.getOrCreateAccount(userId);
    const metrics = serverPaperTrading.getAccountMetrics(account, positions);

    return {
      user,
      account: {
        ...account,
        ...metrics,
      },
      positions,
      orders,
    };
  }

  public updateUserStatus(
    userId: string,
    status: 'active' | 'suspended',
    adminId: string,
    adminEmail: string
  ): AdminUserState | null {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const prev = this.users[idx];
    const isFrozen = status === 'suspended';
    const updated: AdminUserState = {
      ...prev,
      status,
      isFrozen,
    };
    this.users[idx] = updated;

    this.logAction(
      adminId,
      adminEmail,
      isFrozen ? 'FREEZE_USER' : 'UNFREEZE_USER',
      `user:${userId}`,
      { targetEmail: prev.email, prevStatus: prev.status, newStatus: status }
    );

    return updated;
  }

  public isUserFrozen(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    return user.status === 'suspended' || user.isFrozen === true;
  }

  public updateUserRole(
    userId: string,
    role: 'admin' | 'trader',
    adminId: string,
    adminEmail: string
  ): AdminUserState | null {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const prev = this.users[idx];
    const updated: AdminUserState = {
      ...prev,
      role: role as 'admin' | 'trader',
    };
    this.users[idx] = updated;

    this.logAction(
      adminId,
      adminEmail,
      'UPDATE_USER_ROLE',
      `user:${userId}`,
      { targetEmail: prev.email, prevRole: prev.role, newRole: role }
    );

    return updated;
  }

  public pingUserActive(userId: string): void {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.users[idx].lastActive = Date.now();
      this.users[idx].lastLogin = Date.now();
    }
  }

  public getFeatureFlags(): FeatureFlagRecord[] {
    return [...this.featureFlags];
  }

  public isFeatureEnabled(key: string): boolean {
    const flag = this.featureFlags.find((f) => f.key === key);
    return flag ? flag.enabled : true;
  }

  public toggleFeatureFlag(
    key: string,
    enabled: boolean,
    adminId: string,
    adminEmail: string
  ): FeatureFlagRecord | null {
    const flag = this.featureFlags.find((f) => f.key === key);
    if (!flag) return null;

    const prev = flag.enabled;
    flag.enabled = enabled;
    flag.updatedAt = new Date().toISOString();
    flag.updatedBy = adminEmail;

    this.logAction(
      adminId,
      adminEmail,
      'TOGGLE_FEATURE_FLAG',
      `feature:${key}`,
      { flagKey: key, prevEnabled: prev, newEnabled: enabled }
    );

    return flag;
  }

  public getAnnouncements(): Announcement[] {
    return [...this.announcements];
  }

  public addAnnouncement(
    ann: Omit<Announcement, 'id' | 'createdAt'>,
    adminId: string,
    adminEmail: string
  ): Announcement {
    const created: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      createdAt: Date.now(),
      createdBy: adminEmail,
    };
    this.announcements.unshift(created);

    this.logAction(
      adminId,
      adminEmail,
      'CREATE_ANNOUNCEMENT',
      `announcement:${created.id}`,
      { title: created.title, text: created.text, type: created.type, dismissible: created.dismissible }
    );

    return created;
  }

  public deleteAnnouncement(
    id: string,
    adminId: string,
    adminEmail: string
  ): boolean {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    const deleted = this.announcements.splice(idx, 1)[0];
    this.logAction(
      adminId,
      adminEmail,
      'DELETE_ANNOUNCEMENT',
      `announcement:${id}`,
      { text: deleted.text }
    );
    return true;
  }

  public toggleAnnouncement(
    id: string,
    active: boolean,
    adminId: string,
    adminEmail: string
  ): Announcement | null {
    const ann = this.announcements.find((a) => a.id === id);
    if (!ann) return null;

    ann.active = active;
    this.logAction(
      adminId,
      adminEmail,
      'TOGGLE_ANNOUNCEMENT',
      `announcement:${id}`,
      { active }
    );
    return ann;
  }

  public sendBroadcastMessage(
    userId: string,
    adminId: string,
    adminEmail: string,
    title: string,
    content: string
  ): BroadcastMessage {
    const msg: BroadcastMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      adminId,
      title,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.broadcastMessages.unshift(msg);

    this.logAction(
      adminId,
      adminEmail,
      'BROADCAST_MESSAGE',
      `user:${userId}`,
      { title, content }
    );

    return msg;
  }

  public getUserBroadcasts(userId: string): BroadcastMessage[] {
    return this.broadcastMessages.filter((m) => m.userId === userId || m.userId === 'all');
  }

  public markBroadcastRead(messageId: string): void {
    const msg = this.broadcastMessages.find((m) => m.id === messageId);
    if (msg) msg.isRead = true;
  }

  public getFeedbackList(): UserFeedbackRecord[] {
    return [...this.feedbackItems];
  }

  public addFeedback(
    userId: string,
    userEmail: string | undefined,
    category: 'bug' | 'feature' | 'praise' | 'general',
    message: string,
    rating?: number
  ): UserFeedbackRecord {
    const item: UserFeedbackRecord = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail,
      category,
      message,
      rating,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.feedbackItems.unshift(item);
    return item;
  }

  public updateFeedbackStatus(
    id: string,
    status: 'new' | 'reviewed' | 'resolved',
    adminNotes: string | undefined,
    adminId: string,
    adminEmail: string
  ): UserFeedbackRecord | null {
    const fb = this.feedbackItems.find((f) => f.id === id);
    if (!fb) return null;

    fb.status = status;
    if (adminNotes !== undefined) fb.adminNotes = adminNotes;

    this.logAction(
      adminId,
      adminEmail,
      'UPDATE_FEEDBACK_STATUS',
      `feedback:${id}`,
      { newStatus: status, adminNotes }
    );

    return fb;
  }

  public deleteFeedback(id: string, adminId: string, adminEmail: string): boolean {
    const idx = this.feedbackItems.findIndex((f) => f.id === id);
    if (idx === -1) return false;

    const removed = this.feedbackItems.splice(idx, 1)[0];
    this.logAction(
      adminId,
      adminEmail,
      'DELETE_FEEDBACK',
      `feedback:${id}`,
      { category: removed.category, preview: removed.message.substring(0, 40) }
    );
    return true;
  }
}

export const adminService = new AdminService();
