export type AlertCondition = 'above' | 'below';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
  note?: string;
}

export interface AlertNotification {
  id: string;
  symbol: string;
  title: string;
  message: string;
  currentPrice: number;
  targetPrice: number;
  timestamp: number;
  read: boolean;
}
