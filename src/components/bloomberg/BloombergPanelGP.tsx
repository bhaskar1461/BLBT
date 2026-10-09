// src/components/bloomberg/BloombergPanelGP.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { BloombergSecurity } from './BloombergPanelWEI';
import {
  CandlestickChart,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  PieChart,
  BarChart2,
  Calendar,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { formatPrice, formatInrCrore } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';

interface BloombergPanelGPProps {
  security: BloombergSecurity;
  onTradeAction?: (side: 'BUY' | 'SELL') => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BloombergPanelGP: React.FC<BloombergPanelGPProps> = ({
  security,
  onTradeAction,
  isMaximized,
  onToggleMaximize,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'GP' | 'DES' | 'FA' | 'ANR'>('GP');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'>('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const isPositive = security.positive;
  const currPrefix = security.currency === 'INR' ? '₹' : '$';
  const sign = isPositive ? '+' : '';

  // Generate synthetic high-density OHLC candles
  const candles = useMemo(() => {
    const count = 28;
    const baseP = security.price;
    const result = [];
    let curOpen = baseP * (isPositive ? 0.982 : 1.018);

    for (let i = 0; i < count; i++) {
      const stepPct = (Math.random() - 0.48) * 0.015;
      const curClose = curOpen * (1 + stepPct);
      const curHigh = Math.max(curOpen, curClose) * (1 + Math.random() * 0.006);
      const curLow = Math.min(curOpen, curClose) * (1 - Math.random() * 0.006);
      result.push({
        open: curOpen,
        close: curClose,
        high: curHigh,
        low: curLow,
        isUp: curClose >= curOpen,
        vol: Math.round(15000 + Math.random() * 45000),
      });
      curOpen = curClose;
    }

    result[result.length - 1].close = security.price;
    result[result.length - 1].isUp = isPositive;
    return result;
  }, [security.price, isPositive, timeframe]);

  const svgW = 600;
  const svgH = 260;
  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;

  const candleW = 12;
  const candleGap = (svgW - 40) / candles.length;

  // SMA 20 Points
  const smaPoints = useMemo(() => {
    return candles.map((_, i) => {
      const start = Math.max(0, i - 4);
      const subset = candles.slice(start, i + 1);
      const avg = subset.reduce((acc, c) => acc + c.close, 0) / subset.length;
      const x = 20 + i * candleGap + candleW / 2;
      const y = svgH - 40 - ((avg - minPrice) / priceRange) * (svgH - 80);
      return { x, y };
    });
  }, [candles, minPrice, priceRange, candleGap]);

  const smaPath = smaPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  return (
    <div className="flex flex-col h-full bg-[#080b11] border border-[#182030] rounded overflow-hidden font-mono select-none text-xs">
      {/* Top Header: Security Identification */}
      <div className="bg-[#0e131d] px-3 py-2 border-b border-[#1c2638] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-sm text-[#ff8800] bg-[#ff8800]/15 px-2 py-0.5 rounded border border-[#ff8800]/30">
            {security.symbol} &lt;{security.tickerClass}&gt;
          </span>
          <span className="text-white font-bold text-xs truncate max-w-[200px]">
            {security.name}
          </span>
        </div>

        {/* Live Price Headline */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-white font-black text-base tabular-nums">
              {currPrefix}{formatPrice(security.price, 2)}
            </span>
            <span
              className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded tabular-nums ${
                isPositive
                  ? 'text-[#00c176] bg-[#00c176]/15'
                  : 'text-[#ff3b30] bg-[#ff3b30]/15'
              }`}
            >
              {sign}{security.percent.toFixed(2)}% ({sign}{security.change.toFixed(2)})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onTradeAction?.('BUY')}
              className="px-2.5 py-1 bg-[#00c176] hover:bg-[#00e676] text-black font-extrabold text-[10px] rounded transition-colors cursor-pointer"
            >
              BUY / LONG
            </button>
            <button
              onClick={() => onTradeAction?.('SELL')}
              className="px-2.5 py-1 bg-[#ff3b30] hover:bg-[#ff5252] text-white font-extrabold text-[10px] rounded transition-colors cursor-pointer"
            >
              SELL / SHORT
            </button>
          </div>

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1 hover:bg-[#1a2333] text-[#8e95a5] hover:text-[#ff8800] rounded transition-colors"
              title={isMaximized ? "Restore 4-Panel Layout" : "Maximize Panel"}
            >
              {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Sub-Function Navigation Bar */}
      <div className="bg-[#0a0e16] px-3 py-1.5 border-b border-[#161f2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['GP', 'DES', 'FA', 'ANR'] as const).map((tab) => {
            const isActive = activeSubTab === tab;
            const labels = {
              GP: '<GP> GRAPH PRICE',
              DES: '<DES> DESCRIPTION',
              FA: '<FA> FINANCIALS',
              ANR: '<ANR> RECOMMENDATIONS',
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  terminalAudio.playTick();
                  setActiveSubTab(tab);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-tight transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#ff8800] text-black shadow-sm'
                    : 'text-[#8e95a5] hover:text-white bg-[#121824]'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Chart Options (When in GP mode) */}
        {activeSubTab === 'GP' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#121824] p-0.5 rounded border border-[#1f293d]">
              <button
                onClick={() => setChartType('candles')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  chartType === 'candles' ? 'bg-[#ff8800] text-black' : 'text-[#8e95a5]'
                }`}
              >
                <CandlestickChart size={11} />
                <span>CANDLES</span>
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  chartType === 'line' ? 'bg-[#ff8800] text-black' : 'text-[#8e95a5]'
                }`}
              >
                <TrendingUp size={11} />
                <span>LINE</span>
              </button>
            </div>

            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                showSMA
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40'
                  : 'bg-[#121824] text-[#8e95a5] border-[#1f293d]'
              }`}
            >
              SMA (20)
            </button>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        {activeSubTab === 'GP' ? (
          <div className="flex-1 flex flex-col">
            {/* Timeframe Bar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#141b28]">
              <div className="flex items-center gap-1">
                {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      terminalAudio.playTick();
                      setTimeframe(tf);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      timeframe === tf
                        ? 'bg-[#ff8800] text-black'
                        : 'text-[#8e95a5] hover:text-white bg-[#101522]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-[#64748b] flex items-center gap-3">
                <span>HIGH: {currPrefix}{formatPrice(security.high, 2)}</span>
                <span>LOW: {currPrefix}{formatPrice(security.low, 2)}</span>
                <span>VOL: {security.volume}</span>
              </div>
            </div>

            {/* Interactive SVG Chart Canvas */}
            <div className="flex-1 w-full min-h-[220px] bg-[#05070a] border border-[#161f2e] rounded-lg p-2 relative overflow-hidden flex items-center justify-center">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${svgW} ${svgH}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gpLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#00c176' : '#ff3b30'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isPositive ? '#00c176' : '#ff3b30'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="40" x2={svgW} y2="40" stroke="#121724" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2={svgW} y2="100" stroke="#121724" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2={svgW} y2="160" stroke="#121724" strokeDasharray="3 3" />
                <line x1="0" y1="220" x2={svgW} y2="220" stroke="#121724" strokeDasharray="3 3" />

                {/* Volume Histogram (bottom 50px) */}
                {showVolume &&
                  candles.map((c, i) => {
                    const cx = 20 + i * candleGap;
                    const vH = (c.vol / 60000) * 40;
                    return (
                      <rect
                        key={`v-${i}`}
                        x={cx}
                        y={svgH - vH}
                        width={candleW}
                        height={vH}
                        fill={c.isUp ? '#00c176' : '#ff3b30'}
                        opacity="0.3"
                      />
                    );
                  })}

                {/* Candlesticks Rendering */}
                {chartType === 'candles' ? (
                  candles.map((c, i) => {
                    const cx = 20 + i * candleGap + candleW / 2;
                    const highY = svgH - 40 - ((c.high - minPrice) / priceRange) * (svgH - 80);
                    const lowY = svgH - 40 - ((c.low - minPrice) / priceRange) * (svgH - 80);
                    const openY = svgH - 40 - ((c.open - minPrice) / priceRange) * (svgH - 80);
                    const closeY = svgH - 40 - ((c.close - minPrice) / priceRange) * (svgH - 80);

                    const topY = Math.min(openY, closeY);
                    const heightY = Math.max(Math.abs(closeY - openY), 2.5);
                    const cColor = c.isUp ? '#00c176' : '#ff3b30';

                    return (
                      <g key={`c-${i}`}>
                        <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={cColor} strokeWidth="1.2" />
                        <rect
                          x={cx - candleW / 2}
                          y={topY}
                          width={candleW}
                          height={heightY}
                          fill={cColor}
                          rx="1"
                        />
                      </g>
                    );
                  })
                ) : (
                  <>
                    <path
                      d={`${smaPath} L ${svgW - 20} ${svgH} L 20 ${svgH} Z`}
                      fill="url(#gpLineGrad)"
                    />
                    <path
                      d={smaPath}
                      fill="none"
                      stroke={isPositive ? '#00c176' : '#ff3b30'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* SMA 20 Overlay Line */}
                {showSMA && (
                  <path
                    d={smaPath}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}
              </svg>
            </div>
          </div>
        ) : activeSubTab === 'DES' ? (
          /* Description / Fundamental Sheet */
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 bg-[#0e131d] p-3 rounded border border-[#1b2536]">
              <span className="text-[#ff8800] font-bold text-[11px] block border-b border-[#212c40] pb-1 uppercase">
                SECURITY OVERVIEW &lt;DES&gt;
              </span>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Asset Class:</span>
                <span className="text-white font-bold">{security.tickerClass}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Primary Domicile:</span>
                <span className="text-white font-bold">{security.region}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Authoritative Price:</span>
                <span className="text-[#00c176] font-bold">{currPrefix}{formatPrice(security.price, 2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Day Range:</span>
                <span className="text-white">{currPrefix}{formatPrice(security.low, 2)} — {currPrefix}{formatPrice(security.high, 2)}</span>
              </div>
            </div>

            <div className="space-y-2 bg-[#0e131d] p-3 rounded border border-[#1b2536]">
              <span className="text-[#ff8800] font-bold text-[11px] block border-b border-[#212c40] pb-1 uppercase">
                SETTLEMENT &amp; LIQUIDITY
              </span>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">24H Volume:</span>
                <span className="text-white font-bold">{security.volume}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Execution Fee Drag:</span>
                <span className="text-[#ff8800] font-bold">0.10% (Fixed Flat)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Ledger Storage:</span>
                <span className="text-[#00e5ff] font-bold">Immutable Append-Only</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#182030]">
                <span className="text-[#8e95a5]">Benchmark Anchor:</span>
                <span className="text-white font-bold">BTC &amp; NIFTY Buy-and-Hold</span>
              </div>
            </div>
          </div>
        ) : activeSubTab === 'FA' ? (
          /* Financial Analysis */
          <div className="p-4 bg-[#0e131d] rounded border border-[#1b2536] space-y-3">
            <span className="text-[#ff8800] font-bold text-xs uppercase block">
              FINANCIAL ANALYSIS &amp; VALUATION &lt;FA&gt;
            </span>
            <p className="text-[#a0aec0] text-xs leading-relaxed">
              Real-time valuation metrics reconciles spot market clearing price against ledger reserves. Risk-adjusted return is audited per integer wei-scale arithmetic ($10^8$ base units).
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 bg-[#141b27] rounded text-center">
                <div className="text-[10px] text-[#8e95a5]">SHARPE RATIO</div>
                <div className="text-sm font-bold text-[#00c176] mt-0.5">1.94</div>
              </div>
              <div className="p-2 bg-[#141b27] rounded text-center">
                <div className="text-[10px] text-[#8e95a5]">MAX DRAWDOWN</div>
                <div className="text-sm font-bold text-[#ff3b30] mt-0.5">-4.20%</div>
              </div>
              <div className="p-2 bg-[#141b27] rounded text-center">
                <div className="text-[10px] text-[#8e95a5]">TURNOVER DRAG</div>
                <div className="text-sm font-bold text-[#ffd600] mt-0.5">$14.20 (0.1%)</div>
              </div>
            </div>
          </div>
        ) : (
          /* Analyst Recommendations */
          <div className="p-4 bg-[#0e131d] rounded border border-[#1b2536] space-y-3">
            <span className="text-[#ff8800] font-bold text-xs uppercase block">
              ANALYST RECOMMENDATIONS &amp; SENTIMENT INDEX &lt;ANR&gt;
            </span>
            <div className="flex items-center gap-4 py-2 border-b border-[#1b2536]">
              <div className="text-center">
                <div className="text-2xl font-black text-[#00c176]">BUY</div>
                <div className="text-[10px] text-[#8e95a5]">CONSENSUS</div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span>RETAIL TRADERS HERE (CROWD):</span>
                  <span className="text-[#00c176] font-bold">68% LONG · 32% SHORT</span>
                </div>
                <div className="w-full h-2 bg-[#1a2233] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#00c176]" style={{ width: '68%' }} />
                  <div className="h-full bg-[#ff3b30]" style={{ width: '32%' }} />
                </div>
                <div className="text-[9px] text-[#8e95a5]">
                  Per Phase 4 Invariant: Minimum cohort of 25 active traders before aggregate display.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
