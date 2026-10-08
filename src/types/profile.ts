// src/types/profile.ts

export type TraderTier = 'standard' | 'pro' | 'vip' | 'admin';
export type TradingStyle = 'scalper' | 'day_trader' | 'swing' | 'position' | 'algo';

export interface TraderBadge {
  id: string;
  name: string;
  icon: string;         // e.g. 'Zap', 'Target', 'Trophy', 'Flame', 'Shield'
  description: string;
  unlockedAt?: string | null;
  isUnlocked: boolean;
  progressPct?: number; // 0 to 100
}

export interface TraderSocials {
  twitter?: string;     // @handle
  discord?: string;     // username
  telegram?: string;    // @username
  github?: string;      // username
}

export interface TraderStats {
  initialBalance: number;       // Normal default: 10,000 USDT
  currentEquity: number;
  availableFunds: number;
  totalRealizedPnl: number;
  realizedPnlPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  profitFactor: number;         // Gross Profit / Gross Loss
  largestWin: { symbol: string; pnl: number; date: string } | null;
  largestLoss: { symbol: string; pnl: number; date: string } | null;
  averageTradeDuration: string; // e.g. "2h 15m"
  longShortRatio: { longs: number; shorts: number };
  favoritePairs: { symbol: string; tradesCount: number; volumePct: number }[];
  streakDays: number;
  leaderboardRank: number | null;
}

export interface TraderPrivacySettings {
  isPublicProfile: boolean;     // Available at /u/[username]
  showBalanceUsdt: boolean;     // Hide exact balance, show only % return
  showOpenPositions: boolean;   // Allow others to see active trades
  showTradeHistory: boolean;    // Allow others to inspect closed journal
}

export interface TraderTerminalPreferences {
  currencyDisplay: 'USDT' | 'INR' | 'USD' | 'EUR';
  defaultLeverage: number;      // 1x, 5x, 10x, 20x
  defaultOrderType: 'market' | 'limit';
  skipOrderConfirmations: boolean; // Fast 1-click execution
  soundEffectsEnabled: boolean;
  themeAccent: 'cyan' | 'amber' | 'emerald' | 'purple';
}

export interface TraderProfile {
  id: string;
  username: string;             // unique, lowercase, URL-safe: 'satoshisniper'
  displayName: string;          // 'Alex Chen'
  email: string;
  avatarUrl: string;            // Preset avatar, initials, or URL
  bio: string;                  // Max 160 characters
  country?: string;             // ISO code e.g. 'US', 'IN', 'GB', 'SG'
  tier: TraderTier;             // 'standard' for normal users
  tradingStyle: TradingStyle;   // 'day_trader'
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  socials: TraderSocials;
  badges: TraderBadge[];
  stats: TraderStats;
  privacy: TraderPrivacySettings;
  preferences: TraderTerminalPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioHoldingItem {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  markPrice: number;
  margin: number;
  valueUsdt: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  allocationPct: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  openedAt: string;
}

export interface PortfolioTransactionItem {
  id: string;
  type: string;
  symbol?: string | null;
  amount: number;
  balanceAfter: number;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface PortfolioSummaryMetrics {
  totalEquity: number;
  availableCash: number;
  allocatedMargin: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPct: number;
  totalRealizedPnl: number;
  netReturnPct: number;
  cashAllocationPct: number;
}

export interface PublicVerifiedTrackRecord extends TraderProfile {
  trades: import('./trading').ClosedTradeRecord[];
  latestLedgerSnapshotHash: string;
  isRecordVerified: boolean;
  benchmark: {
    userPnlPct: number;
    btcPnlPct: number;
    userBeatBtc: boolean;
    honestVerdict: string;
    formattedComparison: string;
  };
  positions?: PortfolioHoldingItem[];
  transactions?: PortfolioTransactionItem[];
  portfolioMetrics?: PortfolioSummaryMetrics;
}
