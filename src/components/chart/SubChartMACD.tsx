'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries, HistogramSeries, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { useChartStore } from '@/stores/useChartStore';
import { calculateMACD, type MacdPoint } from '@/lib/indicators';
import { X } from 'lucide-react';

export const SubChartMACD: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const macdLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const signalLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const histRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [latestMacd, setLatestMacd] = useState<MacdPoint | null>(null);

  const candles = useChartStore((s) => s.candles);
  const indicators = useChartStore((s) => s.indicators);
  const setIndicators = useChartStore((s) => s.setIndicators);
  const config = indicators.macd;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#090a0f' },
        textColor: '#94a3b8',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(30, 38, 56, 0.4)' },
        horzLines: { color: 'rgba(30, 38, 56, 0.4)' },
      },
      timeScale: { visible: false },
      rightPriceScale: { borderColor: '#1e2638' },
    });

    chartRef.current = chart;

    histRef.current = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
      priceScaleId: 'right',
    });

    macdLineRef.current = chart.addSeries(LineSeries, {
      color: config.macdColor,
      lineWidth: 1,
      priceLineVisible: false,
    });

    signalLineRef.current = chart.addSeries(LineSeries, {
      color: config.signalColor,
      lineWidth: 1,
      priceLineVisible: false,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && chartRef.current) {
        chartRef.current.applyOptions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candles || candles.length === 0) return;
    const macdData = calculateMACD(candles, config.fast, config.slow, config.signal);
    if (macdData.length === 0) return;

    macdLineRef.current?.setData(macdData.map((d) => ({ time: d.time as unknown as string, value: d.macd })));
    signalLineRef.current?.setData(macdData.map((d) => ({ time: d.time as unknown as string, value: d.signal })));
    histRef.current?.setData(
      macdData.map((d) => ({
        time: d.time as unknown as string,
        value: d.histogram,
        color: d.histogram >= 0 ? config.histUpColor : config.histDownColor,
      }))
    );

    setLatestMacd(macdData[macdData.length - 1]);
    chartRef.current?.timeScale().fitContent();
  }, [candles, config.fast, config.slow, config.signal]);

  const handleClose = () => {
    setIndicators({
      ...indicators,
      macd: { ...indicators.macd, enabled: false },
    });
  };

  return (
    <div className="relative h-28 border-t border-subtle bg-canvas">
      <div className="absolute top-1.5 left-3 z-10 flex items-center gap-2.5 font-mono text-[11px]">
        <span className="font-semibold text-main">
          MACD ({config.fast}, {config.slow}, {config.signal})
        </span>
        {latestMacd && (
          <>
            <span style={{ color: config.macdColor }}>MACD: {latestMacd.macd.toFixed(4)}</span>
            <span style={{ color: config.signalColor }}>Sig: {latestMacd.signal.toFixed(4)}</span>
            <span className={latestMacd.histogram >= 0 ? 'text-bull font-bold' : 'text-bear font-bold'}>
              Hist: {latestMacd.histogram >= 0 ? '+' : ''}
              {latestMacd.histogram.toFixed(4)}
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleClose}
        className="absolute top-1.5 right-12 z-10 text-faint hover:text-main"
        title="Hide MACD Pane"
      >
        <X size={13} />
      </button>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
