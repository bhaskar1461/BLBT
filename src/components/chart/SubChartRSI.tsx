'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { useChartStore } from '@/stores/useChartStore';
import { calculateRSI } from '@/lib/indicators';
import { X } from 'lucide-react';

export const SubChartRSI: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [currentRsi, setCurrentRsi] = useState<number | null>(null);

  const candles = useChartStore((s) => s.candles);
  const indicators = useChartStore((s) => s.indicators);
  const setIndicators = useChartStore((s) => s.setIndicators);
  const config = indicators.rsi;

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
      rightPriceScale: { borderColor: '#1e2638', autoScale: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
    });

    chartRef.current = chart;

    const rsiSeries = chart.addSeries(LineSeries, {
      color: config.color,
      lineWidth: 1,
      priceLineVisible: false,
    });
    seriesRef.current = rsiSeries;

    rsiSeries.createPriceLine({
      price: config.overbought,
      color: 'rgba(255, 59, 87, 0.7)',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'OB',
    });

    rsiSeries.createPriceLine({
      price: config.oversold,
      color: 'rgba(0, 240, 144, 0.7)',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'OS',
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
    if (!candles || candles.length === 0 || !seriesRef.current) return;
    const rsiPoints = calculateRSI(candles, config.period);
    seriesRef.current.setData(rsiPoints.map((p) => ({ time: p.time as unknown as string, value: p.value })));
    if (rsiPoints.length > 0) {
      setCurrentRsi(rsiPoints[rsiPoints.length - 1].value);
    }
    chartRef.current?.timeScale().fitContent();
  }, [candles, config.period]);

  const handleClose = () => {
    setIndicators({
      ...indicators,
      rsi: { ...indicators.rsi, enabled: false },
    });
  };

  return (
    <div className="relative h-24 border-t border-subtle bg-canvas">
      <div className="absolute top-1.5 left-3 z-10 flex items-center gap-2 font-mono text-[11px]">
        <span className="text-purple-400 font-semibold">RSI ({config.period})</span>
        {currentRsi !== null && (
          <span
            className={
              currentRsi >= config.overbought
                ? 'text-bear font-bold'
                : currentRsi <= config.oversold
                ? 'text-bull font-bold'
                : 'text-main font-bold'
            }
          >
            {currentRsi.toFixed(2)}
          </span>
        )}
      </div>

      <button
        onClick={handleClose}
        className="absolute top-1.5 right-12 z-10 text-faint hover:text-main"
        title="Hide RSI Pane"
      >
        <X size={13} />
      </button>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
