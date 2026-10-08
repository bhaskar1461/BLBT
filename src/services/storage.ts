import type { IndicatorConfig, Timeframe } from '../types/chart';
import type { PriceAlert, AlertNotification } from '../types/alerts';
import type { Order, Position, Portfolio } from '../types/trading';
import type { UserProfile, UserPreferences } from '../types/user';
import type { Announcement, FeatureFlags, AdminUserState } from '../types/admin';
import { DEFAULT_WATCHLIST } from './symbols';

const KEYS = {
  USER_PROFILE: 'celsius_user_profile',
  USER_PREFERENCES: 'celsius_user_preferences',
  WATCHLIST: 'celsius_watchlist',
  ACTIVE_TIMEFRAME: 'celsius_timeframe',
  ACTIVE_SYMBOL: 'celsius_active_symbol',
  PRICE_ALERTS: 'celsius_price_alerts',
  ALERT_NOTIFICATIONS: 'celsius_alert_notifications',
  PORTFOLIO: 'celsius_portfolio',
  ORDERS: 'celsius_orders',
  POSITIONS: 'celsius_positions',
  FEATURE_FLAGS: 'celsius_feature_flags',
  ANNOUNCEMENTS: 'celsius_announcements',
  ADMIN_USERS: 'celsius_admin_users',
  SUPABASE_CONFIG: 'celsius_supabase_config',
};

export const DEFAULT_INDICATORS: IndicatorConfig = {
  ema: {
    enabled9: true,
    enabled21: true,
    enabled50: false,
    enabled200: false,
    color9: '#00e5ff',
    color21: '#ffd600',
    color50: '#e040fb',
    color200: '#ff3d00',
  },
  sma: {
    enabled20: false,
    enabled50: false,
    color20: '#76ff03',
    color50: '#ff9100',
  },
  rsi: {
    enabled: false,
    period: 14,
    color: '#b388ff',
    overbought: 70,
    oversold: 30,
  },
  macd: {
    enabled: false,
    fast: 12,
    slow: 26,
    signal: 9,
    macdColor: '#2962ff',
    signalColor: '#ff6d00',
    histUpColor: '#00e676',
    histDownColor: '#ff1744',
  },
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr_bhaskar_sharma',
  email: 'bhaskar.sharma@celsius.trade',
  displayName: 'Bhaskar Rustam Sharma',
  role: 'admin', // Default to admin for full access to explore both trading and admin console
  status: 'active',
  createdAt: Date.now() - 180 * 86400000,
  lastLogin: Date.now(),
  isMock: false,
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  activeWatchlist: DEFAULT_WATCHLIST,
  defaultTimeframe: '1h',
  soundEnabled: true,
  indicators: DEFAULT_INDICATORS,
};

export const DEFAULT_PORTFOLIO: Portfolio = {
  balance: 58380.0,
  initialBalance: 500000.0,
  equity: 576000.0, // Exactly 4.8 Crore INR equivalent (at ~83.33 INR/USDT)
  realizedPnl: 76000.0,
  totalTrades: 88,
  winningTrades: 69,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  paperTradingEnabled: true,
  highFrequencyWs: true,
  subChartIndicators: true,
  maintenanceMode: false,
  maintenanceNotice: 'Scheduled protocol upgrade tonight at 02:00 UTC.',
  soundAlertsEnabled: true,
};

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    text: '🚀 Celsius Terminal v1.0 is live! Real-time Binance streams, Paper Trading, and Technical Indicators enabled.',
    type: 'bullish' as const,
    active: true,
    createdAt: Date.now() - 3600000,
  },
];

export const MOCK_ADMIN_USERS: AdminUserState[] = [
  {
    id: 'usr_bhaskar_sharma',
    email: 'bhaskar.sharma@celsius.trade',
    displayName: 'Bhaskar Rustam Sharma',
    role: 'admin',
    status: 'active',
    createdAt: Date.now() - 180 * 86400000,
    lastLogin: Date.now(),
    tradesCount: 88,
    portfolioValue: 576000,
    openPositions: 5,
  },
  {
    id: 'usr_whale_1',
    email: 'satoshi_vault@web3.eth',
    displayName: 'SatoshiAcolyte',
    role: 'trader',
    status: 'active',
    createdAt: Date.now() - 15 * 86400000,
    lastLogin: Date.now() - 4200000,
    tradesCount: 156,
    portfolioValue: 348920,
    openPositions: 4,
  },
  {
    id: 'usr_arb_bot',
    email: 'hft_quant@celsius.internal',
    displayName: 'AlphaQuantBot',
    role: 'pro',
    status: 'active',
    createdAt: Date.now() - 60 * 86400000,
    lastLogin: Date.now() - 120000,
    tradesCount: 1820,
    portfolioValue: 89040,
    openPositions: 1,
  },
  {
    id: 'usr_bad_actor',
    email: 'spammer_bot@suspicious.io',
    displayName: 'AirdropSpammer',
    role: 'trader',
    status: 'suspended',
    createdAt: Date.now() - 2 * 86400000,
    lastLogin: Date.now() - 86400000,
    tradesCount: 0,
    portfolioValue: 100000,
    openPositions: 0,
  },
];

