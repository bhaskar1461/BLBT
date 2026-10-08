'use client';

import React, { useState } from 'react';
import type { EquityPoint } from '@/lib/backtestService';
import { formatPrice } from '@/lib/utils';

interface BacktestEquityChartProps {
  data: EquityPoint[];
  symbol: string;
}

export function BacktestEquityChart({ data, symbol }: BacktestEquityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-faint">
        No equity curve data available
      </div>
    );
  }

  const width = 800;
  const height = 300;
  const padX = 50;
  const padY = 30;

  const strategyValues = data.map((d) => d.equity);
  const benchmarkValues = data.map((d) => d.benchmarkEquity);
  const allValues = [...strategyValues, ...benchmarkValues];

  const minVal = Math.min(...allValues) * 0.98;
  const maxVal = Math.max(...allValues) * 1.02;
  const valRange = maxVal - minVal || 1;

  const pointsCount = data.length;
  const stepX = (width - padX * 2) / (pointsCount - 1);

  // Strategy Line Coords
  const strategyPoints = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((d.equity - minVal) / valRange) * (height - padY * 2);
    return { x, y, data: d };
  });

  // Benchmark Line Coords
  const benchmarkPoints = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((d.benchmarkEquity - minVal) / valRange) * (height - padY * 2);
    return { x, y, data: d };
  });

  const strategyPathD = strategyPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const benchmarkPathD = benchmarkPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  // Area under strategy curve
  const firstPoint = strategyPoints[0];
  const lastPoint = strategyPoints[strategyPoints.length - 1];
  const strategyAreaD = `${strategyPathD} L ${lastPoint.x} ${height - padY} L ${firstPoint.x} ${height - padY} Z`;

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];
  const activeStrategyPt = hoverIndex !== null ? strategyPoints[hoverIndex] : strategyPoints[strategyPoints.length - 1];
  const activeBenchmarkPt = hoverIndex !== null ? benchmarkPoints[hoverIndex] : benchmarkPoints[benchmarkPoints.length - 1];

  const initialCapital = data[0]?.equity || 10000;
  const finalStrategy = activePoint.equity;
  const finalBenchmark = activePoint.benchmarkEquity;
  const strategyReturn = ((finalStrategy - initialCapital) / initialCapital) * 100;
  const benchmarkReturn = ((finalBenchmark - initialCapital) / initialCapital) * 100;
  const alpha = strategyReturn - benchmarkReturn;

  const baseAsset = symbol.replace('USDT', '');

  return (
    <div className="bg-panel border border-subtle rounded-xl p-5 space-y-4">
      {/* Chart Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted">
              Equity Curve vs Buy-and-Hold
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-xl sm:text-2xl font-bold text-white">
              ${formatPrice(activePoint.equity)}
            </div>
            <div
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                strategyReturn >= 0
                  ? 'bg-bull/10 text-bull border border-bull/20'
                  : 'bg-bear/10 text-bear border border-bear/20'
              }`}
            >
              {strategyReturn >= 0 ? '+' : ''}
              {strategyReturn.toFixed(2)}%
            </div>
            <div className="text-xs font-mono text-muted">
              Drawdown: <span className="text-bear">-{activePoint.drawdownPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-muted">Strategy Equity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-muted">{baseAsset} Buy-and-Hold</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) * (width / rect.width);
            const clampedX = Math.max(padX, Math.min(width - padX, relX));
            const idx = Math.round((clampedX - padX) / stepX);
            if (idx >= 0 && idx < data.length) {
              setHoverIndex(idx);
            }
          }}
        >
          <defs>
            <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padX}
            y1={padY}
            x2={width - padX}
            y2={padY}
            stroke="#ffffff"
            strokeOpacity="0.06"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={height / 2}
            x2={width - padX}
            y2={height / 2}
            stroke="#ffffff"
            strokeOpacity="0.06"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="#ffffff"
            strokeOpacity="0.08"
          />

          {/* Y Axis Labels */}
          <text
            x={padX - 8}
            y={padY + 4}
            fill="#71717a"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
          >
            ${formatPrice(maxVal)}
          </text>
          <text
            x={padX - 8}
            y={height / 2 + 3}
            fill="#71717a"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
          >
            ${formatPrice((maxVal + minVal) / 2)}
          </text>
          <text
            x={padX - 8}
            y={height - padY + 3}
            fill="#71717a"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
          >
            ${formatPrice(minVal)}
          </text>

          {/* Strategy Fill Area */}
          <path d={strategyAreaD} fill="url(#strategyGrad)" />

          {/* Benchmark Buy-and-Hold Line (Cyan) */}
          <path
            d={benchmarkPathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.75"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Strategy Equity Line (Emerald) */}
          <path
            d={strategyPathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Hover Crosshair & Dots */}
          {activeStrategyPt && (
            <g>
              <line
                x1={activeStrategyPt.x}
                y1={padY}
                x2={activeStrategyPt.x}
                y2={height - padY}
                stroke="#ffffff"
                strokeOpacity="0.25"
                strokeDasharray="2 2"
              />
              {/* Benchmark Dot */}
              <circle
                cx={activeBenchmarkPt.x}
                cy={activeBenchmarkPt.y}
                r="4"
                fill="#22d3ee"
                stroke="#090a0f"
                strokeWidth="2"
              />
              {/* Strategy Dot */}
              <circle
                cx={activeStrategyPt.x}
                cy={activeStrategyPt.y}
                r="5"
                fill="#10b981"
                stroke="#090a0f"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {activePoint && hoverIndex !== null && (
          <div className="mt-3 p-3 bg-panel/90 border border-subtle rounded-lg flex flex-wrap items-center justify-between text-xs font-mono gap-3">
            <span className="text-white font-bold">{activePoint.dateStr}</span>
            <span className="text-emerald-400">
              Strategy: ${formatPrice(activePoint.equity)} ({strategyReturn >= 0 ? '+' : ''}
              {strategyReturn.toFixed(2)}%)
            </span>
            <span className="text-cyan-400">
              Buy & Hold: ${formatPrice(activePoint.benchmarkEquity)} ({benchmarkReturn >= 0 ? '+' : ''}
              {benchmarkReturn.toFixed(2)}%)
            </span>
            <span className={alpha >= 0 ? 'text-bull font-bold' : 'text-bear font-bold'}>
              Alpha: {alpha >= 0 ? '+' : ''}
              {alpha.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-faint">
        <span>Start: {data[0]?.dateStr}</span>
        <span className="italic">Standard 0.10% fee deducted on every simulated transaction</span>
        <span>End: {data[data.length - 1]?.dateStr}</span>
      </div>
    </div>
  );
}
