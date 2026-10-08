export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number; // Unix timestamp in seconds for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  category: 'Major' | 'Layer 1' | 'DeFi' | 'Meme' | 'Layer 2' | 'AI' | 'Other' | 'Index' | 'Stock';
  pricePrecision: number;
  minQty: number;
  icon?: string;
}

export interface TickerData {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  direction?: 'up' | 'down' | 'neutral';
  lastUpdated?: number;
}

export interface IndicatorConfig {
  ema: {
    enabled9: boolean;
    enabled21: boolean;
    enabled50: boolean;
    enabled200: boolean;
    color9: string;
    color21: string;
    color50: string;
    color200: string;
  };
  sma: {
    enabled20: boolean;
    enabled50: boolean;
    color20: string;
    color50: string;
  };
  rsi: {
    enabled: boolean;
    period: number;
    color: string;
    overbought: number;
    oversold: number;
  };
  macd: {
    enabled: boolean;
    fast: number;
    slow: number;
    signal: number;
    macdColor: string;
    signalColor: string;
    histUpColor: string;
    histDownColor: string;
  };
}

export interface CrosshairData {
  time?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}
