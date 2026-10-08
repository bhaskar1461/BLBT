import type { PriceAlert, AlertNotification, AlertCondition } from '../types/alerts';
import { storage } from './storage';
import { sounds } from './audio';

class AlertsEngine {
  private alerts: PriceAlert[] = [];
  private notifications: AlertNotification[] = [];
  private listeners: (() => void)[] = [];
  private toastCallback?: (title: string, message: string, type: 'info' | 'success' | 'alert') => void;

  constructor() {
    this.alerts = storage.getPriceAlerts();
    this.notifications = storage.getAlertNotifications();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public registerToastHandler(cb: (title: string, message: string, type: 'info' | 'success' | 'alert') => void) {
    this.toastCallback = cb;
  }

  private notify() {
    storage.setPriceAlerts(this.alerts);
    storage.setAlertNotifications(this.notifications);
    this.listeners.forEach((l) => l());
  }

  public getAlerts(): PriceAlert[] {
    return [...this.alerts];
  }

  public getNotifications(): AlertNotification[] {
    return [...this.notifications];
  }

  public addAlert(symbol: string, targetPrice: number, condition: AlertCondition, note?: string): PriceAlert {
    const alert: PriceAlert = {
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      symbol,
      targetPrice,
      condition,
      active: true,
      createdAt: Date.now(),
      note,
    };
    this.alerts.unshift(alert);
    this.notify();
    return alert;
  }

  public removeAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.notify();
  }

  public clearNotifications() {
    this.notifications = [];
    this.notify();
  }

  // Check alerts on live price tick
  public checkPrice(symbol: string, currentPrice: number) {
    let triggeredAny = false;

    for (const alert of this.alerts) {
      if (alert.active && alert.symbol === symbol) {
        const isAbove = alert.condition === 'above' && currentPrice >= alert.targetPrice;
        const isBelow = alert.condition === 'below' && currentPrice <= alert.targetPrice;

        if (isAbove || isBelow) {
          alert.active = false;
          alert.triggeredAt = Date.now();
          triggeredAny = true;

          const title = `🚨 Price Alert Triggered: ${symbol}`;
          const message = `${symbol} crossed ${alert.condition.toUpperCase()} $${alert.targetPrice.toLocaleString()} (Now: $${currentPrice.toLocaleString()})${
            alert.note ? ` • "${alert.note}"` : ''
          }`;

          const note: AlertNotification = {
            id: `note_${Date.now()}`,
            symbol,
            title,
            message,
            currentPrice,
            targetPrice: alert.targetPrice,
            timestamp: Date.now(),
            read: false,
          };
          this.notifications.unshift(note);

          sounds.playAlertPing();
          if (this.toastCallback) {
            this.toastCallback(title, message, 'alert');
          }
        }
      }
    }

    if (triggeredAny) {
      this.notify();
    }
  }
}

export const alertsEngine = new AlertsEngine();
