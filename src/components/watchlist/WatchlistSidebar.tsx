import React, { useState } from 'react';
import { Search, Star, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, getSymbolInfo, POPULAR_SYMBOLS } from '../../services/symbols';
import type { TickerData } from '../../types/chart';

interface WatchlistSidebarProps {
  watchlist: string[];
  tickers: Record<string, TickerData>;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  watchlist,
  tickers,
  currentSymbol,
  onSelectSymbol,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  favorites,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Available symbols not in watchlist
  const availableToAdd = POPULAR_SYMBOLS.filter((s) => !watchlist.includes(s.symbol));

  const filteredList = watchlist.filter((sym) => {
    const info = getSymbolInfo(sym);
    const q = search.trim().toLowerCase();
    return sym.toLowerCase().includes(q) || info.name.toLowerCase().includes(q);
  });

  return (
    <aside className="terminal-sidebar">
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
            Watchlist
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            {watchlist.length}
          </span>
        </div>
        <button
          className="btn btn-icon"
          onClick={() => setShowAddMenu(!showAddMenu)}
          title="Add Symbol to Watchlist"
          style={{ width: '26px', height: '26px' }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Add Symbol Dropdown if opened */}
      {showAddMenu && (
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '6px' }}>
            Click to add to watchlist:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {availableToAdd.map((s) => (
              <button
                key={s.symbol}
                className="btn"
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => {
                  onAddToWatchlist(s.symbol);
                  setShowAddMenu(false);
                }}
              >
                + {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-faint)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search watchlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '28px', height: '28px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Watchlist Items */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredList.map((symbol) => {
          const info = getSymbolInfo(symbol);
          const ticker = tickers[symbol];
          const price = ticker?.lastPrice ?? 0;
          const change = ticker?.priceChangePercent ?? 0;
          const isPositive = change >= 0;
          const isCurrent = symbol === currentSymbol;
          const isFav = favorites.includes(symbol);

          return (
            <div
              key={symbol}
              onClick={() => onSelectSymbol(symbol)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(30, 38, 56, 0.4)',
                cursor: 'pointer',
                background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: isCurrent ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Left: Star & Symbol */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(symbol);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isFav ? 'var(--gold)' : 'var(--text-faint)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                  title={isFav ? 'Unfavorite' : 'Favorite'}
                >
                  <Star size={13} fill={isFav ? 'var(--gold)' : 'none'} />
                </button>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>
                    {symbol}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                    {info.name}
                  </div>
                </div>
              </div>

              {/* Right: Price & 24h Change */}
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {price > 0 ? `$${formatPrice(price, info.pricePrecision)}` : '—'}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: isPositive ? 'var(--bull)' : 'var(--bear)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px',
                    }}
                  >
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isPositive ? '+' : ''}
                    {change.toFixed(2)}%
                  </div>
                </div>

                {/* Remove item button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWatchlist(symbol);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                    opacity: 0.6,
                    padding: '2px',
                  }}
                  title="Remove from Watchlist"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)' }}>
            No symbols in watchlist
          </div>
        )}
      </div>
    </aside>
  );
};
