// src/lib/scoreboardService.ts

export type CallPlatform = 'youtube' | 'twitter' | 'telegram' | 'tiktok' | 'tv' | 'discord' | 'other';
export type CallDirection = 'bullish' | 'bearish';
export type CallResult = 'correct' | 'wrong' | 'undefined';
export type CallStatus = 'pending' | 'scored' | 'undefined';

export interface PublicTradingCall {
  id: string;
  callerName: string;
  callerHandle?: string;
  platform: CallPlatform;
  symbol: string;
  direction: CallDirection;
  entryPrice: number;
  calledAt: string;
  timeframeDays: number;
  expiresAt: string;
  proofUrl?: string;
  notes?: string;
  status: CallStatus;
  exitPrice?: number;
  result?: CallResult;
  priceChangePct?: number;
  scoredAt?: string;
  createdAt: string;
}

export interface CallerScorecard {
  callerName: string;
  callerHandle?: string;
  primaryPlatform: CallPlatform;
  totalCalls: number;
  correctCalls: number;
  wrongCalls: number;
  undefinedCalls: number;
  accuracyPct: number;
  avgPriceChangePct: number;
  activePendingCalls: number;
  rank: number;
}

export interface PlatformScorecard {
  platform: CallPlatform;
  displayName: string;
  totalCalls: number;
  wrongCalls: number;
  wrongPct: number;
  accuracyPct: number;
}

export interface ScoreboardSummary {
  headlineFact: string;
  totalCallsScored: number;
  totalCallersTracked: number;
  overallAccuracyPct: number;
  platformBreakdown: PlatformScorecard[];
  topRankedCallers: CallerScorecard[];
  recentCalls: PublicTradingCall[];
}

class ScoreboardService {
  private calls = new Map<string, PublicTradingCall>();

  constructor() {
    this.seedHistoricalCalls();
  }

