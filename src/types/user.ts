import type { Timeframe, IndicatorConfig } from './chart';

export type UserRole = 'trader' | 'pro' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: number;
  lastLogin: number;
  isMock?: boolean;
}

export interface UserPreferences {
  favoriteSymbols: string[];
  activeWatchlist: string[];
  defaultTimeframe: Timeframe;
  soundEnabled: boolean;
  indicators: IndicatorConfig;
}
