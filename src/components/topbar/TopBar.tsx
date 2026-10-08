import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Bell,
  Sliders,
  Shield,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  DollarSign,
} from 'lucide-react';
import { formatPrice, formatNumber, getSymbolInfo } from '../../services/symbols';
import type { TickerData } from '../../types/chart';
import type { WsConnectionStatus } from '../../services/binance';
import type { UserProfile } from '../../types/user';

interface TopBarProps {
  currentSymbol: string;
  ticker?: TickerData;
  connectionStatus: WsConnectionStatus;
  latencyMs: number;
  onOpenSymbolPicker: () => void;
  onOpenIndicators: () => void;
  onOpenAlerts: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onToggleWatchlist: () => void;
  onToggleTradePanel: () => void;
  isWatchlistOpen: boolean;
  isTradePanelOpen: boolean;
  activeAlertsCount: number;
  user: UserProfile;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentSymbol,
  ticker,
  connectionStatus,
  latencyMs,
  onOpenSymbolPicker,
  onOpenIndicators,
  onOpenAlerts,
  onOpenAdmin,
  onOpenAuth,
  onToggleWatchlist,
  onToggleTradePanel,
  isWatchlistOpen,
  isTradePanelOpen,
  activeAlertsCount,
  user,
}) => {
  const [flashClass, setFlashClass] = useState<'flash-up' | 'flash-down' | ''>('');
  const prevPriceRef = useRef<number | null>(null);
  const symbolInfo = getSymbolInfo(currentSymbol);

  const currentPrice = ticker?.lastPrice ?? 0;
  const changePercent = ticker?.priceChangePercent ?? 0;
  const changeValue = ticker?.priceChange ?? 0;
  const isPositive = changePercent >= 0;

  // Trigger price-flash animation whenever price changes
  useEffect(() => {
    if (prevPriceRef.current !== null && currentPrice > 0) {
      if (currentPrice > prevPriceRef.current) {
        setFlashClass('flash-up');
      } else if (currentPrice < prevPriceRef.current) {
        setFlashClass('flash-down');
      }
      const timer = setTimeout(() => setFlashClass(''), 700);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  return (
    <header className="terminal-header">
      {/* Left: Brand Logo & Symbol Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-icon"
          onClick={onToggleWatchlist}
          title={isWatchlistOpen ? 'Hide Watchlist' : 'Show Watchlist'}
          style={{ width: '28px', height: '28px' }}
        >
          {isWatchlistOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #00f090 0%, #2962ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              color: '#060d14',
              boxShadow: '0 0 10px rgba(0,240,144,0.3)',
            }}
          >
            °C
          </div>
          <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.3px' }}>
            CELSIUS
          </span>
        </div>

        {/* Symbol Selector Button */}
        <button
          className="btn"
          onClick={onOpenSymbolPicker}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            padding: '5px 10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
              {currentSymbol}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 5px' }}>
              {symbolInfo.category}
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-faint)" />
        </button>
      </div>

      {/* Middle: Live Price & 24h Stats with Price Flash */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          className={`price-container ${flashClass}`}
          style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            transition: 'background-color 0.2s ease',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: isPositive ? 'var(--bull)' : 'var(--bear)',
            }}
          >
            ${currentPrice > 0 ? formatPrice(currentPrice, symbolInfo.pricePrecision) : '—'}
          </span>
          <span
            className={`badge ${isPositive ? 'badge-bull' : 'badge-bear'}`}
            style={{ fontSize: '11px' }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}% ({isPositive ? '+' : ''}
            {formatPrice(changeValue, 2)})
          </span>
        </div>

        {/* 24h High / Low / Volume */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '14px',
          }}
          className="stats-strip"
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>24h High</span>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 500 }}>
              {ticker?.highPrice ? `$${formatPrice(ticker.highPrice, symbolInfo.pricePrecision)}` : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>24h Low</span>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 500 }}>
              {ticker?.lowPrice ? `$${formatPrice(ticker.lowPrice, symbolInfo.pricePrecision)}` : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>24h Vol (USDT)</span>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 500 }}>
              {ticker?.quoteVolume ? `$${formatNumber(ticker.quoteVolume)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Controls & Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* WebSocket Live Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            marginRight: '4px',
          }}
          title={`Binance WebSocket Status: ${connectionStatus} (${latencyMs}ms)`}
        >
          {connectionStatus === 'connected' ? (
            <div className="live-dot" />
          ) : (
            <div className="reconnecting-dot" />
          )}
          <span style={{ color: 'var(--text-muted)' }}>
            {connectionStatus === 'connected' ? 'LIVE' : connectionStatus.toUpperCase()}
          </span>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
            {latencyMs}ms
          </span>
        </div>

        {/* Indicators Button */}
        <button className="btn" onClick={onOpenIndicators} title="Technical Indicators (EMA, SMA, RSI, MACD)">
          <Sliders size={14} />
          <span>Indicators</span>
        </button>

        {/* Price Alerts Button */}
        <button
          className="btn"
          onClick={onOpenAlerts}
          title="Price Alerts"
          style={{ position: 'relative' }}
        >
          <Bell size={14} />
          <span>Alerts</span>
          {activeAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: 'var(--gold)',
                color: '#000',
                borderRadius: '50%',
                width: '15px',
                height: '15px',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Paper Trade Toggle Button */}
        <button
          className={`btn ${isTradePanelOpen ? 'btn-primary' : ''}`}
          onClick={onToggleTradePanel}
          title="Toggle Paper Trading Panel"
        >
          <DollarSign size={14} />
          <span>Paper Trade</span>
        </button>

        {/* Admin Console Button */}
        <button
          className="btn"
          onClick={onOpenAdmin}
          title="Admin Console & Telemetry"
          style={{
            borderColor: user.role === 'admin' ? 'rgba(41,98,255,0.4)' : undefined,
          }}
        >
          <Shield size={14} color="var(--primary)" />
          <span>Admin</span>
        </button>

        {/* User Account / Profile */}
        <button
          className="btn"
          onClick={onOpenAuth}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            padding: '4px 10px',
            gap: '6px',
          }}
        >
          <User size={14} color="var(--bull)" />
          <span style={{ fontWeight: 500 }}>{user.displayName}</span>
          <span
            className="badge"
            style={{
              fontSize: '9px',
              padding: '1px 4px',
              background: user.role === 'admin' ? 'rgba(41,98,255,0.2)' : 'var(--bg-card)',
              color: user.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {user.role.toUpperCase()}
          </span>
        </button>
      </div>
    </header>
  );
};
