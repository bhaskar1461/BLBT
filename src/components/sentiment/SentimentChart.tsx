'use client';

import React, { useState } from 'react';
import type { SentimentTimeSeriesPoint } from '@/lib/sentimentService';
import { formatPrice } from '@/lib/utils';

interface SentimentChartProps {
  data: SentimentTimeSeriesPoint[];
  symbol: string;
}

export function SentimentChart({ data, symbol }: SentimentChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-faint">
        No time-series data available
      </div>
    );
  }

  const width = 800;
  const height = 280;
  const padX = 40;
  const padY = 30;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  const pointsCount = data.length;
  const stepX = (width - padX * 2) / (pointsCount - 1);

  // Price line coords
  const pricePoints = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((d.price - minPrice) / (maxPrice - minPrice)) * (height - padY * 2);
    return { x, y, data: d };
  });

  // Sentiment coords (0% to 100% mapped onto height)
  const sentimentPoints = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((d.longPct - 20) / 70) * (height - padY * 2);
    return { x, y, data: d };
  });

  const pricePathD = pricePoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const sentimentPathD = sentimentPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="space-y-3">
      {/* Chart Legend & Live Inspector */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-canvas/60 p-3 rounded-xl border border-subtle">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-faint">Market Price:</span>
            <span className="text-white font-bold">${formatPrice(activePoint.price, 2)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-bull" />
            <span className="text-faint">Retail Longs:</span>
            <span className="text-bull font-bold">{activePoint.longPct}%</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-bear" />
            <span className="text-faint">Retail Shorts:</span>
            <span className="text-bear font-bold">{activePoint.shortPct}%</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-faint">
          {new Date(activePoint.time).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden relative rounded-xl border border-subtle bg-canvas/40 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Background Grid Lines */}
          <line
            x1={padX}
            y1={padY}
            x2={width - padX}
            y2={padY}
            stroke="currentColor"
            className="text-subtle/40"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={height / 2}
            x2={width - padX}
            y2={height / 2}
            stroke="currentColor"
            className="text-subtle/40"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="currentColor"
            className="text-subtle/40"
            strokeDasharray="4 4"
          />

          {/* 50% Neutral Baseline */}
          <line
            x1={padX}
            y1={height - padY - ((50 - 20) / 70) * (height - padY * 2)}
            x2={width - padX}
            y2={height - padY - ((50 - 20) / 70) * (height - padY * 2)}
            stroke="#4b5563"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={width - padX + 5}
            y={height - padY - ((50 - 20) / 70) * (height - padY * 2) + 4}
            fill="#6b7280"
            fontSize="9"
            fontFamily="monospace"
          >
            50%
          </text>

          {/* Retail Long Sentiment Path (Green/Red Gradient) */}
          <path
            d={sentimentPathD}
            fill="none"
            stroke="#00f090"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Price Path (Primary Orange) */}
          <path
            d={pricePathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeDasharray="5 2"
            strokeLinecap="round"
          />

          {/* Interactive Hover Nodes */}
          {sentimentPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5 : 3}
              fill={hoverIndex === idx ? '#00f090' : 'transparent'}
              stroke={hoverIndex === idx ? '#ffffff' : 'transparent'}
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(idx)}
            />
          ))}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={padX + hoverIndex * stepX}
              y1={padY}
              x2={padX + hoverIndex * stepX}
              y2={height - padY}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