// Helper functions
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error for key', key, e);
  }
}

export const storage = {
  getUserProfile(): UserProfile {
    let profile = getStorageItem<UserProfile>(KEYS.USER_PROFILE, DEFAULT_USER);
    if (!profile || profile.displayName === 'CryptoDegen99' || profile.id === 'usr_celsius_demo') {
      profile = DEFAULT_USER;
      this.setUserProfile(DEFAULT_USER);
    }
    if (typeof document !== 'undefined' && !document.cookie.includes('celsius_role=')) {
      document.cookie = `celsius_role=${profile.role || 'admin'}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return profile;
  },
  setUserProfile(user: UserProfile) {
    setStorageItem(KEYS.USER_PROFILE, user);
    if (typeof document !== 'undefined') {
      document.cookie = `celsius_role=${user.role}; path=/; max-age=31536000; SameSite=Lax`;
    }
  },

  getUserPreferences(): UserPreferences {
    return getStorageItem<UserPreferences>(KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  },
  setUserPreferences(prefs: UserPreferences) {
    setStorageItem(KEYS.USER_PREFERENCES, prefs);
  },

  getWatchlist(): string[] {
    return getStorageItem<string[]>(KEYS.WATCHLIST, DEFAULT_WATCHLIST);
  },
  setWatchlist(list: string[]) {
    setStorageItem(KEYS.WATCHLIST, list);
  },

  getActiveSymbol(): string {
    return getStorageItem<string>(KEYS.ACTIVE_SYMBOL, 'BTCUSDT');
  },
  setActiveSymbol(symbol: string) {
    setStorageItem(KEYS.ACTIVE_SYMBOL, symbol);
  },

  getActiveTimeframe(): Timeframe {
    return getStorageItem<Timeframe>(KEYS.ACTIVE_TIMEFRAME, '1h');
  },
  setActiveTimeframe(tf: Timeframe) {
    setStorageItem(KEYS.ACTIVE_TIMEFRAME, tf);
  },

  getPriceAlerts(): PriceAlert[] {
    return getStorageItem<PriceAlert[]>(KEYS.PRICE_ALERTS, []);
  },
  setPriceAlerts(alerts: PriceAlert[]) {
    setStorageItem(KEYS.PRICE_ALERTS, alerts);
  },

  getAlertNotifications(): AlertNotification[] {
    return getStorageItem<AlertNotification[]>(KEYS.ALERT_NOTIFICATIONS, []);
  },
  setAlertNotifications(notes: AlertNotification[]) {
    setStorageItem(KEYS.ALERT_NOTIFICATIONS, notes);
  },

  getPortfolio(): Portfolio {
    return getStorageItem<Portfolio>(KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
  },
  setPortfolio(p: Portfolio) {
    setStorageItem(KEYS.PORTFOLIO, p);
  },

  getOrders(): Order[] {
    return getStorageItem<Order[]>(KEYS.ORDERS, []);
  },
  setOrders(orders: Order[]) {
    setStorageItem(KEYS.ORDERS, orders);
  },

  getPositions(): Position[] {
    return getStorageItem<Position[]>(KEYS.POSITIONS, []);
  },
  setPositions(positions: Position[]) {
    setStorageItem(KEYS.POSITIONS, positions);
  },

  getFeatureFlags(): FeatureFlags {
    return getStorageItem<FeatureFlags>(KEYS.FEATURE_FLAGS, DEFAULT_FEATURE_FLAGS);
  },
  setFeatureFlags(flags: FeatureFlags) {
    setStorageItem(KEYS.FEATURE_FLAGS, flags);
  },

  getAnnouncements(): Announcement[] {
    return getStorageItem<Announcement[]>(KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
  },
  setAnnouncements(ann: Announcement[]) {
    setStorageItem(KEYS.ANNOUNCEMENTS, ann);
  },

  getAdminUsers(): AdminUserState[] {
    return getStorageItem<AdminUserState[]>(KEYS.ADMIN_USERS, MOCK_ADMIN_USERS);
  },
  setAdminUsers(users: AdminUserState[]) {
    setStorageItem(KEYS.ADMIN_USERS, users);
  },

  getSupabaseConfig(): { url: string; anonKey: string } {
    return getStorageItem<{ url: string; anonKey: string }>(KEYS.SUPABASE_CONFIG, {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    });
  },
  setSupabaseConfig(cfg: { url: string; anonKey: string }) {
    setStorageItem(KEYS.SUPABASE_CONFIG, cfg);
  },
};
