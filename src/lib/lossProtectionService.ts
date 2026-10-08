// src/lib/lossProtectionService.ts
import { serverPaperTrading } from './paperTradingService';
import { adminService } from './adminService';
import type { ClosedTradeRecord } from '@/types/trading';

export interface UserLossProtectionConfig {
  userId: string;
  maxDailyLossPct: number; // default: 5.0 (5%)
  riskPerTradePct: number; // default: 1.0 (1%)
  cooldownUntil: number | null; // epoch ms for 5-min revenge trade pause
  lastUpdatedDate: string; // YYYY-MM-DD
}

export interface DailyLossStatus {
  isLocked: boolean;
  currentLossUsdt: number;
  maxAllowedLossUsdt: number;
  lossPct: number;
  maxDailyLossPct: number;
  isLosingDay: boolean;
  message: string;
}

export interface RevengeTradeStatus {
  detected: boolean;
  rapidTradesCount: number;
  timeSinceLossMinutes: number;
  message: string;
  isCooldownActive: boolean;
  cooldownRemainingSeconds: number;
}

export interface SessionReviewSummary {
  date: string;
  totalTradesToday: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  feesPaidUsdt: number;
  netRealizedPnlUsdt: number;
  ifDoneNothingUsdt: number; // Opportunity delta vs doing 0 trades
  summaryHeadline: string;
}

class LossProtectionService {
  private configs = new Map<string, UserLossProtectionConfig>();

  /**
   * Get or initialize user protection settings (default 5% daily loss cap, 1% risk-per-trade)
   */
  public getConfig(userId: string): UserLossProtectionConfig {
    const today = new Date().toISOString().split('T')[0];
    let cfg = this.configs.get(userId);
    if (!cfg) {
      cfg = {
        userId,
        maxDailyLossPct: 5.0,
        riskPerTradePct: 1.0,
        cooldownUntil: null,
        lastUpdatedDate: today,
      };
      this.configs.set(userId, cfg);
    }
    return cfg;
  }

  /**
   * Set max daily loss cap with strict discipline invariant:
   * ⚠️ Invariant: User CANNOT increase or remove this limit while on a losing day!
   */
  public updateDailyLossCap(
    userId: string,
    newCapPct: number
  ): { success: boolean; error?: string; config?: UserLossProtectionConfig } {
    const cfg = this.getConfig(userId);
    const todayStatus = this.checkDailyLossStatus(userId);

    // Invariant check: Cannot loosen/modify cap on a losing day
    if (todayStatus.isLosingDay && newCapPct > cfg.maxDailyLossPct) {
      return {
        success: false,
        error:
          'Invariant Enforced: You cannot increase or loosen your daily loss limit while on a losing day. Protect your discipline.',
      };
    }

    // Cap must be between 1% and 25%
    const boundedCap = Math.max(1.0, Math.min(25.0, newCapPct));
    cfg.maxDailyLossPct = Number(boundedCap.toFixed(1));
    cfg.lastUpdatedDate = new Date().toISOString().split('T')[0];
    this.configs.set(userId, cfg);

    return { success: true, config: cfg };
  }

  /**
   * Set risk per trade cap (default 1%)
   */
  public updateRiskPerTradeCap(userId: string, riskPct: number): UserLossProtectionConfig {
    const cfg = this.getConfig(userId);
    cfg.riskPerTradePct = Math.max(0.25, Math.min(5.0, riskPct));
    this.configs.set(userId, cfg);
    return cfg;
  }

  /**
   * Activate a 5-minute cooldown break (Revenge trade mitigation)
   */
  public activateBreakCooldown(userId: string, durationMinutes = 5): number {
    const cfg = this.getConfig(userId);
    const until = Date.now() + durationMinutes * 60 * 1000;
    cfg.cooldownUntil = until;
    this.configs.set(userId, cfg);
    return until;
  }

