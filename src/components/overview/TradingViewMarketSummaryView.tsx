'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ExternalLink,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Maximize2,
  BarChart2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { getSymbolInfo, formatPrice } from '@/services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';

interface TradingViewMarketSummaryViewProps {
  onSwitchToSupercharts: () => void;
  onOpenSymbolPicker?: () => void;
}

export const TradingViewMarketSummaryView: React.FC<TradingViewMarketSummaryViewProps> = ({
  onSwitchToSupercharts,
  onOpenSymbolPicker,
}) => {
  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);
  const candles = useChartStore((s) => s.candles);
  const tickers = useWatchlistStore((s) => s.tickers);

  const activeTicker = tickers[activeSymbol];
  const symbolInfo = getSymbolInfo(activeSymbol);

  const currentPrice = activeTicker?.lastPrice ?? (candles[candles.length - 1]?.close ?? (activeSymbol === 'NIFTY' ? 22231.8 : 83270));
  const changePercent = activeTicker?.priceChangePercent ?? (activeSymbol === 'NIFTY' ? -1.64 : 1.73);
  const changeAmount = activeTicker?.priceChange ?? (activeSymbol === 'NIFTY' ? -370.4 : 1420.5);
  const isPositive = changePercent >= 0;

  const [activeRange, setActiveRange] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL'>('1D');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate a realistic, beautiful spline series for Market Summary
  const splinePoints = useMemo(() => {
    if (candles && candles.length >= 20) {
      // Sample 30 points from candles for smooth curve
      const step = Math.max(1, Math.floor(candles.length / 32));
      const sampled = [];
      for (let i = 0; i < candles.length; i += step) {
        sampled.push(candles[i].close);
      }
      return sampled;
    }
    // High-resolution realistic default curve resembling intraday dip and recovery
    const base = currentPrice > 0 ? currentPrice : 22231.8;
    return [
      base * 1.012,
      base * 1.011,
      base * 1.008,
      base * 1.004,
      base * 0.999,
      base * 0.994,
      base * 0.988,
      base * 0.982,
      base * 0.980,
      base * 0.978,
      base * 0.981,
      base * 0.983,
      base * 0.986,
      base * 0.989,
      base * 0.991,
      base * 0.988,
      base * 0.985,
      base * 0.982,
      base * 0.981,
      base * 0.984,
      base * 0.987,
      base * 0.989,
      base * 0.992,
      base * 0.995,
      base * 0.998,
      base * 1.0,
    ];
  }, [candles, currentPrice]);

  const minPrice = Math.min(...splinePoints);
  const maxPrice = Math.max(...splinePoints);
  const priceRange = maxPrice - minPrice || 1;

  const width = 800;
  const height = 240;
  const paddingY = 24;

  // Build SVG path
  const svgCoordinates = splinePoints.map((val, idx) => {
    const x = (idx / (splinePoints.length - 1)) * width;
    const y = height - paddingY - ((val - minPrice) / priceRange) * (height - paddingY * 2);
    return { x, y, val };
  });

  // Smooth SVG cubic Bezier spline
  const linePath = useMemo(() => {
    if (svgCoordinates.length < 2) return '';
    let d = `M ${svgCoordinates[0].x} ${svgCoordinates[0].y}`;
    for (let i = 0; i < svgCoordinates.length - 1; i++) {
      const p0 = svgCoordinates[i === 0 ? 0 : i - 1];
      const p1 = svgCoordinates[i];
      const p2 = svgCoordinates[i + 1];
      const p3 = svgCoordinates[i + 2 < svgCoordinates.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [svgCoordinates]);

  // Area path (closed at the bottom)
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  }, [linePath, width, height]);

  const activeHoverPoint = hoverIndex !== null && svgCoordinates[hoverIndex] ? svgCoordinates[hoverIndex] : null;
  const activeHoverPrice = activeHoverPoint ? activeHoverPoint.val : currentPrice;

  // Handle mouse move over SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const targetIdx = Math.round(ratio * (splinePoints.length - 1));
    setHoverIndex(targetIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const themeColor = isPositive ? '#089981' : '#f23645';
  const gradientId = isPositive ? 'greenAreaGradient' : 'redAreaGradient';

  return (
    <div className="flex-1 overflow-y-auto bg-[#131722] text-[#d1d4dc] p-3 sm:p-5 flex flex-col gap-4 select-none">
      {/* 1. Header: Market Summary Breadcrumb + Switch to Supercharts Button */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>Market summary</span>
            <ChevronRight size={20} className="text-[#787b86]" />
          </h1>
          <span className="text-xs text-[#787b86] font-medium hidden sm:inline">
            Authoritative Binance & Global Spot Feeds
          </span>
        </div>

        {/* 1-Click Switch to Candlestick Supercharts */}
        <button
          onClick={onSwitchToSupercharts}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white font-semibold text-xs transition-all shadow-md shadow-[#2962ff]/25 hover:scale-105 active:scale-95"
          title="Open Full Candlestick Supercharts Terminal"
        >
          <BarChart2 size={15} />
          <span>Supercharts</span>
          <ExternalLink size={12} className="opacity-75" />
        </button>
      </div>

      {/* 2. Vibrant Main Hero Card for Active Symbol (Matches TradingView Screenshot 1!) */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 sm:p-5 relative shadow-xl overflow-hidden group">
        {/* Top Info Bar: Asset Icon, Symbol, Name, Category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2a2e39] shadow-inner shrink-0">
              <AssetIcon symbol={activeSymbol} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {symbolInfo.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#171b26] border border-[#2a2e39] text-[#787b86]">
                  {activeSymbol}
                </span>
              </div>
              <div className="text-xs text-[#787b86] flex items-center gap-1.5 font-medium mt-0.5">
                <span>{symbolInfo.category === 'Index' ? 'Index' : 'Perpetual Spot'}</span>
                <span>•</span>
                <span>{symbolInfo.category === 'Index' ? 'NSE' : 'BINANCE'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#089981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                  Live Feed
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe Buttons: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, ALL */}
          <div className="flex items-center gap-1 bg-[#171b26] p-1 rounded-lg border border-[#2a2e39] self-start sm:self-auto overflow-x-auto max-w-full">
            {(['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'] as const).map((range) => {
              const isActive = activeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2a2e39] text-white shadow-sm font-bold'
                      : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Price Display & Delta Pill */}
        <div className="flex flex-wrap items-baseline gap-2.5 mb-4">
          <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatPrice(activeHoverPrice, symbolInfo.pricePrecision)}
          </span>
          <span className="text-xs font-mono font-bold text-[#787b86] uppercase">
            {symbolInfo.category === 'Index' ? 'POINT' : 'USDT'}
          </span>
          <span
            className={`font-mono text-xs sm:text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              isPositive ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
            }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            <span>({isPositive ? '+' : ''}{formatPrice(changeAmount, symbolInfo.pricePrecision)})</span>
          </span>
        </div>

        {/* ======================================================== */}
        {/* Vibrant Glowing Spline Area Chart (Screenshot 1 Parity)   */}
        {/* ======================================================== */}
        <div className="relative w-full h-[220px] sm:h-[260px] overflow-hidden cursor-crosshair">
          {/* Dynamic Floating Crosshair Pill (Matching: 22,207.95 | 08 Oct '26 | 14:11 UTC+5:30) */}
          {activeHoverPoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-[#171b26]/95 backdrop-blur-md border border-[#2a2e39] text-[#f0f3fa] px-2.5 py-1 rounded-md shadow-2xl text-[11px] font-mono flex items-center gap-2"
              style={{
                left: `${(activeHoverPoint.x / width) * 100}%`,
                top: '10px',
              }}
            >
              <span className="font-bold text-white">
                {formatPrice(activeHoverPoint.val, symbolInfo.pricePrecision)}
              </span>
              <span className="text-[#787b86]">•</span>
              <span className="text-[#787b86]">08 Oct '26</span>
              <span className="text-[#787b86]">14:11 UTC+5:30</span>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Rich Vibrant Gradient Fill (Fades downwards) */}
              <linearGradient id="redAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f23645" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#f23645" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f23645" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="greenAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#089981" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#089981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#089981" stopOpacity="0.00" />
              </linearGradient>

              {/* Glowing Neon Drop Shadow Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Grid Guidelines */}
            <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#2a2e39" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#2a2e39" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#2a2e39" strokeDasharray="3 3" strokeOpacity="0.4" />

            {/* Gradient Area Fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Glowing Neon Spline Line */}
            <path
              d={linePath}
              fill="none"
              stroke={themeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neonGlow)"
            />

            {/* Hover Vertical Crosshair Line & Target Dot */}
            {activeHoverPoint && (
              <>
                <line
                  x1={activeHoverPoint.x}
                  y1={0}
                  x2={activeHoverPoint.x}
                  y2={height}
                  stroke="#787b86"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activeHoverPoint.x}
                  cy={activeHoverPoint.y}
                  r="5"
                  fill="#ffffff"
                  stroke={themeColor}
                  strokeWidth="2.5"
                />
              </>
            )}
          </svg>
        </div>

        {/* Time Scale Marks along bottom */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#787b86] pt-2 border-t border-[#2a2e39]/60">
          <span>09:30</span>
          <span>10:30</span>
          <span>11:30</span>
          <span>12:30</span>
          <span>13:30</span>
          <span>14:30</span>
          <span>15:30</span>
        </div>
      </div>

      {/* 3. Bottom Row: 2 Complementary Overview Cards (Major Indices & Crypto Market Cap TOTAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card A: Major Indices (Sensex, S&P 500, Nasdaq) */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Major indices</span>
              <ChevronRight size={15} className="text-[#787b86]" />
            </div>
            <span className="text-[11px] text-[#787b86] font-mono">BSE • NSE • US</span>
          </div>

          <div className="divide-y divide-[#2a2e39]/60">
            {/* Sensex */}
            <button
              onClick={() => setActiveSymbol('SENSEX')}
              className="w-full py-2.5 flex items-center justify-between hover:bg-[#2a2e39]/30 rounded px-2 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-900/40 text-cyan-400 font-bold text-xs flex items-center justify-center">
                  S
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                    SENSEX
                  </div>
                  <div className="text-[10px] text-[#787b86]">BSE • Index</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-white">72,638.70</div>
                <div className="text-[11px] font-semibold text-[#f23645]">-1.82%</div>
              </div>
            </button>

            {/* S&P 500 */}
            <button
              onClick={() => setActiveSymbol('SPX')}
              className="w-full py-2.5 flex items-center justify-between hover:bg-[#2a2e39]/30 rounded px-2 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-900/40 text-blue-400 font-bold text-xs flex items-center justify-center">
                  SP
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                    S&P 500
                  </div>
                  <div className="text-[10px] text-[#787b86]">Standard & Poor's</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-white">7,801.61</div>
                <div className="text-[11px] font-semibold text-[#f23645]">-0.42%</div>
              </div>
            </button>

            {/* Nifty 50 */}
            <button
              onClick={() => setActiveSymbol('NIFTY')}
              className="w-full py-2.5 flex items-center justify-between hover:bg-[#2a2e39]/30 rounded px-2 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-900/40 text-purple-400 font-bold text-xs flex items-center justify-center">
                  50
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                    NIFTY 50
                  </div>
                  <div className="text-[10px] text-[#787b86]">NSE • National Stock Exchange</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-white">22,231.80</div>
                <div className="text-[11px] font-semibold text-[#f23645]">-1.64%</div>
              </div>
            </button>
          </div>
        </div>

        {/* Card B: Crypto Market Cap TOTAL & Dominance (OpenTerminal + TradingView) */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Crypto market cap TOTAL</span>
                <ChevronRight size={15} className="text-[#787b86]" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#089981]/15 text-[#089981]">
                +3.89% 24h
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-mono text-2xl font-black text-white">2.77 T</span>
              <span className="text-xs font-mono text-[#787b86]">USD</span>
            </div>

            {/* Bitcoin & Ethereum Dominance Progress Bars */}
            <div className="space-y-2 mb-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#787b86] mb-1">
                  <span className="text-white font-medium">Bitcoin dominance (BTC.D)</span>
                  <span className="text-orange-400 font-bold">59.63%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: '59.63%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#787b86] mb-1">
                  <span className="text-white font-medium">Ethereum dominance (ETH.D)</span>
                  <span className="text-blue-400 font-bold">16.42%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171b26] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '16.42%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Crypto Movers */}
          <div className="pt-2 border-t border-[#2a2e39]/60 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => setActiveSymbol('BTCUSDT')}
              className="hover:text-white transition-colors"
            >
              <span className="text-[#787b86]">BTC:</span> <span className="text-white font-bold">$83,270</span> <span className="text-[#089981] font-semibold">+1.7%</span>
            </button>
            <button
              onClick={() => setActiveSymbol('ETHUSDT')}
              className="hover:text-white transition-colors"
            >
              <span className="text-[#787b86]">ETH:</span> <span className="text-white font-bold">$3,420</span> <span className="text-[#089981] font-semibold">+3.1%</span>
            </button>
            <button
              onClick={() => setActiveSymbol('SOLUSDT')}
              className="hover:text-white transition-colors hidden sm:inline"
            >
              <span className="text-[#787b86]">SOL:</span> <span className="text-white font-bold">$208.5</span> <span className="text-[#089981] font-semibold">+5.5%</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
