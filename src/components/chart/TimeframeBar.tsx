'use client';

import React from 'react';
import { CandlestickChart, LineChart, Maximize2, Sliders } from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import type { Timeframe } from '@/types/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimeframeBarProps {
  onOpenIndicators: () => void;
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

export const TimeframeBar: React.FC<TimeframeBarProps> = ({ onOpenIndicators }) => {
  const timeframe = useChartStore((s) => s.timeframe);
  const setTimeframe = useChartStore((s) => s.setTimeframe);
  const chartType = useChartStore((s) => s.chartType);
  const setChartType = useChartStore((s) => s.setChartType);
  const indicators = useChartStore((s) => s.indicators);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="h-9 bg-surface border-b border-subtle flex items-center justify-between px-3 text-xs select-none">
      {/* Timeframes */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 mr-2">
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  isActive
                    ? 'bg-elevated text-primary font-semibold border border-subtle'
                    : 'text-muted hover:text-main hover:bg-hover'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-subtle mx-1" />

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={chartType === 'candles' ? 'bg-elevated text-bull' : 'text-muted'}
            onClick={() => setChartType('candles')}
            title="Candlestick Chart"
          >
            <CandlestickChart size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={chartType === 'line' ? 'bg-elevated text-primary' : 'text-muted'}
            onClick={() => setChartType('line')}
            title="Line Area Chart"
          >
            <LineChart size={14} />
          </Button>
        </div>

        <div className="w-[1px] h-4 bg-subtle mx-1" />

        {/* Active Indicators Readout Chips */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            onClick={onOpenIndicators}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-main px-1.5 py-0.5 rounded hover:bg-hover transition-colors"
          >
            <Sliders size={12} />
            <span>Indicators</span>
          </button>

          {indicators.ema.enabled9 && (
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/40">
              EMA 9
            </Badge>
          )}
          {indicators.ema.enabled21 && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-500/40">
              EMA 21
            </Badge>
          )}
          {indicators.rsi.enabled && (
            <Badge variant="outline" className="text-purple-400 border-purple-500/40">
              RSI {indicators.rsi.period}
            </Badge>
          )}
          {indicators.macd.enabled && (
            <Badge variant="outline" className="text-blue-400 border-blue-500/40">
              MACD
            </Badge>
          )}
        </div>
      </div>

      {/* Fullscreen Button */}
      <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle Fullscreen">
        <Maximize2 size={13} />
      </Button>
    </div>
  );
};
