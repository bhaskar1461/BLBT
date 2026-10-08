// src/lib/developerApiService.ts
// ==============================================================================
// PHASE 9: THE SENTIMENT API (THE BUSINESS)
// ==============================================================================
// "Build a public API for the sentiment data:
// free tier = 24h-delayed aggregate data with attribution required;
// paid tier (Stripe, $49/mo) = real-time feeds, full history, per-asset breakdowns,
// webhooks. Rate-limited, API-key managed in the user dashboard, usage dashboard included.
// All data remains aggregate-only under the Phase 4 privacy rules."
// ==============================================================================

import crypto from 'crypto';
import { sentimentService, MINIMUM_COHORT_SIZE, SentimentSnapshot } from './sentimentService';

export type ApiKeyTier = 'free' | 'pro';

export interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  tier: ApiKeyTier;
  monthlyLimit: number;
  currentMonthRequests: number;
  lastUsedAt?: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface ApiUsageStats {
  tier: ApiKeyTier;
  monthlyLimit: number;
  currentMonthRequests: number;
  remainingRequests: number;
  percentUsed: number;
  activeKeysCount: number;
}

export interface SentimentApiResponse {
  success: boolean;
  tier: ApiKeyTier;
  attribution?: string;
  isDelayed: boolean;
  delayHours?: number;
  cohortEnforced: boolean;
  minimumCohortSize: number;
  data: any;
  meta: {
    symbol: string;
    timestamp: string;
    queryLatencyMs: number;
    platform: string;
    transparencyLedger: string;
  };
}

class DeveloperApiService {
  private apiKeys: Map<string, ApiKeyRecord> = new Map(); // keyHash -> record
  private userKeysIndex: Map<string, string[]> = new Map(); // userId -> keyHashes[]

  constructor() {
    this.seedDefaultDeveloperKeys();
  }

  /**
   * Seed default developer keys for testing and demo user
   */
  private seedDefaultDeveloperKeys() {
    // 1. Free Demo Key
    const freeRaw = 'cel_free_demo_key_778062e9';
    const freeHash = this.hashKey(freeRaw);
    const freeRecord: ApiKeyRecord = {
      id: 'key_demo_free_1',
      userId: 'usr_celsius_demo',
      name: 'Default Free Feed Key',
      keyPrefix: 'cel_free_demo...',
      keyHash: freeHash,
      tier: 'free',
      monthlyLimit: 1000,
      currentMonthRequests: 42,
      lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
      isRevoked: false,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    };
    this.apiKeys.set(freeHash, freeRecord);
    this.userKeysIndex.set('usr_celsius_demo', [freeHash]);

    // 2. Pro Demo Key for Bhaskar Sharma
    const proRaw = 'cel_pro_live_key_9942a1b2';
    const proHash = this.hashKey(proRaw);
    const proRecord: ApiKeyRecord = {
      id: 'key_bhaskar_pro_1',
      userId: 'usr_bhaskar_sharma',
      name: 'Production Real-Time Stream Key',
      keyPrefix: 'cel_pro_live...',
      keyHash: proHash,
      tier: 'pro',
      monthlyLimit: 100000,
      currentMonthRequests: 1420,
      lastUsedAt: new Date().toISOString(),
      isRevoked: false,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.apiKeys.set(proHash, proRecord);
    this.userKeysIndex.set('usr_bhaskar_sharma', [proHash]);
  }

  /**
   * Compute SHA-256 hash of API Key
   */
  public hashKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Generate New API Key
   */
  public generateApiKey(params: {
    userId: string;
    name?: string;
    tier?: ApiKeyTier;
  }): { rawKey: string; keyRecord: ApiKeyRecord } {
    const tier = params.tier || 'free';
    const randomHex = crypto.randomBytes(16).toString('hex');
    const rawKey = `cel_${tier}_${randomHex}`;
    const keyHash = this.hashKey(rawKey);
    const prefix = `${rawKey.slice(0, 12)}...`;

    const monthlyLimit = tier === 'pro' ? 100000 : 1000;

    const record: ApiKeyRecord = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      name: params.name || `${tier.toUpperCase()} Sentiment Key`,
      keyPrefix: prefix,
      keyHash,
      tier,
      monthlyLimit,
      currentMonthRequests: 0,
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };

    this.apiKeys.set(keyHash, record);

    const existingUserHashes = this.userKeysIndex.get(params.userId) || [];
    existingUserHashes.push(keyHash);
    this.userKeysIndex.set(params.userId, existingUserHashes);

    return { rawKey, keyRecord: record };
  }

  /**
   * Validate and Authenticate Incoming Request
   */
  public validateApiKey(rawKey: string): {
    isValid: boolean;
    error?: string;
    statusCode?: number;
    record?: ApiKeyRecord;
  } {
    if (!rawKey || typeof rawKey !== 'string') {
      return { isValid: false, error: 'API key is required in Authorization header or query parameter', statusCode: 401 };
    }

    const cleanKey = rawKey.replace(/^Bearer\s+/i, '').trim();
    const hash = this.hashKey(cleanKey);
    const record = this.apiKeys.get(hash);

    if (!record) {
      return { isValid: false, error: 'Invalid API key provided', statusCode: 401 };
    }

    if (record.isRevoked) {
      return { isValid: false, error: 'This API key has been revoked', statusCode: 403 };
    }

    // Rate limit check
    if (record.currentMonthRequests >= record.monthlyLimit) {
      return {
        isValid: false,
        error: `Monthly quota exceeded (${record.monthlyLimit} requests/mo). Upgrade to Pro tier ($49/mo) for 100,000 requests/mo.`,
        statusCode: 429,
        record,
      };
    }

    // Increment request usage
    record.currentMonthRequests += 1;
    record.lastUsedAt = new Date().toISOString();

    return { isValid: true, record };
  }

