// src/lib/tournamentService.ts
// ==============================================================================
// PHASE 8: COMMUNITY WITHOUT CASINO VIBES
// ==============================================================================
// "Build tournaments: admin creates one (duration, rules, starting balance).
// The enforced per-trade risk cap carries over. Leaderboard ranks by risk-adjusted
// return, not raw P&L. All tournament history is permanent and ledger-verified.
// Auto-flag impossible win rates for admin review. No entry fees — tournaments
// are free, always."
// ==============================================================================

export interface TournamentRules {
  eligiblePairs: string[];
  maxDailyLossPct: number;
  perTradeRiskCapPct: number;
  minTradesForRank: number;
  allowWeekendTrading: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  startingBalanceUsdt: number;
  riskCapPct: number;
  maxDailyLossPct: number;
  rules: TournamentRules;
  status: 'upcoming' | 'active' | 'completed';
  entryFee: 0; // Strictly zero invariant
  participantCount: number;
  createdAt: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  startingBalanceUsdt: number;
  currentBalanceUsdt: number;
  realizedPnlPct: number;
  maxDrawdownPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  riskAdjustedScore: number; // Primary ranking metric!
  isFlaggedForReview: boolean;
  flagReason?: string;
  disqualified: boolean;
  rank: number;
  joinedAt: string;
  updatedAt: string;
}

class TournamentService {
  private tournaments: Map<string, Tournament> = new Map();
  private participants: Map<string, TournamentParticipant[]> = new Map();

  constructor() {
    this.seedDefaultTournaments();
  }

  /**
   * Calculate Risk-Adjusted Score
   * Formula: (Return % / (Max Drawdown % + 1.0)) * Sample Weight
   * Invariant: Disciplined low-drawdown execution beats reckless 100x gamblers.
   */
  public calculateRiskAdjustedScore(
    returnPct: number,
    maxDrawdownPct: number,
    totalTrades: number
  ): number {
    const dd = Math.max(0, maxDrawdownPct);
    const sampleWeight = totalTrades >= 5 ? 1.0 : Math.max(0.2, totalTrades / 5);
    const baseScore = returnPct / (dd + 1.0);
    return Number((baseScore * sampleWeight).toFixed(4));
  }

  /**
   * Auto-flag statistically improbable win rates for admin review
   * Invariant: Impossible retail win rates are flagged automatically.
   */
  public checkImprobableWinRate(
    totalTrades: number,
    winRatePct: number
  ): { isFlagged: boolean; reason?: string } {
    if (totalTrades >= 5 && winRatePct >= 100) {
      return {
        isFlagged: true,
        reason: `100% win rate across ${totalTrades} consecutive trades without a loss. Flagged for review.`,
      };
    }
    if (totalTrades >= 8 && winRatePct >= 95) {
      return {
        isFlagged: true,
        reason: `Statistically improbable win rate (${winRatePct.toFixed(1)}% across ${totalTrades} trades). Flagged for admin verification.`,
      };
    }
    return { isFlagged: false };
  }

