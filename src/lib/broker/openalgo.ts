// src/lib/broker/openalgo.ts
// Normalized Broker Abstraction Layer inspired by OpenAlgo (Pendia/OpenAlgo) & Zerodha KiteConnectJS

export type BrokerId = 'paper' | 'zerodha' | 'upstox' | 'dhan' | 'angelone' | 'fyers';

export interface BrokerConfig {
  id: BrokerId;
  name: string;
  tagline: string;
  isConfigured: boolean;
  isConnected: boolean;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  accessToken?: string;
}

export interface NormalizedAccountBalance {
  broker: BrokerId;
  totalBalanceUsdt: number;
  availableMarginUsdt: number;
  usedMarginUsdt: number;
  currency: string;
}

export interface NormalizedOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
  triggerPrice?: number;
  product?: 'MIS' | 'CNC' | 'NRML'; // Intraday vs Delivery vs F&O
}

export interface NormalizedPosition {
  symbol: string;
  product: 'MIS' | 'CNC' | 'NRML';
  quantity: number;
  averagePrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
}

export interface MarketDepthLevel {
  bidPrice: number;
  bidQty: number;
  bidOrders: number;
  askPrice: number;
  askQty: number;
  askOrders: number;
}

export interface MarketDepth {
  symbol: string;
  levels: MarketDepthLevel[];
  totalBuyQty: number;
  totalSellQty: number;
  buyPressurePercent: number;
}

const DEFAULT_BROKERS: BrokerConfig[] = [
  {
    id: 'paper',
    name: 'Celsius Paper Sandbox',
    tagline: 'Deterministic, append-only integer math ledger ($10,000 USDT)',
    isConfigured: true,
    isConnected: true,
  },
  {
    id: 'zerodha',
    name: 'Zerodha Kite',
    tagline: 'KiteConnectJS official WebSocket & order gateway',
    isConfigured: false,
    isConnected: false,
  },
  {
    id: 'upstox',
    name: 'Upstox Pro API v2',
    tagline: 'Ultra-low latency Indian F&O & equity gateway',
    isConfigured: false,
    isConnected: false,
  },
  {
    id: 'dhan',
    name: 'DhanHQ',
    tagline: 'Fast direct order routing for options traders',
    isConfigured: false,
    isConnected: false,
  },
  {
    id: 'angelone',
    name: 'Angel One SmartAPI',
    tagline: 'Algorithmic trading & historical data feeds',
    isConfigured: false,
    isConnected: false,
  },
];

class OpenAlgoGateway {
  private brokers: BrokerConfig[] = DEFAULT_BROKERS;
  private activeBrokerId: BrokerId = 'paper';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('celsius_openalgo_brokers');
        if (saved) {
          this.brokers = JSON.parse(saved);
        }
        const active = localStorage.getItem('celsius_active_broker') as BrokerId;
        if (active) {
          this.activeBrokerId = active;
        }
      } catch {}
    }
  }

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in OpenAlgoGateway listener:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('celsius_openalgo_changed'));
    }
  }

  public getBrokers(): BrokerConfig[] {
    return this.brokers;
  }

  public getActiveBroker(): BrokerConfig {
    return this.brokers.find((b) => b.id === this.activeBrokerId) || this.brokers[0];
  }

  public setActiveBroker(id: BrokerId): void {
    this.activeBrokerId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('celsius_active_broker', id);
    }
    this.notify();
  }

  public updateBrokerConfig(id: BrokerId, config: Partial<BrokerConfig>): void {
    this.brokers = this.brokers.map((b) => (b.id === id ? { ...b, ...config } : b));
    if (typeof window !== 'undefined') {
      localStorage.setItem('celsius_openalgo_brokers', JSON.stringify(this.brokers));
    }
    this.notify();
  }

  // Generate 5-level market depth order book
  public getMarketDepth(symbol: string, currentPrice: number): MarketDepth {
    const spread = currentPrice * 0.0003;
    const levels: MarketDepthLevel[] = [];
    let totalBuyQty = 0;
    let totalSellQty = 0;

    for (let i = 1; i <= 5; i++) {
      const bidPrice = parseFloat((currentPrice - spread * i).toFixed(2));
      const askPrice = parseFloat((currentPrice + spread * i).toFixed(2));
      const bidQty = Math.round(150 * i * (1 + (i % 2) * 0.4));
      const askQty = Math.round(140 * i * (1 + ((i + 1) % 2) * 0.3));
      const bidOrders = Math.max(1, Math.round(bidQty / 25));
      const askOrders = Math.max(1, Math.round(askQty / 22));

      totalBuyQty += bidQty;
      totalSellQty += askQty;

      levels.push({
        bidPrice,
        bidQty,
        bidOrders,
        askPrice,
        askQty,
        askOrders,
      });
    }

    const buyPressurePercent = Math.round((totalBuyQty / (totalBuyQty + totalSellQty || 1)) * 100);

    return {
      symbol,
      levels,
      totalBuyQty,
      totalSellQty,
      buyPressurePercent,
    };
  }
}

export const openAlgoGateway = new OpenAlgoGateway();
