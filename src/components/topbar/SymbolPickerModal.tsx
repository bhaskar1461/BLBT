import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { POPULAR_SYMBOLS, formatPrice, formatNumber } from '../../services/symbols';
import { AssetIcon } from '@/components/ui/TradingViewIcons';
import type { SymbolInfo, TickerData } from '../../types/chart';

interface SymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  tickers: Record<string, TickerData>;
  currentSymbol: string;
}

const CATEGORIES = ['All', 'Major', 'Layer 1', 'DeFi', 'Meme', 'Layer 2', 'AI'];

export const SymbolPickerModal: React.FC<SymbolPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  tickers,
  currentSymbol,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSymbols = useMemo(() => {
    const query = search.trim().toLowerCase();
    return POPULAR_SYMBOLS.filter((item: SymbolInfo) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.baseAsset.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '560px', maxHeight: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Select Trading Pair
            </span>
            <span className="badge badge-neutral">USDT Perpetual & Spot</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 18px 8px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              placeholder="Search by coin, token, or pair (e.g. BTC, Solana)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '4px 18px 10px',
            overflowX: 'auto',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn btn-pill ${selectedCategory === cat ? 'btn-primary' : ''}`}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Symbol List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-faint)', fontSize: '11px', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px 12px' }}>Pair</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Last Price</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>24h Change</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>24h Volume</th>
              </tr>
            </thead>
            <tbody>
              {filteredSymbols.map((item) => {
                const ticker = tickers[item.symbol];
                const price = ticker ? ticker.lastPrice : 0;
                const change = ticker ? ticker.priceChangePercent : 0;
                const isPositive = change >= 0;
                const isSelected = item.symbol === currentSymbol;

                return (
                  <tr
                    key={item.symbol}
                    onClick={() => {
                      onSelectSymbol(item.symbol);
                      onClose();
                    }}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AssetIcon symbol={item.symbol} size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                            {item.symbol}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                            {item.name} • {item.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ fontWeight: 500 }}>
                        {price > 0 ? `$${formatPrice(price, item.pricePrecision)}` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span
                        className={`badge ${isPositive ? 'badge-bull' : 'badge-bear'}`}
                      >
                        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isPositive ? '+' : ''}
                        {change.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {ticker ? `$${formatNumber(ticker.quoteVolume)}` : '—'}
                    </td>
                  </tr>
                );
              })}
              {filteredSymbols.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-faint)' }}>
                    No trading pairs found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
