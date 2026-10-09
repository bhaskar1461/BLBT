// src/components/mobile/QuoteRow.tsx
'use client';

import React from 'react';
import type { Quote } from './types';
import { formatPrice } from '@/lib/utils';
import { terminalAudio } from '@/lib/terminalAudio';

interface QuoteRowProps {
  quote: Quote;
  onClick?: () => void;
  showDivider?: boolean;
}

export const QuoteRow: React.FC<QuoteRowProps> = ({
  quote,
  onClick,
  showDivider = true,
}) => {
  const isPositive = quote.positive;
  const changeFormatted = `${isPositive ? '+' : ''}${quote.change >= 0 ? quote.change.toFixed(2) : quote.change.toFixed(2)}`;
  const percentFormatted = `${isPositive ? '+' : ''}${quote.percent.toFixed(2)}%`;

  const handleClick = () => {
    terminalAudio.playTick();
    onClick?.();
  };

  // Determine Bloomberg asset class mnemonic
  let tag = '<Equity>';
  if (quote.category === 'crypto') tag = '<Curncy>';
  else if (quote.category === 'india') tag = '<Index>';
  else if (['GOLD', 'SILVER', 'BRENT'].includes(quote.symbol)) tag = '<Comdty>';

  const hiPrice = quote.high ?? quote.price * 1.01;
  const loPrice = quote.low ?? quote.price * 0.99;

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center justify-between py-2 px-2 font-mono text-xs cursor-pointer active:bg-[#121824] hover:bg-[#0c1018] transition-colors select-none ${
        showDivider ? 'border-b border-[#182030]' : ''
      }`}
    >
      {/* Col 1: Symbol, Tag, Company */}
      <div className="w-[125px] shrink-0 flex flex-col items-start leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#ff8800] text-[13px] tracking-tight group-hover:underline">
            {quote.symbol}
          </span>
          <span className="text-[9px] text-[#00e5ff] font-semibold">
            {tag}
          </span>
        </div>
        <div className="text-[10px] text-[#8e95a5] truncate max-w-[120px] mt-0.5">
          {quote.name}
        </div>
      </div>

      {/* Col 2: High / Low Range (Dense Financial Data) */}
      <div className="hidden sm:flex flex-col items-center px-1 text-[10px] text-[#6b768e] tabular-nums leading-tight">
        <span>H: {formatPrice(hiPrice, 2)}</span>
        <span>L: {formatPrice(loPrice, 2)}</span>
      </div>

      {/* Col 3: Price & Net / Pct Change in Bloomberg Tabular Style */}
      <div className="flex flex-col items-end shrink-0 leading-tight">
        <div className="text-[13px] font-bold text-white tabular-nums">
          {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(quote.price, 2)}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 font-bold tabular-nums text-[11px]">
          <span className={isPositive ? 'text-[#00ff66]' : 'text-[#ff3b30]'}>
            {changeFormatted}
          </span>
          <span className={isPositive ? 'text-[#00ff66]' : 'text-[#ff3b30]'}>
            ({percentFormatted})
          </span>
        </div>
      </div>
    </div>
  );
};
