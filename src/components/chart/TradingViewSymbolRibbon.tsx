'use client';

import React from 'react';
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CandlestickChart,
  LineChart,
  Sliders,
  Maximize2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { getSymbolInfo, formatPrice } from '@/services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';
import type { Timeframe } from '@/types/chart';

interface TradingViewSymbolRibbonProps {
  onOpenIndicators: () => void;
  onOpenSymbolPicker: () => void;
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

export const TradingViewSymbolRibbon: React.FC<TradingViewSymbolRibbonProps> = ({
  onOpenIndicators,
  onOpenSymbolPicker,
}) => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const timeframe = useChartStore((s) => s.timeframe);
  const setTimeframe = useChartStore((s) => s.setTimeframe);
  const chartType = useChartStore((s) => s.chartType);
  const setChartType = useChartStore((s) => s.setChartType);
  const indicators = useChartStore((s) => s.indicators);
  const candles = useChartStore((s) => s.candles);

  const tickers = useWatchlistStore((s) => s.tickers);
  const ticker = tickers[activeSymbol];

  const symbolInfo = getSymbolInfo(activeSymbol);
  const currentPrice = ticker?.lastPrice ?? (candles[candles.length - 1]?.close ?? 0);
  const changePercent = ticker?.priceChangePercent ?? -0.76;
  const changeValue = ticker?.priceChange ?? -173.05;
  const isPositive = changePercent >= 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="bg-[#131722] border-b border-[#2a2e39] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left: Market summary header & Active Symbol Information */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Breadcrumb Header */}
        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#d1d4dc] hover:text-white cursor-pointer mr-1">
          <span>Market summary</span>
          <ChevronRight size={14} className="text-[#787b86]" />
        </div>

        {/* Round Badge */}
        <button
          onClick={onOpenSymbolPicker}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
          title="Click to search / change symbol (Ctrl+K)"
        >
          <div className="shrink-0 flex items-center justify-center drop-shadow transition-transform group-hover:scale-105">
            <AssetIcon symbol={activeSymbol} size={32} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                {symbolInfo.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e222d] text-[#787b86] border border-[#2a2e39]">
                {activeSymbol}
              </span>
              <span className="text-[10px] text-[#787b86] font-mono uppercase hidden md:inline">
                • {symbolInfo.category === 'Index' ? 'NSE' : symbolInfo.category === 'Stock' ? 'NSE' : 'BINANCE SPOT'}
              </span>
            </div>

            {/* Price & Change line */}
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-[#f0f3fa]">
                {formatPrice(currentPrice, symbolInfo.pricePrecision)}
              </span>
              <span className="text-[11px] font-mono text-[#787b86]">
                {symbolInfo.category === 'Index' ? 'POINT' : 'USDT'}
              </span>
              <span
                className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%
                <span className="text-[10px] text-[#787b86] ml-0.5 font-normal">
                  ({isPositive ? '+' : ''}
                  {formatPrice(changeValue, symbolInfo.pricePrecision)})
                </span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Right: Timeframe, Chart Type, Indicators & Fullscreen */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Timeframes Bar */}
        <div className="flex items-center gap-0.5 bg-[#1e222d] p-0.5 rounded border border-[#2a2e39]">
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-sm font-semibold'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 hidden sm:block" />

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-0.5 bg-[#1e222d] p-0.5 rounded border border-[#2a2e39]">
          <button
            onClick={() => setChartType('candles')}
            className={`p-1 rounded transition-colors ${
              chartType === 'candles' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
            title="Candlestick Chart"
          >
            <CandlestickChart size={14} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1 rounded transition-colors ${
              chartType === 'line' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
            title="Line Area Chart"
          >
            <LineChart size={14} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[#2a2e39] mx-0.5 hidden md:block" />

        {/* Indicators Trigger */}
        <button
          onClick={onOpenIndicators}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-xs text-[#d1d4dc] font-medium transition-colors"
          title="Configure Technical Indicators"
        >
          <Sliders size={13} className="text-[#2962ff]" />
          <span className="hidden sm:inline">Indicators</span>
          {(indicators.ema.enabled9 || indicators.rsi.enabled || indicators.macd.enabled) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};
