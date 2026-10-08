import type { UserProfile } from './user';

export interface AdminMetrics {
  totalUsers: number;
  newSignupsThisWeek: number;
  dailyActiveUsers: number;
  totalPaperAccounts: number;
  totalVirtualBalanceUSDT: number;
  totalOpenPositions: number;
  totalTradesCount: number;
  wsLatencyMs: number;
  serverUptime: string;
}

export interface Announcement {
  id: string;
  title?: string;
  text: string;
  message?: string;
  type: 'info' | 'warning' | 'alert' | 'update' | 'bullish' | 'critical';
  dismissible?: boolean;
  expiresAt?: string | null;
  active: boolean;
  createdBy?: string;
  createdAt: number;
}

export interface FeatureFlags {
  paperTradingEnabled: boolean;
  highFrequencyWs: boolean;
  subChartIndicators: boolean;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  soundAlertsEnabled: boolean;
  // Specific Phase 5 flags
  paper_trading?: boolean;
  indicators?: boolean;
  alerts?: boolean;
}

export interface FeatureFlagRecord {
  key: string;
  description: string;
  enabled: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  target?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminUserState extends UserProfile {
  tradesCount: number;
  portfolioValue: number;
  openPositions: number;
  isFrozen?: boolean;
  lastActive?: number;
}

export interface BroadcastMessage {
  id: string;
  userId: string;
  adminId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserFeedbackRecord {
  id: string;
  userId: string;
  userEmail?: string;
  category: 'bug' | 'feature' | 'praise' | 'general';
  message: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}