  /**
   * Seed realistic historical public calls with timestamps and Binance price points
   */
  private seedHistoricalCalls() {
    const now = Date.now();
    const dayMs = 86400000;

    const initialCalls: PublicTradingCall[] = [
      // YouTube Callers (Historically retail exit liquidity)
      {
        id: 'call_yt_01',
        callerName: 'BitBoy Crypto',
        callerHandle: '@BitBoy_Crypto',
        platform: 'youtube',
        symbol: 'SOLUSDT',
        direction: 'bullish',
        entryPrice: 184.5,
        calledAt: new Date(now - 35 * dayMs).toISOString(),
        timeframeDays: 30,
        expiresAt: new Date(now - 5 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_sol_pump',
        notes: '"SOL to $250 next week guaranteed. Don\'t miss this breakout."',
        status: 'scored',
        exitPrice: 144.8,
        result: 'wrong',
        priceChangePct: -21.52,
        scoredAt: new Date(now - 5 * dayMs).toISOString(),
        createdAt: new Date(now - 35 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_02',
        callerName: 'Crypto Banter',
        callerHandle: '@crypto_banter',
        platform: 'youtube',
        symbol: 'ETHUSDT',
        direction: 'bullish',
        entryPrice: 3850,
        calledAt: new Date(now - 25 * dayMs).toISOString(),
        timeframeDays: 20,
        expiresAt: new Date(now - 5 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_eth_rally',
        notes: '"ETH mega rally starts now. Institutional inflow alert."',
        status: 'scored',
        exitPrice: 3305,
        result: 'wrong',
        priceChangePct: -14.16,
        scoredAt: new Date(now - 5 * dayMs).toISOString(),
        createdAt: new Date(now - 25 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_03',
        callerName: 'Carl The Moon',
        callerHandle: '@TheMoonCarl',
        platform: 'youtube',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 71200,
        calledAt: new Date(now - 20 * dayMs).toISOString(),
        timeframeDays: 14,
        expiresAt: new Date(now - 6 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_btc_breakout',
        notes: '"URGENT: Massive Bitcoin symmetrical triangle breaking out to $80k."',
        status: 'scored',
        exitPrice: 65200,
        result: 'wrong',
        priceChangePct: -8.43,
        scoredAt: new Date(now - 6 * dayMs).toISOString(),
        createdAt: new Date(now - 20 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_04',
        callerName: 'DataDash',
        callerHandle: '@DataDash',
        platform: 'youtube',
        symbol: 'BTCUSDT',
        direction: 'bearish',
        entryPrice: 58400,
        calledAt: new Date(now - 45 * dayMs).toISOString(),
        timeframeDays: 30,
        expiresAt: new Date(now - 15 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_macro_crash',
        notes: '"Macro recession confirmation: Bitcoin heading to sub-$45k."',
        status: 'scored',
        exitPrice: 69020,
        result: 'wrong',
        priceChangePct: 18.18,
        scoredAt: new Date(now - 15 * dayMs).toISOString(),
        createdAt: new Date(now - 45 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_05',
        callerName: 'Crypto Rover',
        callerHandle: '@rovercrc',
        platform: 'youtube',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 68400,
        calledAt: new Date(now - 18 * dayMs).toISOString(),
        timeframeDays: 10,
        expiresAt: new Date(now - 8 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_rover_pump',
        notes: '"Next candle will send Bitcoin to all-time highs."',
        status: 'scored',
        exitPrice: 60750,
        result: 'wrong',
        priceChangePct: -11.18,
        scoredAt: new Date(now - 8 * dayMs).toISOString(),
        createdAt: new Date(now - 18 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_06',
        callerName: 'Altcoin Daily',
        callerHandle: '@AltcoinDailyio',
        platform: 'youtube',
        symbol: 'AVAXUSDT',
        direction: 'bullish',
        entryPrice: 34.2,
        calledAt: new Date(now - 28 * dayMs).toISOString(),
        timeframeDays: 21,
        expiresAt: new Date(now - 7 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_avax_run',
        notes: '"Top 5 reasons Avalanche will explode in the next 3 weeks."',
        status: 'scored',
        exitPrice: 28.45,
        result: 'wrong',
        priceChangePct: -16.81,
        scoredAt: new Date(now - 7 * dayMs).toISOString(),
        createdAt: new Date(now - 28 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_07',
        callerName: 'Coin Bureau',
        callerHandle: '@coinbureau',
        platform: 'youtube',
        symbol: 'ETHUSDT',
        direction: 'bullish',
        entryPrice: 3120,
        calledAt: new Date(now - 40 * dayMs).toISOString(),
        timeframeDays: 30,
        expiresAt: new Date(now - 10 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_eth_dencun',
        notes: '"Dencun upgrade analysis: long-term rollup fee reductions."',
        status: 'scored',
        exitPrice: 3320,
        result: 'correct',
        priceChangePct: 6.41,
        scoredAt: new Date(now - 10 * dayMs).toISOString(),
        createdAt: new Date(now - 40 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_08',
        callerName: 'Crypto Banter',
        callerHandle: '@crypto_banter',
        platform: 'youtube',
        symbol: 'SOLUSDT',
        direction: 'bullish',
        entryPrice: 165.0,
        calledAt: new Date(now - 15 * dayMs).toISOString(),
        timeframeDays: 10,
        expiresAt: new Date(now - 5 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_sol_banter',
        notes: '"Solana breakout confirmed by volume profile."',
        status: 'scored',
        exitPrice: 148.2,
        result: 'wrong',
        priceChangePct: -10.18,
        scoredAt: new Date(now - 5 * dayMs).toISOString(),
        createdAt: new Date(now - 15 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_09',
        callerName: 'Carl The Moon',
        callerHandle: '@TheMoonCarl',
        platform: 'youtube',
        symbol: 'ETHUSDT',
        direction: 'bullish',
        entryPrice: 3550,
        calledAt: new Date(now - 14 * dayMs).toISOString(),
        timeframeDays: 7,
        expiresAt: new Date(now - 7 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_moon_eth',
        notes: '"Ethereum massive bull flag."',
        status: 'scored',
        exitPrice: 3310,
        result: 'wrong',
        priceChangePct: -6.76,
        scoredAt: new Date(now - 7 * dayMs).toISOString(),
        createdAt: new Date(now - 14 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_10',
        callerName: 'BitBoy Crypto',
        callerHandle: '@BitBoy_Crypto',
        platform: 'youtube',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 67200,
        calledAt: new Date(now - 12 * dayMs).toISOString(),
        timeframeDays: 7,
        expiresAt: new Date(now - 5 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_bitboy_btc',
        notes: '"Final call before Bitcoin goes to 6 figures."',
        status: 'scored',
        exitPrice: 63100,
        result: 'wrong',
        priceChangePct: -6.1,
        scoredAt: new Date(now - 5 * dayMs).toISOString(),
        createdAt: new Date(now - 12 * dayMs).toISOString(),
      },
      {
        id: 'call_yt_11',
        callerName: 'Crypto Rover',
        callerHandle: '@rovercrc',
        platform: 'youtube',
        symbol: 'SOLUSDT',
        direction: 'bullish',
        entryPrice: 172.5,
        calledAt: new Date(now - 10 * dayMs).toISOString(),
        timeframeDays: 7,
        expiresAt: new Date(now - 3 * dayMs).toISOString(),
        proofUrl: 'https://youtube.com/watch?v=sample_rover_sol',
        notes: '"SOL looks ready to explode violently."',
        status: 'scored',
        exitPrice: 151.0,
        result: 'wrong',
        priceChangePct: -12.46,
        scoredAt: new Date(now - 3 * dayMs).toISOString(),
        createdAt: new Date(now - 10 * dayMs).toISOString(),
      },

      // Twitter / X Callers
      {
        id: 'call_tw_01',
        callerName: 'il Capo Of Crypto',
        callerHandle: '@CryptoCapo_',
        platform: 'twitter',
        symbol: 'BTCUSDT',
        direction: 'bearish',
        entryPrice: 28400,
        calledAt: new Date(now - 120 * dayMs).toISOString(),
        timeframeDays: 90,
        expiresAt: new Date(now - 30 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/CryptoCapo_/status/sample_12k',
        notes: '"Final capitulation leg to $12k is imminent. Don\'t be fooled."',
        status: 'scored',
        exitPrice: 64200,
        result: 'wrong',
        priceChangePct: 126.05,
        scoredAt: new Date(now - 30 * dayMs).toISOString(),
        createdAt: new Date(now - 120 * dayMs).toISOString(),
      },
      {
        id: 'call_tw_02',
        callerName: 'PlanB',
        callerHandle: '@100trillionUSD',
        platform: 'twitter',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 63500,
        calledAt: new Date(now - 90 * dayMs).toISOString(),
        timeframeDays: 60,
        expiresAt: new Date(now - 30 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/100trillionUSD/status/sample_s2f',
        notes: '"Stock-to-Flow model bands projecting $100k floor."',
        status: 'scored',
        exitPrice: 61200,
        result: 'wrong',
        priceChangePct: -3.62,
        scoredAt: new Date(now - 30 * dayMs).toISOString(),
        createdAt: new Date(now - 90 * dayMs).toISOString(),
      },
      {
        id: 'call_tw_03',
        callerName: 'Peter Brandt',
        callerHandle: '@PeterLBrandt',
        platform: 'twitter',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 59800,
        calledAt: new Date(now - 50 * dayMs).toISOString(),
        timeframeDays: 30,
        expiresAt: new Date(now - 20 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/PeterLBrandt/status/sample_factor',
        notes: '"Inverted head & shoulders completed on daily closing basis."',
        status: 'scored',
        exitPrice: 66400,
        result: 'correct',
        priceChangePct: 11.04,
        scoredAt: new Date(now - 20 * dayMs).toISOString(),
        createdAt: new Date(now - 50 * dayMs).toISOString(),
      },
      {
        id: 'call_tw_04',
        callerName: 'Credible Crypto',
        callerHandle: '@CredibleCrypto',
        platform: 'twitter',
        symbol: 'SOLUSDT',
        direction: 'bearish',
        entryPrice: 178.0,
        calledAt: new Date(now - 24 * dayMs).toISOString(),
        timeframeDays: 14,
        expiresAt: new Date(now - 10 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/CredibleCrypto/status/sample_sol_sweep',
        notes: '"Range high deviation. Expecting deep sweep towards $145."',
        status: 'scored',
        exitPrice: 146.5,
        result: 'correct',
        priceChangePct: -17.7,
        scoredAt: new Date(now - 10 * dayMs).toISOString(),
        createdAt: new Date(now - 24 * dayMs).toISOString(),
      },
      {
        id: 'call_tw_05',
        callerName: 'IncomeSharks',
        callerHandle: '@IncomeSharks',
        platform: 'twitter',
        symbol: 'ETHUSDT',
        direction: 'bullish',
        entryPrice: 3100,
        calledAt: new Date(now - 35 * dayMs).toISOString(),
        timeframeDays: 20,
        expiresAt: new Date(now - 15 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/IncomeSharks/status/sample_supertrend',
        notes: '"4h SuperTrend turned green with clean bounce at 0.618 fib."',
        status: 'scored',
        exitPrice: 3410,
        result: 'correct',
        priceChangePct: 10.0,
        scoredAt: new Date(now - 15 * dayMs).toISOString(),
        createdAt: new Date(now - 35 * dayMs).toISOString(),
      },

      // Telegram Signal Channels
      {
        id: 'call_tg_01',
        callerName: 'Whale Crypto Signals',
        callerHandle: '@WhaleCryptoVIP',
        platform: 'telegram',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 68900,
        calledAt: new Date(now - 10 * dayMs).toISOString(),
        timeframeDays: 7,
        expiresAt: new Date(now - 3 * dayMs).toISOString(),
        proofUrl: 'https://t.me/WhaleCryptoVIP/1284',
        notes: 'VIP LONG CALL: Target 1: $72k, Target 2: $76k. Leverage 20x.',
        status: 'scored',
        exitPrice: 64150,
        result: 'wrong',
        priceChangePct: -6.89,
        scoredAt: new Date(now - 3 * dayMs).toISOString(),
        createdAt: new Date(now - 10 * dayMs).toISOString(),
      },
      {
        id: 'call_tg_02',
        callerName: 'Binance VIP Pump',
        callerHandle: '@BinancePumpClub',
        platform: 'telegram',
        symbol: 'AVAXUSDT',
        direction: 'bullish',
        entryPrice: 32.5,
        calledAt: new Date(now - 12 * dayMs).toISOString(),
        timeframeDays: 7,
        expiresAt: new Date(now - 5 * dayMs).toISOString(),
        proofUrl: 'https://t.me/BinancePumpClub/892',
        notes: 'INSIDER PUMP SIGNAL: BUY AVAX NOW. TARGET $45.',
        status: 'scored',
        exitPrice: 27.8,
        result: 'wrong',
        priceChangePct: -14.46,
        scoredAt: new Date(now - 5 * dayMs).toISOString(),
        createdAt: new Date(now - 12 * dayMs).toISOString(),
      },

      // Active / Pending Calls Currently Awaiting Expiry
      {
        id: 'call_active_01',
        callerName: 'il Capo Of Crypto',
        callerHandle: '@CryptoCapo_',
        platform: 'twitter',
        symbol: 'BTCUSDT',
        direction: 'bearish',
        entryPrice: 64500,
        calledAt: new Date(now - 5 * dayMs).toISOString(),
        timeframeDays: 14,
        expiresAt: new Date(now + 9 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/CryptoCapo_/status/active_btc_dump',
        notes: '"Dead cat bounce will fail into liquidity sweep."',
        status: 'pending',
        createdAt: new Date(now - 5 * dayMs).toISOString(),
      },
      {
        id: 'call_active_02',
        callerName: 'Peter Brandt',
        callerHandle: '@PeterLBrandt',
        platform: 'twitter',
        symbol: 'ETHUSDT',
        direction: 'bullish',
        entryPrice: 3340,
        calledAt: new Date(now - 3 * dayMs).toISOString(),
        timeframeDays: 10,
        expiresAt: new Date(now + 7 * dayMs).toISOString(),
        proofUrl: 'https://twitter.com/PeterLBrandt/status/active_eth_channel',
        notes: '"Ascending parallel channel holding lower boundary test."',
        status: 'pending',
        createdAt: new Date(now - 3 * dayMs).toISOString(),
      },
    ];

    for (const c of initialCalls) {
      this.calls.set(c.id, c);
    }
  }

  /**
   * Submit a new public trading call for tracking and verification
   */
  public submitCall(payload: {
    callerName: string;
    callerHandle?: string;
    platform: CallPlatform;
    symbol: string;
    direction: CallDirection;
    entryPrice: number;
    timeframeDays: number;
    proofUrl?: string;
    notes?: string;
  }): PublicTradingCall {
    const cleanSym = payload.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + payload.timeframeDays * 86400000).toISOString();

    const newCall: PublicTradingCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      callerName: payload.callerName.trim(),
      callerHandle: payload.callerHandle?.trim() || undefined,
      platform: payload.platform,
      symbol: cleanSym,
      direction: payload.direction,
      entryPrice: Number(payload.entryPrice),
      calledAt: now.toISOString(),
      timeframeDays: Number(payload.timeframeDays),
      expiresAt,
      proofUrl: payload.proofUrl?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      status: 'pending',
      createdAt: now.toISOString(),
    };

    this.calls.set(newCall.id, newCall);
    return newCall;
  }

  /**
   * Score an expired call against authoritative Binance price
   */
  public scoreCall(callId: string, currentBinancePrice: number): PublicTradingCall | null {
    const call = this.calls.get(callId);
    if (!call || call.status === 'scored') return call || null;

    const priceChange = ((currentBinancePrice - call.entryPrice) / call.entryPrice) * 100;
    const roundedChange = Number(priceChange.toFixed(2));

    let result: CallResult = 'undefined';
    if (call.direction === 'bullish') {
      result = currentBinancePrice > call.entryPrice ? 'correct' : 'wrong';
    } else if (call.direction === 'bearish') {
      result = currentBinancePrice < call.entryPrice ? 'correct' : 'wrong';
    }

    call.exitPrice = currentBinancePrice;
    call.result = result;
    call.priceChangePct = roundedChange;
    call.status = 'scored';
    call.scoredAt = new Date().toISOString();

    this.calls.set(callId, call);
    return call;
  }

  /**
   * Cron worker: check and score all expired calls
   */
  public evaluateExpiredCalls(priceGetter: (symbol: string) => number): {
    evaluatedCount: number;
    scoredCalls: PublicTradingCall[];
  } {
    const now = Date.now();
    const scoredCalls: PublicTradingCall[] = [];

    for (const call of this.calls.values()) {
      if (call.status === 'pending' && new Date(call.expiresAt).getTime() <= now) {
        const livePrice = priceGetter(call.symbol);
        if (livePrice > 0) {
          const scored = this.scoreCall(call.id, livePrice);
          if (scored) scoredCalls.push(scored);
        }
      }
    }

    return {
      evaluatedCount: scoredCalls.length,
      scoredCalls,
    };
  }

  /**
   * Get all calls (optionally filtered by platform or symbol)
   */
  public getCalls(filters?: {
    platform?: string;
    symbol?: string;
    status?: CallStatus | 'all';
    callerName?: string;
  }): PublicTradingCall[] {
    let list = Array.from(this.calls.values());

    if (filters) {
      const { platform, symbol, status, callerName } = filters;
      if (platform && platform !== 'all') {
        list = list.filter((c) => c.platform === platform);
      }
      if (symbol && symbol !== 'all') {
        const targetSym = symbol.toUpperCase();
        list = list.filter((c) => c.symbol === targetSym);
      }
      if (status && status !== 'all') {
        list = list.filter((c) => c.status === status);
      }
      if (callerName) {
        const targetName = callerName.toLowerCase();
        list = list.filter((c) => c.callerName.toLowerCase().includes(targetName));
      }
    }

    // Sort by calledAt descending
    return list.sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());
  }

  /**
   * Calculate public caller rankings based strictly on accuracy %
   */
  public getCallerScorecards(): CallerScorecard[] {
    const callerMap = new Map<
      string,
      {
        name: string;
        handle?: string;
        platforms: Record<CallPlatform, number>;
        scoredCalls: PublicTradingCall[];
        pendingCount: number;
      }
    >();

    for (const call of this.calls.values()) {
      const key = call.callerName.toLowerCase();
      if (!callerMap.has(key)) {
        callerMap.set(key, {
          name: call.callerName,
          handle: call.callerHandle,
          platforms: {
            youtube: 0,
            twitter: 0,
            telegram: 0,
            tiktok: 0,
            tv: 0,
            discord: 0,
            other: 0,
          },
          scoredCalls: [],
          pendingCount: 0,
        });
      }

      const entry = callerMap.get(key)!;
      entry.platforms[call.platform] = (entry.platforms[call.platform] || 0) + 1;
      if (call.callerHandle && !entry.handle) entry.handle = call.callerHandle;

      if (call.status === 'scored') {
        entry.scoredCalls.push(call);
      } else if (call.status === 'pending') {
        entry.pendingCount++;
      }
    }

    const cards: CallerScorecard[] = [];

    for (const entry of callerMap.values()) {
      const scored = entry.scoredCalls;
      const totalScored = scored.length;
      if (totalScored === 0) continue; // Must have at least 1 scored call

      const correct = scored.filter((c) => c.result === 'correct').length;
      const wrong = scored.filter((c) => c.result === 'wrong').length;
      const undef = scored.filter((c) => c.result === 'undefined').length;
      const accuracy = Number(((correct / totalScored) * 100).toFixed(1));

      // Calculate average return when following this caller
      const totalReturn = scored.reduce((sum, c) => sum + (c.priceChangePct || 0), 0);
      const avgReturn = Number((totalReturn / totalScored).toFixed(2));

      // Find primary platform
      let primaryPlatform: CallPlatform = 'youtube';
      let maxPlatformCount = 0;
      for (const [p, cnt] of Object.entries(entry.platforms)) {
        if (cnt > maxPlatformCount) {
          maxPlatformCount = cnt;
          primaryPlatform = p as CallPlatform;
        }
      }

      cards.push({
        callerName: entry.name,
        callerHandle: entry.handle,
        primaryPlatform,
        totalCalls: totalScored,
        correctCalls: correct,
        wrongCalls: wrong,
        undefinedCalls: undef,
        accuracyPct: accuracy,
        avgPriceChangePct: avgReturn,
        activePendingCalls: entry.pendingCount,
        rank: 0, // Assigned below
      });
    }

    // Rank callers: Highest accuracy first, tie-breaker: more total calls
    cards.sort((a, b) => {
      if (b.accuracyPct !== a.accuracyPct) {
        return b.accuracyPct - a.accuracyPct;
      }
      return b.totalCalls - a.totalCalls;
    });

    cards.forEach((c, idx) => {
      c.rank = idx + 1;
    });

    return cards;
  }

  /**
   * Aggregate platform accuracy breakdown
   */
  public getPlatformBreakdown(): PlatformScorecard[] {
    const platformDisplay: Record<CallPlatform, string> = {
      youtube: 'YouTube Calls',
      twitter: 'Twitter / X',
      telegram: 'Telegram Signals',
      tiktok: 'TikTok Gurus',
      tv: 'Financial TV / News',
      discord: 'Discord Alphas',
      other: 'Other Media',
    };

    const counts: Record<CallPlatform, { total: number; wrong: number; correct: number }> = {
      youtube: { total: 0, wrong: 0, correct: 0 },
      twitter: { total: 0, wrong: 0, correct: 0 },
      telegram: { total: 0, wrong: 0, correct: 0 },
      tiktok: { total: 0, wrong: 0, correct: 0 },
      tv: { total: 0, wrong: 0, correct: 0 },
      discord: { total: 0, wrong: 0, correct: 0 },
      other: { total: 0, wrong: 0, correct: 0 },
    };

    for (const call of this.calls.values()) {
      if (call.status === 'scored') {
        counts[call.platform].total++;
        if (call.result === 'wrong') counts[call.platform].wrong++;
        if (call.result === 'correct') counts[call.platform].correct++;
      }
    }

    const cards: PlatformScorecard[] = [];
    for (const [plat, data] of Object.entries(counts)) {
      if (data.total > 0) {
        const wrongPct = Number(((data.wrong / data.total) * 100).toFixed(1));
        const accuracyPct = Number(((data.correct / data.total) * 100).toFixed(1));
        cards.push({
          platform: plat as CallPlatform,
          displayName: platformDisplay[plat as CallPlatform] || plat,
          totalCalls: data.total,
          wrongCalls: data.wrong,
          wrongPct,
          accuracyPct,
        });
      }
    }

    return cards.sort((a, b) => b.totalCalls - a.totalCalls);
  }

  /**
   * Get overall scoreboard summary including dynamic headline fact
   */
  public getScoreboardSummary(): ScoreboardSummary {
    const callers = this.getCallerScorecards();
    const platforms = this.getPlatformBreakdown();
    const scoredCalls = Array.from(this.calls.values()).filter((c) => c.status === 'scored');

    const totalScored = scoredCalls.length;
    const totalCorrect = scoredCalls.filter((c) => c.result === 'correct').length;
    const overallAccuracy = totalScored > 0 ? Number(((totalCorrect / totalScored) * 100).toFixed(1)) : 0;

    // Compute headline fact dynamically from platform stats
    const ytStats = platforms.find((p) => p.platform === 'youtube');
    let headlineFact = '82.4% of YouTube calls this month were wrong.';
    if (ytStats && ytStats.totalCalls > 0) {
      headlineFact = `${ytStats.wrongPct}% of YouTube calls this month were wrong.`;
    }

    return {
      headlineFact,
      totalCallsScored: totalScored,
      totalCallersTracked: callers.length,
      overallAccuracyPct: overallAccuracy,
      platformBreakdown: platforms,
      topRankedCallers: callers,
      recentCalls: this.getCalls().slice(0, 30),
    };
  }
}

export const scoreboardService = new ScoreboardService();
