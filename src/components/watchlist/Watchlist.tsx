'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useChartStore } from '@/stores/useChartStore';
import { POPULAR_SYMBOLS } from '@/services/symbols';
import { WatchlistItem } from './WatchlistItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Watchlist: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const watchlist = useWatchlistStore((s) => s.watchlist);
  const tickers = useWatchlistStore((s) => s.tickers);
  const favorites = useWatchlistStore((s) => s.favorites);
  const addToWatchlist = useWatchlistStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useWatchlistStore((s) => s.removeFromWatchlist);
  const toggleFavorite = useWatchlistStore((s) => s.toggleFavorite);

  const activeSymbol = useChartStore((s) => s.activeSymbol);
  const setActiveSymbol = useChartStore((s) => s.setActiveSymbol);

  const availableToAdd = POPULAR_SYMBOLS.filter((s) => !watchlist.includes(s.symbol));

  const filteredList = watchlist.filter((sym) => {
    const q = search.trim().toLowerCase();
    return sym.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface">
      {/* Header */}
      <div className="p-3 border-b border-subtle flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-main">Watchlist</span>
          <Badge variant="neutral" className="text-[10px]">
            {watchlist.length}
          </Badge>
        </div>
        <Button
          variant="icon"
          size="icon"
          onClick={() => setIsAdding(!isAdding)}
          title="Add Pair to Watchlist"
        >
          <Plus size={14} />
        </Button>
      </div>

      {/* Add Pair Chips */}
      {isAdding && (
        <div className="p-2.5 bg-elevated border-b border-subtle max-h-36 overflow-y-auto">
          <div className="text-[10px] text-faint mb-1.5">Click to add to watchlist:</div>
          <div className="flex flex-wrap gap-1">
            {availableToAdd.map((s) => (
              <button
                key={s.symbol}
                onClick={() => {
                  addToWatchlist(s.symbol);
                  setIsAdding(false);
                }}
                className="text-[11px] px-2 py-0.5 rounded bg-card hover:bg-hover text-muted hover:text-main border border-subtle"
              >
                + {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-2.5 border-b border-subtle">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <Input
            type="text"
            placeholder="Search watchlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {filteredList.map((symbol) => (
          <WatchlistItem
            key={symbol}
            symbol={symbol}
            ticker={tickers[symbol]}
            isSelected={symbol === activeSymbol}
            isFavorite={favorites.includes(symbol)}
            onSelect={setActiveSymbol}
            onToggleFavorite={toggleFavorite}
            onRemove={removeFromWatchlist}
          />
        ))}

        {filteredList.length === 0 && (
          <div className="p-6 text-center text-xs text-faint">No pairs in watchlist</div>
        )}
      </div>
    </div>
  );
};
