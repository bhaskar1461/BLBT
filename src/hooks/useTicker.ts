import { useEffect } from 'react';
import { useWatchlistStore } from '../stores/useWatchlistStore';
import { binanceClient } from '../lib/binance';

export function useTicker() {
  const setTickers = useWatchlistStore((s) => s.setTickers);
  const updateTickers = useWatchlistStore((s) => s.updateTickers);

  useEffect(() => {
    let isCancelled = false;

    // Fetch initial snapshot of all 24h tickers
    binanceClient.fetchAll24hTickers().then((all) => {
      if (!isCancelled && Object.keys(all).length > 0) {
        setTickers(all);
      }
    });

    // Subscribe to live miniTicker array stream
    const unsub = binanceClient.subscribeWatchlist((updates) => {
      if (!isCancelled) {
        updateTickers(updates);
      }
    });

    return () => {
      isCancelled = true;
      unsub();
    };
  }, [setTickers, updateTickers]);
}