  /**
   * Get Sentiment Feed for an API Client
   * Invariant: Free tier = 24h delayed + attribution; Pro tier = real-time feeds.
   * Invariant: Minimum cohort of 25 active traders strictly enforced, zero user IDs exposed.
   */
  public getSentimentFeed(symbol: string, record: ApiKeyRecord): SentimentApiResponse {
    const startTime = Date.now();
    const sym = (symbol || 'BTCUSDT').toUpperCase();
    const isPro = record.tier === 'pro';

    const liveResult = sentimentService.getLiveSentiment(sym);
    const delayedResult = sentimentService.getPublicDelayedSentiment(sym);
    const currentSnapshot = liveResult.snapshot || delayedResult.currentSummary;
    const timeSeries = delayedResult.timeSeries;

    if (isPro) {
      // PRO TIER: Real-time feeds, full series, deep metrics
      return {
        success: true,
        tier: 'pro',
        isDelayed: false,
        cohortEnforced: true,
        minimumCohortSize: MINIMUM_COHORT_SIZE,
        data: {
          snapshot: currentSnapshot,
          timeSeries,
          liquidityFlow: {
            retailBias: currentSnapshot.longPct > currentSnapshot.shortPct ? 'HEAVY_LONG' : 'HEAVY_SHORT',
            crowdAccuracyRatePct: currentSnapshot.crowdAccuracyPct,
            contrarianSignal: currentSnapshot.longPct >= 75 ? 'EXTREME_RETAIL_LONG_CONTRARIAN_SHORT' : 'BALANCED',
          },
        },
        meta: {
          symbol: sym,
          timestamp: new Date().toISOString(),
          queryLatencyMs: Date.now() - startTime,
          platform: '°C Celsius Network The Honest Terminal',
          transparencyLedger: 'https://celsius.network/transparency',
        },
      };
    }

    // FREE TIER: 24h Delayed Data + Mandatory Attribution
    const delayedSnapshot: SentimentSnapshot = {
      ...delayedResult.currentSummary,
      headlineInsight: `[24h Delayed] ${delayedResult.currentSummary.headlineInsight}`,
    };

    return {
      success: true,
      tier: 'free',
      attribution: 'Data provided by Celsius Network (celsius.network). Free tier with 24-hour delay.',
      isDelayed: true,
      delayHours: 24,
      cohortEnforced: true,
      minimumCohortSize: MINIMUM_COHORT_SIZE,
      data: {
        snapshot: delayedSnapshot,
        notice: 'Real-time zero-delay streaming feeds available on Pro tier ($49/mo).',
      },
      meta: {
        symbol: sym,
        timestamp: delayedSnapshot.timestamp,
        queryLatencyMs: Date.now() - startTime,
        platform: '°C Celsius Network The Honest Terminal',
        transparencyLedger: 'https://celsius.network/transparency',
      },
    };
  }

  /**
   * List API Keys for a User
   */
  public listUserKeys(userId: string): ApiKeyRecord[] {
    const hashes = this.userKeysIndex.get(userId) || [];
    return hashes
      .map((h) => this.apiKeys.get(h))
      .filter((r): r is ApiKeyRecord => Boolean(r));
  }

  /**
   * Revoke an API Key
   */
  public revokeKey(userId: string, keyId: string): boolean {
    const hashes = this.userKeysIndex.get(userId) || [];
    for (const h of hashes) {
      const rec = this.apiKeys.get(h);
      if (rec && rec.id === keyId) {
        rec.isRevoked = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Upgrade Key to Pro Tier ($49/mo)
   */
  public upgradeToPro(userId: string, keyId: string): ApiKeyRecord {
    const hashes = this.userKeysIndex.get(userId) || [];
    for (const h of hashes) {
      const rec = this.apiKeys.get(h);
      if (rec && rec.id === keyId) {
        rec.tier = 'pro';
        rec.monthlyLimit = 100000;
        return rec;
      }
    }
    throw new Error('Key not found');
  }

  /**
   * Get Usage Stats for a User
   */
  public getUsageStats(userId: string): ApiUsageStats {
    const keys = this.listUserKeys(userId);
    const active = keys.filter((k) => !k.isRevoked);

    const hasPro = active.some((k) => k.tier === 'pro');
    const totalRequests = active.reduce((sum, k) => sum + k.currentMonthRequests, 0);
    const totalLimit = active.reduce((sum, k) => sum + k.monthlyLimit, 0) || 1000;

    return {
      tier: hasPro ? 'pro' : 'free',
      monthlyLimit: totalLimit,
      currentMonthRequests: totalRequests,
      remainingRequests: Math.max(0, totalLimit - totalRequests),
      percentUsed: Number(((totalRequests / totalLimit) * 100).toFixed(1)),
      activeKeysCount: active.length,
    };
  }
}

export const developerApiService = new DeveloperApiService();