  /**
   * Check if daily loss limit has been breached today (UTC)
   */
  public checkDailyLossStatus(userId: string): DailyLossStatus {
    const isFeatureEnabled = adminService.isFeatureEnabled('loss_limits');
    const cfg = this.getConfig(userId);

    // If feature flag is disabled by admin, never lock
    if (!isFeatureEnabled) {
      return {
        isLocked: false,
        currentLossUsdt: 0,
        maxAllowedLossUsdt: 99999,
        lossPct: 0,
        maxDailyLossPct: cfg.maxDailyLossPct,
        isLosingDay: false,
        message: 'Loss limits disabled by platform configuration',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTrades = this.getTodayClosedTrades(userId, todayStr);

    // Compute today's realized PnL
    const todayRealizedPnl = todayTrades.reduce((sum, t) => sum + t.realizedPnl, 0);
    const isLosingDay = todayRealizedPnl < 0;

    // Base initial capital: assume 10,000 USDT for normal accounts, 500,000 for Bhaskar
    const isBhaskar = userId === 'usr_bhaskar_sharma' || userId === 'usr_celsius_demo';
    const initialCapital = isBhaskar ? 500000 : 10000;
    const maxAllowedLossUsdt = (initialCapital * cfg.maxDailyLossPct) / 100;

    const currentLossUsdt = todayRealizedPnl < 0 ? Math.abs(todayRealizedPnl) : 0;
    const lossPct = Number(((currentLossUsdt / initialCapital) * 100).toFixed(2));
    const isLocked = currentLossUsdt >= maxAllowedLossUsdt;

    const message = isLocked
      ? "You've reached your daily limit. Great traders know when to walk away. The market will be here tomorrow."
      : isLosingDay
      ? `Today's drawdown: -$${currentLossUsdt.toFixed(2)} (${lossPct}% of ${cfg.maxDailyLossPct}% cap).`
      : `Trading active. Daily loss cap: ${cfg.maxDailyLossPct}% ($${maxAllowedLossUsdt.toFixed(2)} USDT).`;

    return {
      isLocked,
      currentLossUsdt,
      maxAllowedLossUsdt,
      lossPct,
      maxDailyLossPct: cfg.maxDailyLossPct,
      isLosingDay,
      message,
    };
  }

  /**
   * Detect revenge trading patterns:
   * Rule: If 3+ rapid trades occur within 15 minutes following a loss
   */
  public detectRevengeTrading(userId: string): RevengeTradeStatus {
    const isFeatureEnabled = adminService.isFeatureEnabled('loss_limits');
    const cfg = this.getConfig(userId);

    const now = Date.now();
    const isCooldownActive = cfg.cooldownUntil !== null && cfg.cooldownUntil > now;
    const cooldownRemainingSeconds = isCooldownActive
      ? Math.max(0, Math.ceil((cfg.cooldownUntil! - now) / 1000))
      : 0;

    if (!isFeatureEnabled) {
      return {
        detected: false,
        rapidTradesCount: 0,
        timeSinceLossMinutes: 0,
        message: '',
        isCooldownActive: false,
        cooldownRemainingSeconds: 0,
      };
    }

    const closedTrades = serverPaperTrading.getUserClosedTrades(userId);
    if (!closedTrades || closedTrades.length === 0) {
      return {
        detected: false,
        rapidTradesCount: 0,
        timeSinceLossMinutes: 0,
        message: '',
        isCooldownActive,
        cooldownRemainingSeconds,
      };
    }

    const sortedTrades: ClosedTradeRecord[] = [...closedTrades].sort(
      (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
    );

    // Check all losing trades within the last 60 minutes
    // Rule: If a user places 3+ trades within 15 minutes of a losing trade
    let detected = false;
    let rapidTradesCount = 0;
    let timeSinceLossMinutes = 0;

    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];
      if (trade.realizedPnl >= 0) continue; // Only evaluate losses

      const lossTime = new Date(trade.closedAt).getTime();
      const timeSinceLossMs = now - lossTime;
      if (timeSinceLossMs > 60 * 60 * 1000) continue; // Ignore losses older than 1 hr

      // Count subsequent trades placed within 15 minutes after this loss
      const subsequentTrades = sortedTrades.filter((t) => {
        if (t.id === trade.id) return false;
        const tTime = new Date(t.openedAt || t.closedAt).getTime();
        return tTime >= lossTime && tTime <= lossTime + 15 * 60 * 1000;
      });

      if (subsequentTrades.length >= 3) {
        detected = true;
        rapidTradesCount = subsequentTrades.length;
        timeSinceLossMinutes = Math.floor(timeSinceLossMs / 60000);
        break;
      }
    }

    const message = detected
      ? 'Pattern detected: 3 rapid trades after a loss. Revenge trading costs the average retail trader 4.2x more than their initial loss. Take 5 minutes.'
      : '';

    return {
      detected,
      rapidTradesCount,
      timeSinceLossMinutes,
      message,
      isCooldownActive,
      cooldownRemainingSeconds,
    };
  }

  /**
   * Post-session review:
   * 3-line card:
   * 1. Total trades today: X (Y wins, Z losses)
   * 2. Fees paid: $X (what the casino made)
   * 3. If you had done nothing: +$X vs -$Y
   */
  public computeSessionReview(userId: string): SessionReviewSummary {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTrades = this.getTodayClosedTrades(userId, todayStr);

    const totalTradesToday = todayTrades.length;
    const winningTrades = todayTrades.filter((t) => t.realizedPnl > 0).length;
    const losingTrades = todayTrades.filter((t) => t.realizedPnl < 0).length;
    const winRatePct =
      totalTradesToday > 0 ? Number(((winningTrades / totalTradesToday) * 100).toFixed(1)) : 0;

    const feesPaidUsdt = Number(todayTrades.reduce((sum, t) => sum + (t.fee || 0), 0).toFixed(2));
    const netRealizedPnlUsdt = Number(
      todayTrades.reduce((sum, t) => sum + t.realizedPnl, 0).toFixed(2)
    );

    // If done nothing: portfolio would not have paid fees nor suffered net loss
    // E.g. If net Realized is -$300 and fees were $25, doing nothing would be +$325 better off
    const ifDoneNothingUsdt = Number((-netRealizedPnlUsdt + feesPaidUsdt).toFixed(2));

    let summaryHeadline = '';
    if (totalTradesToday === 0) {
      summaryHeadline = 'No trades executed today. Capital 100% preserved with $0 fees paid.';
    } else if (netRealizedPnlUsdt >= 0) {
      summaryHeadline = `Disciplined session: +$${netRealizedPnlUsdt.toFixed(2)} net profit after $${feesPaidUsdt.toFixed(2)} fees.`;
    } else {
      summaryHeadline = `Session closed with drawdown of -$${Math.abs(netRealizedPnlUsdt).toFixed(2)}. Inactive baseline was +$${ifDoneNothingUsdt.toFixed(2)} higher.`;
    }

    return {
      date: todayStr,
      totalTradesToday,
      winningTrades,
      losingTrades,
      winRatePct,
      feesPaidUsdt,
      netRealizedPnlUsdt,
      ifDoneNothingUsdt,
      summaryHeadline,
    };
  }

  private getTodayClosedTrades(userId: string, todayStr: string): ClosedTradeRecord[] {
    const allTrades = serverPaperTrading.getUserClosedTrades(userId) || [];
    return allTrades.filter((t) => {
      const datePart = (t.closedAt || '').split('T')[0];
      return datePart === todayStr;
    });
  }
}

export const lossProtectionService = new LossProtectionService();
