import type { Candle, Timeframe, TickerData } from '../types/chart';

const REST_ENDPOINTS = [
  'https://api.binance.com/api/v3',
  'https://data-api.binance.vision/api/v3',
  'https://api1.binance.com/api/v3',
  'https://api3.binance.com/api/v3',
];

const WS_BASE = 'wss://stream.binance.com:9443/ws';

export type WsConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'simulated';

export interface BinanceKlineWsMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
  };
}

export interface BinanceMiniTickerWsMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Close price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
}

class BinanceService {
  private activeWs: WebSocket | null = null;
  private miniTickerWs: WebSocket | null = null;
  private simulatedIntervalId: number | null = null;
  private statusListeners: ((status: WsConnectionStatus, latencyMs?: number) => void)[] = [];
  private currentStatus: WsConnectionStatus = 'disconnected';
  private lastPingSent = 0;
  private latency = 24;

  // Fallback REST endpoint iterator
  private async fetchWithFallback(path: string): Promise<Response> {
    let lastError: Error | null = null;
    for (const endpoint of REST_ENDPOINTS) {
      try {
        const url = `${endpoint}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          return res;
        }
      } catch (err) {
        lastError = err as Error;
      }
    }
    throw lastError || new Error('All Binance REST endpoints failed');
  }

  public subscribeStatus(cb: (status: WsConnectionStatus, latencyMs?: number) => void) {
    this.statusListeners.push(cb);
    cb(this.currentStatus, this.latency);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  private setStatus(status: WsConnectionStatus, latencyMs?: number) {
    this.currentStatus = status;
    if (latencyMs !== undefined) this.latency = latencyMs;
    this.statusListeners.forEach((l) => l(status, this.latency));
  }

  // REST: Fetch historical klines
  public async fetchKlines(
    symbol: string,
    interval: Timeframe,
    limit = 350
  ): Promise<Candle[]> {
    try {
      const res = await this.fetchWithFallback(
        `/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
      );
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid kline response');
      }

      return data.map((d: (string | number)[]) => ({
        time: Math.floor(Number(d[0]) / 1000), // in seconds
        open: parseFloat(String(d[1])),
        high: parseFloat(String(d[2])),
        low: parseFloat(String(d[3])),
        close: parseFloat(String(d[4])),
        volume: parseFloat(String(d[5])),
      }));
    } catch (e) {
      console.warn('Binance klines fetch error, using synthetic fallback:', e);
      return this.generateSyntheticKlines(symbol, interval, limit);
    }
  }

  // REST: Fetch 24h Ticker for a symbol
  public async fetch24hTicker(symbol: string): Promise<TickerData> {
    try {
      const res = await this.fetchWithFallback(`/ticker/24hr?symbol=${symbol.toUpperCase()}`);
      const d = await res.json();
      return {
        symbol: d.symbol,
        lastPrice: parseFloat(d.lastPrice),
        priceChange: parseFloat(d.priceChange),
        priceChangePercent: parseFloat(d.priceChangePercent),
        highPrice: parseFloat(d.highPrice),
        lowPrice: parseFloat(d.lowPrice),
        volume: parseFloat(d.volume),
        quoteVolume: parseFloat(d.quoteVolume),
        lastUpdated: Date.now(),
      };
    } catch {
      return {
        symbol,
        lastPrice: 85000,
        priceChange: 1250,
        priceChangePercent: 1.48,
        highPrice: 86400,
        lowPrice: 84100,
        volume: 24500,
        quoteVolume: 2082500000,
        lastUpdated: Date.now(),
      };
    }
  }

  // REST: Fetch all 24h tickers
  public async fetchAll24hTickers(): Promise<Record<string, TickerData>> {
    try {
      const res = await this.fetchWithFallback('/ticker/24hr');
      const data = await res.json();
      const map: Record<string, TickerData> = {};
      if (Array.isArray(data)) {
        for (const d of data) {
          map[d.symbol] = {
            symbol: d.symbol,
            lastPrice: parseFloat(d.lastPrice),
            priceChange: parseFloat(d.priceChange),
            priceChangePercent: parseFloat(d.priceChangePercent),
            highPrice: parseFloat(d.highPrice),
            lowPrice: parseFloat(d.lowPrice),
            volume: parseFloat(d.volume),
            quoteVolume: parseFloat(d.quoteVolume),
            lastUpdated: Date.now(),
          };
        }
      }
      return map;
    } catch {
      return {};
    }
  }

  // WebSocket: Subscribe to active symbol kline stream
  public subscribeKline(
    symbol: string,
    interval: Timeframe,
    onCandle: (candle: Candle, isClosed: boolean) => void,
    onTick?: (price: number) => void
  ) {
    this.closeActiveWs();
    this.setStatus('connecting');

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const url = `${WS_BASE}/${streamName}`;

    try {
      this.lastPingSent = performance.now();
      const ws = new WebSocket(url);
      this.activeWs = ws;

      ws.onopen = () => {
        const lat = Math.round(performance.now() - this.lastPingSent);
        this.setStatus('connected', lat);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as BinanceKlineWsMessage;
          if (msg && msg.k) {
            const k = msg.k;
            const candle: Candle = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };
            onCandle(candle, k.x);
            if (onTick) {
              onTick(candle.close);
            }
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      ws.onerror = () => {
        console.warn('WS error on kline stream, starting simulated ticks fallback');
        this.startSimulatedTicks(symbol, interval, onCandle, onTick);
      };

      ws.onclose = () => {
        if (this.activeWs === ws) {
          this.setStatus('reconnecting');
          this.activeWs = null;
          // Start simulated ticks so chart doesn't freeze
          this.startSimulatedTicks(symbol, interval, onCandle, onTick);
        }
      };
    } catch {
      this.startSimulatedTicks(symbol, interval, onCandle, onTick);
    }

    return () => {
      this.closeActiveWs();
    };
  }

  // WebSocket: Subscribe to all tickers stream for live Watchlist updates
  public subscribeWatchlistTickers(onTickerUpdate: (tickers: Record<string, Partial<TickerData>>) => void) {
    if (this.miniTickerWs) {
      try {
        this.miniTickerWs.close();
      } catch {}
    }

    const url = `${WS_BASE}/!miniTicker@arr`;
    try {
      const ws = new WebSocket(url);
      this.miniTickerWs = ws;

      ws.onmessage = (event) => {
        try {
          const arr = JSON.parse(event.data) as BinanceMiniTickerWsMessage[];
          if (Array.isArray(arr)) {
            const updates: Record<string, Partial<TickerData>> = {};
            for (const item of arr) {
              const close = parseFloat(item.c);
              const open = parseFloat(item.o);
              const change = close - open;
              const changePercent = open > 0 ? (change / open) * 100 : 0;
              updates[item.s] = {
                symbol: item.s,
                lastPrice: close,
                priceChange: change,
                priceChangePercent: changePercent,
                highPrice: parseFloat(item.h),
                lowPrice: parseFloat(item.l),
                volume: parseFloat(item.v),
                quoteVolume: parseFloat(item.q),
                lastUpdated: Date.now(),
              };
            }
            onTickerUpdate(updates);
          }
        } catch {}
      };

      ws.onerror = () => {
        // Silent fallback for watchlist
      };
    } catch {}

    return () => {
      if (this.miniTickerWs) {
        try {
          this.miniTickerWs.close();
        } catch {}
        this.miniTickerWs = null;
      }
    };
  }

  public closeActiveWs() {
    if (this.simulatedIntervalId) {
      clearInterval(this.simulatedIntervalId);
      this.simulatedIntervalId = null;
    }
    if (this.activeWs) {
      try {
        this.activeWs.close();
      } catch {}
      this.activeWs = null;
    }
  }

  // Fallback tick generator if WebSocket connection is dropped or blocked
  private startSimulatedTicks(
    _symbol: string,
    interval: Timeframe = '1h',
    onCandle: (candle: Candle, isClosed: boolean) => void,
    onTick?: (price: number) => void
  ) {
    if (this.simulatedIntervalId) clearInterval(this.simulatedIntervalId);
    this.setStatus('simulated', 15);

    let lastClose = 85000;
    this.simulatedIntervalId = window.setInterval(() => {
      const delta = (Math.random() - 0.49) * (lastClose * 0.001);
      lastClose = Math.max(1, lastClose + delta);
      const nowSec = Math.floor(Date.now() / 1000);
      let intervalSec = 3600;
      if (interval === '1m') intervalSec = 60;
      else if (interval === '5m') intervalSec = 300;
      else if (interval === '15m') intervalSec = 900;
      else if (interval === '1h') intervalSec = 3600;
      else if (interval === '4h') intervalSec = 14400;
      else if (interval === '1d') intervalSec = 86400;
      const alignedNow = nowSec - (nowSec % intervalSec);

      const fakeCandle: Candle = {
        time: alignedNow,
        open: lastClose - delta,
        high: Math.max(lastClose, lastClose + Math.abs(delta) * 1.5),
        low: Math.min(lastClose, lastClose - Math.abs(delta) * 1.5),
        close: lastClose,
        volume: Math.floor(Math.random() * 50) + 5,
      };

      onCandle(fakeCandle, false);
      if (onTick) onTick(lastClose);
    }, 1000);
  }

  // Synthetic historical klines generator
  private generateSyntheticKlines(_symbol: string, interval: Timeframe, count: number): Candle[] {
    const candles: Candle[] = [];
    let intervalSec = 3600;
    if (interval === '1m') intervalSec = 60;
    else if (interval === '5m') intervalSec = 300;
    else if (interval === '15m') intervalSec = 900;
    else if (interval === '1h') intervalSec = 3600;
    else if (interval === '4h') intervalSec = 14400;
    else if (interval === '1d') intervalSec = 86400;

    const now = Math.floor(Date.now() / 1000);
    const alignedNow = now - (now % intervalSec);
    let price = 85000;

    for (let i = count; i >= 0; i--) {
      const time = alignedNow - i * intervalSec;
      const change = (Math.random() - 0.48) * (price * 0.015);
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * (price * 0.006);
      const low = Math.min(open, close) - Math.random() * (price * 0.006);
      const volume = Math.random() * 100 + 20;

      candles.push({ time, open, high, low, close, volume });
      price = close;
    }

    return candles;
  }
}

export const binance = new BinanceService();
