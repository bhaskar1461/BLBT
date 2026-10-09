// src/components/mobile/QuoteDetailView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TerminalHeader } from './TerminalHeader';
import type { Quote, Timeframe } from './types';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, CandlestickChart, TrendingUp, ShieldAlert } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface QuoteDetailViewProps {
  quote: Quote;
  onBack: () => void;
}

export const QuoteDetailView: React.FC<QuoteDetailViewProps> = ({
  quote,
  onBack,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [chartMode, setChartMode] = useState<'line' | 'candles'>('candles');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const isPositive = quote.positive;

  // Key data sheet metrics
  const openPrice = quote.open ?? (quote.price * 0.995);
  const prevClose = quote.prevClose ?? (quote.price * (1 - quote.percent / 100));
  const highPrice = quote.high ?? (quote.price * 1.012);
  const lowPrice = quote.low ?? (quote.price * 0.988);
  const volumeStr = quote.volume ?? '42.8M';

  // Determine Bloomberg asset class mnemonic
  let tag = '<Equity>';
  if (quote.category === 'crypto') tag = '<Curncy>';
  else if (quote.category === 'india') tag = '<Index>';
  else if (['GOLD', 'SILVER', 'BRENT'].includes(quote.symbol)) tag = '<Comdty>';

  const handleExecuteTrade = (side: 'BUY' | 'SELL') => {
    terminalAudio.playOrderFilled();
    setOrderNotice(`FILL EXEC: ${side} 1.00000000 ${quote.symbol} @ $${formatPrice(quote.price, 2)} | FEE 0.10% DEDUCTED`);
    setTimeout(() => {
      setOrderNotice(null);
    }, 4000);
  };

  const svgW = 340;
  const svgH = 175;
  const strokeColor = isPositive ? '#00ff66' : '#ff3b30';

  // Generate smooth chart coordinates for Line Mode
  const chartPoints = isPositive
    ? [0.8, 0.7, 0.75, 0.48, 0.58, 0.32, 0.45, 0.18, 0.25]
    : [0.2, 0.35, 0.25, 0.52, 0.42, 0.6, 0.5, 0.74, 0.68];

  const coords = chartPoints.map((pt, idx) => {
    const x = (idx / (chartPoints.length - 1)) * (svgW - 20) + 10;
    const y = pt * (svgH - 30) + 15;
    return { x, y };
  });

  const linePath = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Synthetic realistic OHLC Candles data for Candlestick Mode
  const candlesData = useMemo(() => {
    const count = 18;
    const baseP = quote.price;
    const result = [];
    let curOpen = baseP * (isPositive ? 0.985 : 1.015);

    for (let i = 0; i < count; i++) {
      const stepPct = (Math.random() - 0.48) * 0.012;
      const curClose = curOpen * (1 + stepPct);
      const curHigh = Math.max(curOpen, curClose) * (1 + Math.random() * 0.005);
      const curLow = Math.min(curOpen, curClose) * (1 - Math.random() * 0.005);
      result.push({
        open: curOpen,
        close: curClose,
        high: curHigh,
        low: curLow,
        isUp: curClose >= curOpen,
      });
      curOpen = curClose;
    }
    result[result.length - 1].close = quote.price;
    result[result.length - 1].isUp = isPositive;
    return result;
  }, [quote.price, isPositive, selectedTimeframe]);

  const minCandle = Math.min(...candlesData.map((c) => c.low));
  const maxCandle = Math.max(...candlesData.map((c) => c.high));
  const candleRange = maxCandle - minCandle || 1;
  const candleW = 10;
  const candleGap = (svgW - 24) / candlesData.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-mono select-none pb-28">
      {/* Header */}
      <TerminalHeader
        title={`${quote.symbol} ${tag}`}
        subtitle="SECURITY DESCRIPTION & GRAPH PRICE <DES <GO>>"
        showBack
        onBack={onBack}
        onSearchClick={onBack}
      />

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Top Price & Security Banner */}
        <div className="border border-[#182030] bg-[#070a10] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#ff8800] tracking-wide">
              {quote.name.toUpperCase()}
            </span>
            <span className="text-[10px] text-[#00e5ff] font-semibold">
              {quote.category === 'india' ? 'NSE SPOT 🇮🇳' : 'BINANCE SPOT'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums tracking-tight">
              {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(quote.price, 2)}
            </div>

            <div className={`text-xs font-bold tabular-nums ${isPositive ? 'text-[#00ff66]' : 'text-[#ff3b30]'}`}>
              {isPositive ? '+' : ''}{quote.change >= 0 ? quote.change.toFixed(2) : quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.percent.toFixed(2)}%)
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6b768e] border-t border-[#131b29] pt-1.5">
            <span>HIGH: {formatPrice(highPrice, 2)}</span>
            <span>LOW: {formatPrice(lowPrice, 2)}</span>
            <span>VOL: {volumeStr}</span>
          </div>
        </div>

        {/* Chart View Toggle & Interval Bar */}
        <div className="flex items-center justify-between border-b border-[#182030] pb-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                terminalAudio.playTick();
                setChartMode('candles');
              }}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                chartMode === 'candles'
                  ? 'bg-[#ff8800] text-black border-[#ff8800]'
                  : 'bg-[#0c1018] text-[#8e95a5] border-[#182030]'
              }`}
            >
              CANDLES &lt;GP&gt;
            </button>
            <button
              onClick={() => {
                terminalAudio.playTick();
                setChartMode('line');
              }}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                chartMode === 'line'
                  ? 'bg-[#ff8800] text-black border-[#ff8800]'
                  : 'bg-[#0c1018] text-[#8e95a5] border-[#182030]'
              }`}
            >
              LINE
            </button>
          </div>

          {/* Timeframe Chips */}
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => {
              const isActive = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => {
                    terminalAudio.playTick();
                    setSelectedTimeframe(tf);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-[#ff8800] text-black border-[#ff8800]'
                      : 'bg-[#0c1018] text-[#8e95a5] border-[#182030] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Technical Chart Canvas */}
        <div className="w-full h-[180px] bg-[#000000] border border-[#182030] p-1 flex items-center justify-center relative overflow-hidden">
          {/* Grid lines */}
          <svg className="w-full h-full" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
            <line x1="0" y1="45" x2={svgW} y2="45" stroke="#101724" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="0" y1="90" x2={svgW} y2="90" stroke="#101724" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="0" y1="135" x2={svgW} y2="135" stroke="#101724" strokeWidth="1" strokeDasharray="2 2" />

            {chartMode === 'line' ? (
              <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" />
            ) : (
              candlesData.map((c, i) => {
                const cx = 12 + i * candleGap + candleW / 2;
                const highY = svgH - 15 - ((c.high - minCandle) / candleRange) * (svgH - 30);
                const lowY = svgH - 15 - ((c.low - minCandle) / candleRange) * (svgH - 30);
                const openY = svgH - 15 - ((c.open - minCandle) / candleRange) * (svgH - 30);
                const closeY = svgH - 15 - ((c.close - minCandle) / candleRange) * (svgH - 30);

                const topY = Math.min(openY, closeY);
                const heightY = Math.max(Math.abs(closeY - openY), 2);
                const cColor = c.isUp ? '#00ff66' : '#ff3b30';

                return (
                  <g key={i}>
                    <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={cColor} strokeWidth="1" />
                    <rect
                      x={cx - candleW / 2}
                      y={topY}
                      width={candleW}
                      height={heightY}
                      fill={cColor}
                    />
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {/* Execution Alert */}
        {orderNotice && (
          <div className="p-2.5 bg-[#00ff66]/10 border border-[#00ff66] text-[#00ff66] text-[11px] font-bold flex items-center gap-2">
            <CheckCircle size={14} />
            <span>{orderNotice}</span>
          </div>
        )}

        {/* Institutional Order Execution Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleExecuteTrade('BUY')}
            className="py-2.5 bg-[#00c176] hover:bg-[#00d884] active:bg-[#009b5e] text-black font-black text-xs tracking-wider transition-colors cursor-pointer border border-[#00c176]"
          >
            &lt;BUY / LONG &lt;GO&gt;&gt;
          </button>
          <button
            onClick={() => handleExecuteTrade('SELL')}
            className="py-2.5 bg-[#ff3b30] hover:bg-[#ff554d] active:bg-[#d6281e] text-white font-black text-xs tracking-wider transition-colors cursor-pointer border border-[#ff3b30]"
          >
            &lt;SELL / SHORT &lt;GO&gt;&gt;
          </button>
        </div>

        {/* Financial Blotter Table */}
        <div className="border border-[#182030] bg-[#070a10]">
          <div className="px-2.5 py-1 bg-[#101520] border-b border-[#182030] flex items-center justify-between text-[10px] text-[#8e95a5] font-bold">
            <span className="text-[#ff8800]">FINANCIAL BLOTTER &amp; PRICING METRICS</span>
            <span>STATUS: ACTIVE</span>
          </div>

          <div className="p-2.5 divide-y divide-[#141b28] text-xs">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#8e95a5]">OPENING VALUE:</span>
              <span className="font-bold text-white tabular-nums">
                {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(openPrice, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#8e95a5]">PREVIOUS CLOSE:</span>
              <span className="font-bold text-white tabular-nums">
                {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(prevClose, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#8e95a5]">SESSION RANGE (L/H):</span>
              <span className="font-bold text-white tabular-nums">
                {formatPrice(lowPrice, 2)} — {formatPrice(highPrice, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#8e95a5]">24H VOLUME:</span>
              <span className="font-bold text-white tabular-nums">{volumeStr}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#8e95a5]">EXECUTION FEE DRAG:</span>
              <span className="font-bold text-[#00e5ff] tabular-nums">0.10% SPOT FLAT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
