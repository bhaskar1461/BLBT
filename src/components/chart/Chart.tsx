'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useChartStore } from '@/stores/useChartStore';
import { calculateEMA, calculateSMA } from '@/lib/indicators';
import { formatPrice, formatNumber } from '@/lib/utils';
import { getSymbolInfo } from '@/services/symbols';
import type { Candle } from '@/types/chart';

export const Chart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series references
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema9Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null);

  // Tracking state to optimize setData vs update
  const lastSymbolRef = useRef<string>('');
  const lastTimeframeRef = useRef<string>('');
  const prevCandlesLenRef = useRef<number>(0);
  const lastCandleTimeRef = useRef<number | null>(null);
  const firstCandleTimeRef = useRef<number | null>(null);

  // Read state strictly from Zustand store (dumb renderer pattern)
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const timeframe = useChartStore((s) => s.timeframe);
  const candles = useChartStore((s) => s.candles);
  const isLoading = useChartStore((s) => s.isLoading);
  const chartType = useChartStore((s) => s.chartType);
  const indicators = useChartStore((s) => s.indicators);
  const crosshairData = useChartStore((s) => s.crosshairData);
  const setCrosshairData = useChartStore((s) => s.setCrosshairData);

  const symbolInfo = getSymbolInfo(activeSymbol);

  // Initialize Lightweight Charts canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#787b86',
        fontFamily: "'Trebuchet MS', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(120, 123, 134, 0.5)', width: 1, style: 3, labelBackgroundColor: '#1e222d' },
        horzLine: { color: 'rgba(120, 123, 134, 0.5)', width: 1, style: 3, labelBackgroundColor: '#1e222d' },
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: { top: 0.08, bottom: 0.16 },
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick series with authentic TradingView Pine Green (#089981) and Berry Red (#f23645)
    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#f23645',
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    // Area series for line view
    lineSeriesRef.current = chart.addSeries(AreaSeries, {
      topColor: 'rgba(8, 153, 129, 0.35)',
      bottomColor: 'rgba(8, 153, 129, 0.01)',
      lineColor: '#089981',
      lineWidth: 2,
    });

    // Volume histogram
    volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
      color: 'rgba(8, 153, 129, 0.35)',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeriesRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // EMAs
    ema9Ref.current = chart.addSeries(LineSeries, {
      color: indicators.ema.color9,
      lineWidth: 1,
      title: 'EMA 9',
      priceLineVisible: false,
      lastValueVisible: indicators.ema.enabled9,
    });
    ema21Ref.current = chart.addSeries(LineSeries, {
      color: indicators.ema.color21,
      lineWidth: 1,
      title: 'EMA 21',
      priceLineVisible: false,
      lastValueVisible: indicators.ema.enabled21,
    });
    ema50Ref.current = chart.addSeries(LineSeries, {
      color: indicators.ema.color50,
      lineWidth: 1,
      title: 'EMA 50',
      priceLineVisible: false,
      lastValueVisible: indicators.ema.enabled50,
    });
    ema200Ref.current = chart.addSeries(LineSeries, {
      color: indicators.ema.color200,
      lineWidth: 2,
      title: 'EMA 200',
      priceLineVisible: false,
      lastValueVisible: indicators.ema.enabled200,
    });

    // SMAs
    sma20Ref.current = chart.addSeries(LineSeries, {
      color: indicators.sma.color20,
      lineWidth: 1,
      title: 'SMA 20',
      priceLineVisible: false,
      lastValueVisible: indicators.sma.enabled20,
    });
    sma50Ref.current = chart.addSeries(LineSeries, {
      color: indicators.sma.color50,
      lineWidth: 1,
      title: 'SMA 50',
      priceLineVisible: false,
      lastValueVisible: indicators.sma.enabled50,
    });

    // Crosshair listener syncing to Zustand
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCrosshairData(null);
        return;
      }
      const activeSeries = chartType === 'candles' ? candleSeriesRef.current : lineSeriesRef.current;
      if (!activeSeries) return;
      const data = param.seriesData.get(activeSeries);
      if (data && 'open' in data) {
        const d = data as { open: number; high: number; low: number; close: number };
        const vol = param.seriesData.get(volumeSeriesRef.current!) as { value?: number } | undefined;
        const change = d.close - d.open;
        const changePercent = d.open > 0 ? (change / d.open) * 100 : 0;

        setCrosshairData({
          time: param.time as unknown as number,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: vol?.value || 0,
          change,
          changePercent,
        });
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && chartRef.current) {
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update visibility on chartType change
  useEffect(() => {
    if (candleSeriesRef.current && lineSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: chartType === 'candles' });
      lineSeriesRef.current.applyOptions({ visible: chartType === 'line' });
    }
  }, [chartType]);

  // Update series data when store candles update
  useEffect(() => {
    if (!candles || candles.length === 0) return;

    // Ensure candles are sorted chronologically and unique by timestamp
    const sorted = [...candles].sort((a, b) => a.time - b.time);
    const uniqueCandles: Candle[] = [];
    for (const c of sorted) {
      if (uniqueCandles.length === 0 || uniqueCandles[uniqueCandles.length - 1].time !== c.time) {
        uniqueCandles.push(c);
      } else {
        uniqueCandles[uniqueCandles.length - 1] = c;
      }
    }
    if (uniqueCandles.length === 0) return;

    const firstTime = uniqueCandles[0].time;
    const isContextChanged =
      lastSymbolRef.current !== activeSymbol ||
      lastTimeframeRef.current !== timeframe ||
      prevCandlesLenRef.current === 0 ||
      firstCandleTimeRef.current !== firstTime ||
      Math.abs(uniqueCandles.length - prevCandlesLenRef.current) > 2;

    const candleData = uniqueCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const lineData = uniqueCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.close,
    }));

    const volData = uniqueCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
    }));

    if (isContextChanged) {
      lastSymbolRef.current = activeSymbol;
      lastTimeframeRef.current = timeframe;
      prevCandlesLenRef.current = uniqueCandles.length;
      firstCandleTimeRef.current = firstTime;
      lastCandleTimeRef.current = uniqueCandles[uniqueCandles.length - 1].time;

      if (candleSeriesRef.current) candleSeriesRef.current.setData(candleData);
      if (lineSeriesRef.current) lineSeriesRef.current.setData(lineData);
      if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volData);

      // Auto-fit to frame initial candles perfectly
      chartRef.current?.timeScale().fitContent();
    } else {
      // High-performance single candle update on live WebSocket tick
      const latest = uniqueCandles[uniqueCandles.length - 1];
      if (latest) {
        // If the new candle's timestamp is older than what the series already has,
        // calling .update() is prohibited by Lightweight Charts. Safely fall back to .setData().
        if (lastCandleTimeRef.current !== null && latest.time < lastCandleTimeRef.current) {
          if (candleSeriesRef.current) candleSeriesRef.current.setData(candleData);
          if (lineSeriesRef.current) lineSeriesRef.current.setData(lineData);
          if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volData);
          lastCandleTimeRef.current = latest.time;
        } else {
          try {
            candleSeriesRef.current?.update({
              time: latest.time as UTCTimestamp,
              open: latest.open,
              high: latest.high,
              low: latest.low,
              close: latest.close,
            });

            lineSeriesRef.current?.update({
              time: latest.time as UTCTimestamp,
              value: latest.close,
            });

            volumeSeriesRef.current?.update({
              time: latest.time as UTCTimestamp,
              value: latest.volume,
              color: latest.close >= latest.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
            });

            lastCandleTimeRef.current = latest.time;
          } catch {
            // Safe fallback if update fails for any reason
            if (candleSeriesRef.current) candleSeriesRef.current.setData(candleData);
            if (lineSeriesRef.current) lineSeriesRef.current.setData(lineData);
            if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volData);
            lastCandleTimeRef.current = latest.time;
          }
        }
      }
      prevCandlesLenRef.current = uniqueCandles.length;
    }

    // Update indicator lines with deduplicated candles
    if (indicators.ema.enabled9 && ema9Ref.current) {
      ema9Ref.current.setData(calculateEMA(uniqueCandles, 9).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (indicators.ema.enabled21 && ema21Ref.current) {
      ema21Ref.current.setData(calculateEMA(uniqueCandles, 21).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (indicators.ema.enabled50 && ema50Ref.current) {
      ema50Ref.current.setData(calculateEMA(uniqueCandles, 50).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (indicators.ema.enabled200 && ema200Ref.current) {
      ema200Ref.current.setData(calculateEMA(uniqueCandles, 200).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (indicators.sma.enabled20 && sma20Ref.current) {
      sma20Ref.current.setData(calculateSMA(uniqueCandles, 20).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (indicators.sma.enabled50 && sma50Ref.current) {
      sma50Ref.current.setData(calculateSMA(uniqueCandles, 50).map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
  }, [candles, activeSymbol, timeframe, indicators]);

  // Indicator style updates
  useEffect(() => {
    ema9Ref.current?.applyOptions({ visible: indicators.ema.enabled9, color: indicators.ema.color9, lastValueVisible: indicators.ema.enabled9 });
    ema21Ref.current?.applyOptions({ visible: indicators.ema.enabled21, color: indicators.ema.color21, lastValueVisible: indicators.ema.enabled21 });
    ema50Ref.current?.applyOptions({ visible: indicators.ema.enabled50, color: indicators.ema.color50, lastValueVisible: indicators.ema.enabled50 });
    ema200Ref.current?.applyOptions({ visible: indicators.ema.enabled200, color: indicators.ema.color200, lastValueVisible: indicators.ema.enabled200 });
    sma20Ref.current?.applyOptions({ visible: indicators.sma.enabled20, color: indicators.sma.color20, lastValueVisible: indicators.sma.enabled20 });
    sma50Ref.current?.applyOptions({ visible: indicators.sma.enabled50, color: indicators.sma.color50, lastValueVisible: indicators.sma.enabled50 });
  }, [indicators]);

  const latest = candles[candles.length - 1];
  const display = crosshairData || (latest ? {
    open: latest.open,
    high: latest.high,
    low: latest.low,
    close: latest.close,
    volume: latest.volume,
    change: latest.close - latest.open,
    changePercent: latest.open > 0 ? ((latest.close - latest.open) / latest.open) * 100 : 0,
  } : null);

  const isBull = (display?.change ?? 0) >= 0;

  return (
    <div className="relative w-full h-full flex-1 min-h-[260px] bg-canvas overflow-hidden">
      {/* Dynamic OHLCV Readout in Header */}
      <div className="absolute top-2.5 left-3.5 z-10 pointer-events-none flex flex-col gap-1 font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-main">{activeSymbol}</span>
          {display && (
            <>
              <span>O <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(display.open ?? 0, symbolInfo.pricePrecision)}</b></span>
              <span>H <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(display.high ?? 0, symbolInfo.pricePrecision)}</b></span>
              <span>L <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(display.low ?? 0, symbolInfo.pricePrecision)}</b></span>
              <span>C <b className={isBull ? 'text-bull' : 'text-bear'}>{formatPrice(display.close ?? 0, symbolInfo.pricePrecision)}</b></span>
              <span>Vol <b className="text-muted">{formatNumber(display.volume ?? 0)}</b></span>
              <span>Change <b className={isBull ? 'text-bull' : 'text-bear'}>{isBull ? '+' : ''}{(display.changePercent ?? 0).toFixed(2)}%</b></span>
            </>
          )}
        </div>
      </div>

      {/* Loading Spinner State while initial candles fetch */}
      {(isLoading || candles.length === 0) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-canvas/75 backdrop-blur-[2px] pointer-events-none transition-all duration-300">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-surface/90 border border-subtle/80 shadow-2xl">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-mono text-muted tracking-wide">
              Loading {activeSymbol} {timeframe}...
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