  /**
   * Seed realistic tournaments and participants
   */
  private seedDefaultTournaments() {
    const now = Date.now();
    const oneDay = 86400000;

    // 1. Active Tournament: The Discipline Cup
    const t1: Tournament = {
      id: 'tourney-discipline-cup-2026',
      title: 'The Discipline Cup: Risk-Adjusted Alpha',
      description:
        'The anti-casino tournament: raw P&L does not win. Ranks purely by return divided by maximum drawdown. Enforces 1.0% risk cap per trade.',
      startsAt: new Date(now - 7 * oneDay).toISOString(),
      endsAt: new Date(now + 7 * oneDay).toISOString(),
      startingBalanceUsdt: 10000,
      riskCapPct: 1.0,
      maxDailyLossPct: 5.0,
      rules: {
        eligiblePairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'],
        maxDailyLossPct: 5.0,
        perTradeRiskCapPct: 1.0,
        minTradesForRank: 3,
        allowWeekendTrading: true,
      },
      status: 'active',
      entryFee: 0,
      participantCount: 42,
      createdAt: new Date(now - 8 * oneDay).toISOString(),
    };
    this.tournaments.set(t1.id, t1);

    // Seed realistic participants with varying risk profiles
    const rawParticipants: Omit<TournamentParticipant, 'rank'>[] = [
      {
        id: 'p-1',
        tournamentId: t1.id,
        userId: 'usr-sarah-m',
        username: 'sarah_m',
        displayName: 'Sarah Miller',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        startingBalanceUsdt: 10000,
        currentBalanceUsdt: 11480,
        realizedPnlPct: 14.8,
        maxDrawdownPct: 2.1,
        totalTrades: 16,
        winningTrades: 11,
        losingTrades: 5,
        winRatePct: 68.75,
        riskAdjustedScore: this.calculateRiskAdjustedScore(14.8, 2.1, 16), // 14.8 / 3.1 = 4.77
        isFlaggedForReview: false,
        disqualified: false,
        joinedAt: new Date(now - 7 * oneDay).toISOString(),
        updatedAt: new Date(now - 1 * oneDay).toISOString(),
      },
      {
        id: 'p-2',
        tournamentId: t1.id,
        userId: 'usr_celsius_demo',
        username: 'satoshisniper',
        displayName: 'Alex "Satoshi" Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        startingBalanceUsdt: 10000,
        currentBalanceUsdt: 11120,
        realizedPnlPct: 11.2,
        maxDrawdownPct: 1.8,
        totalTrades: 14,
        winningTrades: 9,
        losingTrades: 5,
        winRatePct: 64.29,
        riskAdjustedScore: this.calculateRiskAdjustedScore(11.2, 1.8, 14), // 11.2 / 2.8 = 4.00
        isFlaggedForReview: false,
        disqualified: false,
        joinedAt: new Date(now - 7 * oneDay).toISOString(),
        updatedAt: new Date(now - 2 * oneDay).toISOString(),
      },
      {
        id: 'p-3',
        tournamentId: t1.id,
        userId: 'usr-gambler-whale',
        username: 'yolo_trader',
        displayName: 'Degen Rick (High Drawdown Gambler)',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        startingBalanceUsdt: 10000,
        currentBalanceUsdt: 13200,
        realizedPnlPct: 32.0, // High raw PnL!
        maxDrawdownPct: 38.4, // Massive drawdown
        totalTrades: 18,
        winningTrades: 10,
        losingTrades: 8,
        winRatePct: 55.56,
        riskAdjustedScore: this.calculateRiskAdjustedScore(32.0, 38.4, 18), // 32.0 / 39.4 = 0.81 (Fairly ranked below disciplined traders!)
        isFlaggedForReview: false,
        disqualified: false,
        joinedAt: new Date(now - 7 * oneDay).toISOString(),
        updatedAt: new Date(now - 1 * oneDay).toISOString(),
      },
      {
        id: 'p-4',
        tournamentId: t1.id,
        userId: 'usr-suspicious-bot',
        username: 'quantum_signals',
        displayName: 'Quantum Signals (Flagged Bot)',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        startingBalanceUsdt: 10000,
        currentBalanceUsdt: 12100,
        realizedPnlPct: 21.0,
        maxDrawdownPct: 0.1,
        totalTrades: 12,
        winningTrades: 12,
        losingTrades: 0,
        winRatePct: 100.0, // Impossible win rate!
        riskAdjustedScore: this.calculateRiskAdjustedScore(21.0, 0.1, 12),
        isFlaggedForReview: true,
        flagReason: '100% win rate across 12 consecutive trades without a loss. Flagged for review.',
        disqualified: false,
        joinedAt: new Date(now - 6 * oneDay).toISOString(),
        updatedAt: new Date(now - 1 * oneDay).toISOString(),
      },
    ];

    // Sort by verified status first, then risk-adjusted score, and assign rank
    const sorted = [...rawParticipants].sort((a, b) => {
      if (a.isFlaggedForReview !== b.isFlaggedForReview) {
        return a.isFlaggedForReview ? 1 : -1;
      }
      return b.riskAdjustedScore - a.riskAdjustedScore;
    });
    const ranked: TournamentParticipant[] = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
    this.participants.set(t1.id, ranked);

    // 2. Upcoming Tournament: The Weekly Sprint
    const t2: Tournament = {
      id: 'tourney-weekly-sprint',
      title: 'Weekly BTC Consistency Sprint',
      description:
        'A 7-day sprint focused exclusively on Bitcoin spot momentum. Zero entry fees, 100% transparent append-only trade ledger.',
      startsAt: new Date(now + 2 * oneDay).toISOString(),
      endsAt: new Date(now + 9 * oneDay).toISOString(),
      startingBalanceUsdt: 10000,
      riskCapPct: 1.0,
      maxDailyLossPct: 5.0,
      rules: {
        eligiblePairs: ['BTCUSDT'],
        maxDailyLossPct: 5.0,
        perTradeRiskCapPct: 1.0,
        minTradesForRank: 3,
        allowWeekendTrading: false,
      },
      status: 'upcoming',
      entryFee: 0,
      participantCount: 18,
      createdAt: new Date(now - 1 * oneDay).toISOString(),
    };
    this.tournaments.set(t2.id, t2);
    this.participants.set(t2.id, []);
  }

