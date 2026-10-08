// src/components/mobile/MiniSparkline.tsx
'use client';

import React from 'react';

interface MiniSparklineProps {
  positive: boolean;
  points?: number[];
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  positive,
  points,
  width = 58,
  height = 24,
  strokeWidth = 1.6,
  className = '',
}) => {
  // Default points matching SwiftUI QuoteRow.swift MiniSparkline implementation
  const defaultPoints = positive
    ? [0.8, 0.65, 0.7, 0.45, 0.5, 0.25, 0.35, 0.15]
    : [0.2, 0.35, 0.3, 0.55, 0.5, 0.75, 0.65, 0.85];

  const data = points && points.length > 1 ? points : defaultPoints;
  const strokeColor = positive ? '#00c176' : '#ff4d4f';

  // SVG viewBox coordinates
  const svgWidth = 60;
  const svgHeight = 24;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const coords = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (svgWidth - 4) + 2;
    // Normalized y-scale between 3 and 21 px (with 3px padding)
    const norm = points ? (val - minVal) / range : val;
    // Note: if using default normalized points, 0 is top, 1 is bottom
    const y = points
      ? svgHeight - 3 - norm * (svgHeight - 6)
      : norm * (svgHeight - 6) + 3;
    return { x, y };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
