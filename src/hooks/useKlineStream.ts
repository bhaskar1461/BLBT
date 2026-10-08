import { useEffect } from 'react';
import { useChartStore } from '../stores/useChartStore';
import { binanceClient } from '../lib/binance';
import { alertsEngine } from '../services/alertsEngine';
import { tradingEngine } from '../services/tradingEngine';

export function useKlineStream() {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const timeframe = useChartStore((s) => s.timeframe);
  const setCandles = useChartStore((s) => s.setCandles);
  const setIsLoading = useChartStore((s) => s.setIsLoading);
  const updateCandle = useChartStore((s) => s.updateCandle);
  const setConnectionStatus = useChartStore((s) => s.setConnectionStatus);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    // 1. Initial REST fetch for historical candles (limit 500)
    binanceClient.fetchKlines(activeSymbol, timeframe, 500).then((data) => {
      if (!isCancelled) {
        setCandles(data);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!isCancelled) {
        setIsLoading(false);
      }
    });

    // 2. Subscribe to status updates (connected, ping latency)
    const unsubStatus = binanceClient.subscribeStatus((status, latency) => {
      if (!isCancelled) {
        setConnectionStatus(status, latency);
      }
    });

    // 3. Subscribe to live WebSocket kline stream
    const unsubKline = binanceClient.subscribeKline(activeSymbol, timeframe, ({ candle, isClosed, price }) => {
      if (!isCancelled) {
        updateCandle(candle, isClosed);
        alertsEngine.checkPrice(activeSymbol, price);
        tradingEngine.onPriceTick(activeSymbol, price);
      }
    });

    return () => {
      isCancelled = true;
      unsubStatus();
      unsubKline();
    };
  }, [activeSymbol, timeframe, setCandles, updateCandle, setConnectionStatus]);
}