  /**
   * Retrieve list of all tournaments
   */
  public listTournaments(): Tournament[] {
    return Array.from(this.tournaments.values()).sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    );
  }

  /**
   * Get tournament by ID
   */
  public getTournament(id: string): Tournament | undefined {
    return this.tournaments.get(id);
  }

  /**
   * Get ranked participants for a tournament
   */
  public getLeaderboard(tournamentId: string): TournamentParticipant[] {
    const list = this.participants.get(tournamentId) || [];
    const sorted = [...list].sort((a, b) => {
      if (a.isFlaggedForReview !== b.isFlaggedForReview) {
        return a.isFlaggedForReview ? 1 : -1;
      }
      return b.riskAdjustedScore - a.riskAdjustedScore;
    });
    return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }

  /**
   * Free Join Tournament Invariant (entryFee = 0)
   */
  public joinTournament(
    tournamentId: string,
    user: { userId: string; username: string; displayName: string; avatarUrl?: string }
  ): TournamentParticipant {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status === 'completed') {
      throw new Error('This tournament has already ended');
    }

    const currentParticipants = this.participants.get(tournamentId) || [];
    const existing = currentParticipants.find((p) => p.userId === user.userId);
    if (existing) {
      return existing;
    }

    const newParticipant: TournamentParticipant = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tournamentId,
      userId: user.userId,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      startingBalanceUsdt: tournament.startingBalanceUsdt,
      currentBalanceUsdt: tournament.startingBalanceUsdt,
      realizedPnlPct: 0,
      maxDrawdownPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePct: 0,
      riskAdjustedScore: 0,
      isFlaggedForReview: false,
      disqualified: false,
      rank: currentParticipants.length + 1,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentParticipants.push(newParticipant);
    tournament.participantCount = currentParticipants.length;
    this.participants.set(tournamentId, currentParticipants);

    return newParticipant;
  }

  /**
   * Admin Tournament Creation
   * Invariant: entryFee is strictly 0.0000 (free always).
   */
  public createTournament(input: {
    title: string;
    description: string;
    durationDays: number;
    startingBalanceUsdt?: number;
    riskCapPct?: number;
    rules?: Partial<TournamentRules>;
  }): Tournament {
    const now = Date.now();
    const durationDays = Math.max(1, input.durationDays || 7);
    const startsAt = new Date().toISOString();
    const endsAt = new Date(now + durationDays * 86400000).toISOString();

    const tournament: Tournament = {
      id: `tourney-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title,
      description: input.description,
      startsAt,
      endsAt,
      startingBalanceUsdt: input.startingBalanceUsdt || 10000,
      riskCapPct: input.riskCapPct || 1.0,
      maxDailyLossPct: 5.0,
      rules: {
        eligiblePairs: input.rules?.eligiblePairs || ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'],
        maxDailyLossPct: 5.0,
        perTradeRiskCapPct: input.riskCapPct || 1.0,
        minTradesForRank: input.rules?.minTradesForRank || 3,
        allowWeekendTrading: input.rules?.allowWeekendTrading ?? true,
      },
      status: 'active',
      entryFee: 0, // Free always invariant
      participantCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.tournaments.set(tournament.id, tournament);
    this.participants.set(tournament.id, []);
    return tournament;
  }

  /**
   * Flag or clear participant review status
   */
  public setParticipantReviewStatus(
    tournamentId: string,
    userId: string,
    isFlagged: boolean,
    reason?: string
  ): boolean {
    const list = this.participants.get(tournamentId);
    if (!list) return false;
    const participant = list.find((p) => p.userId === userId);
    if (!participant) return false;

    participant.isFlaggedForReview = isFlagged;
    participant.flagReason = reason;
    participant.updatedAt = new Date().toISOString();
    return true;
  }
}

export const tournamentService = new TournamentService();
