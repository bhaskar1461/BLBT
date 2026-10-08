/**
 * Lightweight Privacy-Friendly Analytics
 * Dispatches key platform events without cookies or invasive trackers.
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'signup'
  | 'first_trade'
  | 'first_alert'
  | 'leaderboard_view'
  | 'share_click'
  | 'limit_order_placed'
  | 'feedback_submitted'
  | 'position_closed';

class AnalyticsTracker {
  private eventsLog: { event: AnalyticsEventType; properties?: Record<string, unknown>; timestamp: string }[] = [];

  public track(event: AnalyticsEventType, properties?: Record<string, unknown>) {
    const entry = {
      event,
      properties,
      timestamp: new Date().toISOString(),
    };
    this.eventsLog.push(entry);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] 📊 Event: ${event}`, properties || '');
    }
  }

  public getEvents() {
    return [...this.eventsLog];
  }
}

export const analytics = new AnalyticsTracker();
