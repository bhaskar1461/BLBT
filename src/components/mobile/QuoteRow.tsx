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
  // Determine clean asset category badge
  let tag = 'Equity';
  let tagColor = 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20';
  if (quote.category === 'crypto') {
    tag = 'Crypto';
    tagColor = 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20';
  } else if (quote.category === 'india') {
    tag = 'Index';
    tagColor = 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20';
  } else if (['GOLD', 'SILVER', 'BRENT'].includes(quote.symbol)) {
    tag = 'Comdty';
    tagColor = 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20';
  }

  const hiPrice = quote.high ?? quote.price * 1.01;
  const loPrice = quote.low ?? quote.price * 0.99;

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center justify-between py-2.5 px-3 cursor-pointer active:bg-[#121824] hover:bg-[#0e1422] transition-colors select-none ${
        showDivider ? 'border-b border-[#161f30]' : ''
      }`}
    >
      {/* Col 1: Symbol, Tag, Company Name */}
      <div className="flex-1 min-w-0 pr-3 flex flex-col items-start leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white text-sm font-mono tracking-tight group-hover:text-[#f59e0b] transition-colors">
            {quote.symbol}
          </span>
          <span className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded border ${tagColor}`}>
            {tag}
          </span>
        </div>
        <div className="text-[11px] text-[#94a3b8] truncate w-full mt-0.5">
          {quote.name}
        </div>
      </div>

      {/* Col 2: High / Low Range (Shown on slightly wider screens) */}
      <div className="hidden xs:flex flex-col items-center px-2 text-[10px] text-[#64748b] font-mono tabular-nums leading-tight shrink-0">
        <span>H: {formatPrice(hiPrice, 2)}</span>
        <span>L: {formatPrice(loPrice, 2)}</span>
      </div>

      {/* Col 3: Price & Net / Pct Change */}
      <div className="flex flex-col items-end shrink-0 leading-tight font-mono">
        <div className="text-sm font-bold text-white tabular-nums">
          {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(quote.price, 2)}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 font-semibold tabular-nums text-xs">
          <span className={isPositive ? 'text-[#10b981]' : 'text-[#f43f5e]'}>
            {changeFormatted}
          </span>
          <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${
            isPositive ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#f43f5e]/15 text-[#f43f5e]'
          }`}>
            {percentFormatted}
          </span>
        </div>
      </div>
    </div>
  );
};
