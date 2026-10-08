'use client';

import React from 'react';
import { Star, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getSymbolInfo } from '@/services/symbols';
import { formatPrice } from '@/lib/utils';
import type { TickerData } from '@/types/chart';
import { Badge } from '@/components/ui/badge';
import { AssetIcon } from '@/components/ui/TradingViewIcons';

interface WatchlistItemProps {
  symbol: string;
  ticker?: TickerData;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export const WatchlistItem: React.FC<WatchlistItemProps> = ({
  symbol,
  ticker,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onRemove,
}) => {
  const info = getSymbolInfo(symbol);
  const price = ticker?.lastPrice ?? 0;
  const change = ticker?.priceChangePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <div
      onClick={() => onSelect(symbol)}
      className={`group flex items-center justify-between px-3 py-2 border-b border-subtle/40 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-elevated border-l-2 border-l-primary'
          : 'bg-transparent hover:bg-hover border-l-2 border-l-transparent'
      }`}
    >
      {/* Left: Star & Symbol name */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(symbol);
          }}
          className="text-faint hover:text-gold transition-colors p-0.5"
          title={isFavorite ? 'Unfavorite' : 'Favorite'}
        >
          <Star size={13} className={isFavorite ? 'text-gold fill-gold' : ''} />
        </button>
        <div className="shrink-0 flex items-center justify-center">
          <AssetIcon symbol={symbol} size={20} />
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold text-main leading-tight truncate">{symbol}</div>
          <div className="text-[10px] text-faint truncate">{info.name}</div>
        </div>
      </div>

      {/* Right: Live Price & 24h Change */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="font-mono text-xs font-semibold text-main leading-tight">
            {price > 0 ? `$${formatPrice(price, info.pricePrecision)}` : '—'}
          </div>
          <div className="flex items-center justify-end gap-0.5 font-mono text-[10px]">
            <Badge variant={isPositive ? 'bull' : 'bear'} className="px-1 py-0 text-[10px]">
              {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {isPositive ? '+' : ''}
              {change.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(symbol);
          }}
          className="opacity-0 group-hover:opacity-100 text-faint hover:text-bear transition-opacity p-0.5"
          title="Remove from Watchlist"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
