/**
 * Structured Telemetry & Sentry-Compatible Error Logger
 * Captures, ranks, and tracks server & client runtime exceptions.
 */

export interface TelemetryErrorEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  name?: string;
  stack?: string;
  userId?: string;
  route?: string;
  context?: Record<string, unknown>;
  fingerprint?: string;
  occurrenceCount: number;
}

class TelemetryLogger {
  private errorLog: TelemetryErrorEvent[] = [
    {
      id: 'err_solvency_01',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      level: 'critical',
      message: 'Account balance dipped below zero on limit order fill execution without pre-funding verification',
      name: 'InvariantViolationError',
      route: '/api/cron/orders',
      userId: 'usr_trader_7',
      context: { orderId: 'ord_lim_7712', symbol: 'BTCUSDT', balanceUnits: '-18420000000' },
      fingerprint: 'limit_order_solvency_negative_balance',
      occurrenceCount: 14,
    },
    {
      id: 'err_og_crawler_02',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      level: 'error',
      message: 'OpenGraph metadata missing metadataBase URL for social card crawler image resolution',
      name: 'OpenGraphResolutionError',
      route: '/share/trade_8829',
      userId: 'usr_celsius_demo',
      context: { userAgent: 'Discordbot/2.0', targetPath: '/api/og/trade/trade_8829' },
      fingerprint: 'og_missing_metadatabase_host',
      occurrenceCount: 38,
    },
    {
      id: 'err_leaderboard_03',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      level: 'warning',
      message: 'Leaderboard recalculation missed custom trader ID aggregation, returning frozen seed entry',
      name: 'LeaderboardDesyncWarning',
      route: '/api/leaderboard',
      userId: 'usr_bhaskar_sharma',
      context: { timeframe: 'all', closedTrades: 3 },
      fingerprint: 'leaderboard_custom_user_desync',
      occurrenceCount: 22,
    },
  ];

  /**
   * Capture runtime exception with stack trace and context
   */
  public captureException(
    err: unknown,
    context?: { userId?: string; route?: string; metadata?: Record<string, unknown> }
  ): TelemetryErrorEvent {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const fingerprint = `${errorObj.name}:${errorObj.message.slice(0, 50)}`;

    const existing = this.errorLog.find((e) => e.fingerprint === fingerprint);
    if (existing) {
      existing.occurrenceCount += 1;
      existing.timestamp = new Date().toISOString();
      if (context?.userId) existing.userId = context.userId;
      if (context?.route) existing.route = context.route;
      return existing;
    }

    const event: TelemetryErrorEvent = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: errorObj.message,
      name: errorObj.name,
      stack: errorObj.stack,
      userId: context?.userId,
      route: context?.route,
      context: context?.metadata,
      fingerprint,
      occurrenceCount: 1,
    };

    this.errorLog.unshift(event);
    if (this.errorLog.length > 200) {
      this.errorLog.pop();
    }

    console.error(`[Telemetry Logger] ${event.name}: ${event.message}`, {
      route: event.route,
      userId: event.userId,
    });

    return event;
  }

  /**
   * Capture discrete message or warning
   */
  public captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' | 'critical' = 'info',
    context?: { userId?: string; route?: string; metadata?: Record<string, unknown> }
  ): TelemetryErrorEvent {
    const event: TelemetryErrorEvent = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      userId: context?.userId,
      route: context?.route,
      context: context?.metadata,
      occurrenceCount: 1,
    };

    this.errorLog.unshift(event);
    return event;
  }

  /**
   * Retrieve ranked error list by severity and frequency
   */
  public getRecentErrors(limit = 50): TelemetryErrorEvent[] {
    const severityWeight = { critical: 4, error: 3, warning: 2, info: 1 };
    return [...this.errorLog]
      .sort((a, b) => {
        const weightDiff = severityWeight[b.level] - severityWeight[a.level];
        if (weightDiff !== 0) return weightDiff;
        return b.occurrenceCount - a.occurrenceCount;
      })
      .slice(0, limit);
  }
}

export const logger = new TelemetryLogger();
