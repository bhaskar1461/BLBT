// src/components/mobile/QuoteDetailView.tsx
'use client';

import React, { useState } from 'react';
import { TerminalHeader } from './TerminalHeader';
import type { Quote, Timeframe } from './types';
import { formatPrice } from '@/lib/utils';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface QuoteDetailViewProps {
  quote: Quote;
  onBack: () => void;
  onLaunchProTerminal: () => void;
}

export const QuoteDetailView: React.FC<QuoteDetailViewProps> = ({
  quote,
  onBack,
  onLaunchProTerminal,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const isPositive = quote.positive;

  // Key data sheet metrics
  const openPrice = quote.open ?? (quote.price * 0.995);
  const prevClose = quote.prevClose ?? (quote.price * (1 - quote.percent / 100));
  const highPrice = quote.high ?? (quote.price * 1.012);
  const lowPrice = quote.low ?? (quote.price * 0.988);
  const volumeStr = quote.volume ?? '42.8M';

  const handleExecuteTrade = (side: 'BUY' | 'SELL') => {
    setOrderNotice(`Filled ${side} 0.5 ${quote.symbol} @ $${formatPrice(quote.price, 2)} (Fee: 0.10%)`);
    setTimeout(() => {
      setOrderNotice(null);
    }, 3500);
  };

  // Generate smooth chart coordinates based on timeframe
  const chartPoints = isPositive
    ? [0.8, 0.7, 0.75, 0.48, 0.58, 0.32, 0.45, 0.18, 0.25]
    : [0.2, 0.35, 0.25, 0.52, 0.42, 0.6, 0.5, 0.74, 0.68];

  const svgW = 340;
  const svgH = 170;
  const strokeColor = isPositive ? '#00c176' : '#ff4d4f';
  const fillColor = isPositive ? 'rgba(0, 193, 118, 0.12)' : 'rgba(255, 77, 79, 0.12)';

  const coords = chartPoints.map((pt, idx) => {
    const x = (idx / (chartPoints.length - 1)) * (svgW - 20) + 10;
    const y = pt * (svgH - 30) + 15;
    return { x, y };
  });

  const linePath = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${svgH} L ${coords[0].x.toFixed(1)} ${svgH} Z`;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none pb-28">
      {/* Pinned Header with Back Chevron */}
      <TerminalHeader
        title={quote.symbol}
        subtitle={quote.name.toUpperCase()}
        showBack
        onBack={onBack}
        onSearchClick={onBack}
      />

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Price & Name Headline */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#8e95a5] font-medium">
              {quote.name}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#181f2b] text-[#8e95a5] border border-[#263145]">
              {quote.category === 'india' ? 'NSE SPOT' : 'SPOT FEED'}
            </span>
          </div>

          <div className="font-mono text-[34px] font-extrabold tracking-tight text-white tabular-nums leading-none mt-1">
            {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(quote.price, 2)}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`font-mono text-[13px] font-bold px-2 py-0.5 rounded-[5px] tabular-nums ${
                isPositive
                  ? 'bg-[#00c176]/15 text-[#00c176]'
                  : 'bg-[#ff4d4f]/15 text-[#ff4d4f]'
              }`}
            >
              {isPositive ? '+' : ''}{quote.change >= 0 ? quote.change.toFixed(2) : quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.percent.toFixed(2)}%)
            </span>
            <span className="text-[11px] text-[#5c6475] font-mono">Today</span>
          </div>
        </div>

        {/* Vector Line Graph with Gradient fill */}
        <div className="w-full h-[190px] bg-[#0c0e14] border border-[#1b2230] rounded-2xl p-3 flex items-center justify-center relative overflow-hidden shadow-inner">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${svgW} ${svgH}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#chartGradient)" />
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Timeframe Selector Pills (1D, 1W, 1M, 3M, 1Y, 5Y) */}
        <div className="flex items-center justify-between gap-1.5 px-1">
          {timeframes.map((tf) => {
            const isActive = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`flex-1 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ff8800] text-black shadow-[0_0_8px_rgba(255,136,0,0.3)]'
                    : 'text-[#8e95a5] hover:text-white hover:bg-[#141924]'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Trade Execution Feedback Alert */}
        {orderNotice && (
          <div className="p-3 bg-[#00c176]/15 border border-[#00c176]/40 rounded-xl flex items-center gap-2 text-xs font-mono text-[#00c176] animate-in fade-in duration-200">
            <CheckCircle size={15} />
            <span>{orderNotice}</span>
          </div>
        )}

        {/* Quick Paper Trading Buy & Sell Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExecuteTrade('BUY')}
            className="py-3.5 bg-[#00c176] hover:bg-[#00ad6a] active:scale-[0.98] text-white font-extrabold text-[14px] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00c176]/20"
          >
            BUY / LONG
          </button>
          <button
            onClick={() => handleExecuteTrade('SELL')}
            className="py-3.5 bg-[#ff4d4f] hover:bg-[#e03b3d] active:scale-[0.98] text-white font-extrabold text-[14px] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#ff4d4f]/20"
          >
            SELL / SHORT
          </button>
        </div>

        {/* Section: KEY DATA */}
        <section className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-extrabold tracking-[1px] text-[#8e95a5] uppercase">
              KEY DATA
            </h3>
            <span className="text-[11px] text-[#5c6475] font-mono">FINANCIAL STATS</span>
          </div>

          <div className="bg-[#0e1118] border border-[#1b2230] rounded-xl p-4 divide-y divide-[#181d28]/70 text-[13px]">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#8e95a5]">Open</span>
              <span className="font-mono font-semibold text-white">
                ${formatPrice(openPrice, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#8e95a5]">Previous Close</span>
              <span className="font-mono font-semibold text-white">
                ${formatPrice(prevClose, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#8e95a5]">Day Range</span>
              <span className="font-mono font-semibold text-white">
                ${formatPrice(lowPrice, 2)} — ${formatPrice(highPrice, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#8e95a5]">Volume</span>
              <span className="font-mono font-semibold text-white">{volumeStr}</span>
            </div>
          </div>
        </section>

        {/* Launch Pro Candlestick Terminal Button */}
        <button
          onClick={onLaunchProTerminal}
          className="w-full py-3 bg-[#151a24] hover:bg-[#1c2331] border border-[#273247] text-[#d1d5db] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors mt-1"
        >
          <ExternalLink size={14} className="text-[#ff8800]" />
          <span>Launch Full Candlestick Terminal</span>
        </button>
      </div>
    </div>
  );
};
