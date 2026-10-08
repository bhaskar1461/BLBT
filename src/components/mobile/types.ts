// src/components/mobile/types.ts

export interface Quote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
  positive: boolean;
  category: 'india' | 'tech' | 'crypto' | 'all';
  sparkline?: number[];
  open?: number;
  prevClose?: number;
  high?: number;
  low?: number;
  volume?: string;
  currency?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  iconType?: 'macro' | 'chart' | 'crypto' | 'india';
}

export interface PortfolioSummary {
  id: string;
  name: string;
  valueUsd: number;
  changePercent: number;
  positive: boolean;
  sparkline?: number[];
}

export type MobileTab = 'home' | 'markets' | 'watchlist' | 'news' | 'more';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
