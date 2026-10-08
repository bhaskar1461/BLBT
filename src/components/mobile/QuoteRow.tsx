// src/components/mobile/QuoteRow.tsx
'use client';

import React from 'react';
import type { Quote } from './types';
import { MiniSparkline } from './MiniSparkline';
import { formatPrice } from '@/lib/utils';

interface QuoteRowProps {
  quote: Quote;
  onClick?: () => void;
  showDivider?: boolean;
}

export const QuoteRow: React.FC<QuoteRowProps> = ({
  quote,
  onClick,
  showDivider = false,
}) => {
  const isPositive = quote.positive;
  const changeFormatted = `${isPositive ? '+' : ''}${quote.change >= 0 ? quote.change.toFixed(2) : quote.change.toFixed(2)}`;
  const percentFormatted = `${isPositive ? '+' : ''}${quote.percent.toFixed(2)}%`;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg cursor-pointer active:bg-[#141923] hover:bg-[#0e121a] transition-colors select-none ${
        showDivider ? 'border-b border-[#181d28]/60' : ''
      }`}
    >
      {/* Left: Symbol & Name */}
      <div className="w-[100px] shrink-0 flex flex-col items-start leading-tight">
        <div className="text-[15px] font-bold text-white tracking-tight flex items-center gap-1">
          <span>{quote.symbol}</span>
          {quote.category === 'india' && (
            <span className="text-[10px]" title="National Stock Exchange of India">🇮🇳</span>
          )}
        </div>
        <div className="text-[11px] text-[#8e95a5] font-normal truncate max-w-[95px] mt-0.5">
          {quote.name}
        </div>
      </div>

      {/* Middle: Custom Vector MiniSparkline */}
      <div className="flex-1 flex justify-center px-2">
        <MiniSparkline
          positive={isPositive}
          points={quote.sparkline}
          width={58}
          height={24}
        />
      </div>

      {/* Right: Tabular Price & Pill Badge */}
      <div className="flex flex-col items-end shrink-0 leading-tight">
        <span className="font-mono text-[15px] font-semibold text-white tabular-nums">
          {quote.currency === 'INR' ? '₹' : '$'}{formatPrice(quote.price, 2)}
        </span>

        <div
          className={`mt-0.5 px-1.5 py-0.5 rounded-[4px] font-mono text-[11px] font-bold tracking-tight tabular-nums flex items-center gap-1 ${
            isPositive
              ? 'bg-[#00c176]/15 text-[#00c176]'
              : 'bg-[#ff4d4f]/15 text-[#ff4d4f]'
          }`}
        >
          <span>{changeFormatted}</span>
          <span>{percentFormatted}</span>
        </div>
      </div>
    </div>
  );
};
