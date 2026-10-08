import { create } from 'zustand';
import type { TickerData } from '../types/chart';
import { DEFAULT_WATCHLIST } from '../services/symbols';
import { DEFAULT_INDICES_TICKERS } from '../lib/binance';

interface WatchlistState {
  watchlist: string[];
  tickers: Record<string, TickerData>;
  favorites: string[];

  setWatchlist: (list: string[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setTickers: (tickers: Record<string, TickerData>) => void;
  updateTickers: (updates: Record<string, Partial<TickerData>>) => void;
  toggleFavorite: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  watchlist: DEFAULT_WATCHLIST,
  tickers: { ...DEFAULT_INDICES_TICKERS },
  favorites: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AMZN', 'NVDA'],

  setWatchlist: (watchlist) => set({ watchlist }),

  addToWatchlist: (symbol) =>
    set((state) => {
      if (state.watchlist.includes(symbol)) return state;
      return { watchlist: [...state.watchlist, symbol] };
    }),

  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((s) => s !== symbol),
    })),

  setTickers: (tickers) => set({ tickers }),

  updateTickers: (updates) =>
    set((state) => {
      const next = { ...state.tickers };
      for (const [sym, tick] of Object.entries(updates)) {
        if (next[sym]) {
          next[sym] = { ...next[sym], ...tick } as TickerData;
        } else {
          next[sym] = tick as TickerData;
        }
      }
      return { tickers: next };
    }),

  toggleFavorite: (symbol) =>
    set((state) => {
      const isFav = state.favorites.includes(symbol);
      return {
        favorites: isFav
          ? state.favorites.filter((s) => s !== symbol)
          : [...state.favorites, symbol],
      };
    }),
}));
