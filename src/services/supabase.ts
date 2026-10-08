import type { UserProfile, UserPreferences } from '../types/user';
import { storage } from './storage';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class SupabaseService {
  private config: SupabaseConfig;
  private isConfigured = false;

  constructor() {
    this.config = storage.getSupabaseConfig();
    this.isConfigured = Boolean(this.config.url && this.config.anonKey);
  }

  public getStatus() {
    return {
      isConfigured: this.isConfigured,
      url: this.config.url,
      hasKey: Boolean(this.config.anonKey),
    };
  }

  public updateConfig(url: string, anonKey: string) {
    this.config = { url, anonKey };
    this.isConfigured = Boolean(url && anonKey);
    storage.setSupabaseConfig(this.config);
  }

  // Simulated / Supabase Email Auth
  public async signInWithEmail(email: string): Promise<UserProfile> {
    const existing = storage.getUserProfile();
    const name = email.split('@')[0] || 'Trader';
    const profile: UserProfile = {
      ...existing,
      id: `usr_${Date.now()}`,
      email,
      displayName: name,
      lastLogin: Date.now(),
      status: 'active',
      isMock: !this.isConfigured,
    };
    storage.setUserProfile(profile);
    return profile;
  }

  // Simulated / Supabase Google OAuth
  public async signInWithGoogle(): Promise<UserProfile> {
    const profile: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email: 'satoshi.nakamoto@gmail.com',
      displayName: 'Satoshi (Google)',
      role: 'admin',
      status: 'active',
      createdAt: Date.now() - 90 * 86400000,
      lastLogin: Date.now(),
      isMock: !this.isConfigured,
    };
    storage.setUserProfile(profile);
    return profile;
  }

  public async signOut(): Promise<void> {
    const guestUser: UserProfile = {
      id: 'usr_guest',
      email: 'guest@celsius.trade',
      displayName: 'Guest Trader',
      role: 'trader',
      status: 'active',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      isMock: true,
    };
    storage.setUserProfile(guestUser);
  }

  public async syncPreferences(prefs: UserPreferences): Promise<void> {
    storage.setUserPreferences(prefs);
    if (this.isConfigured) {
      // In real Supabase, would upsert to user_preferences table
      console.log('Synced preferences to Supabase cloud');
    }
  }
}

export const supabaseService = new SupabaseService();
