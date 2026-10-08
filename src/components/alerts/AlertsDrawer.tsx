import React, { useState } from 'react';
import { X, Bell, Trash2, ArrowUpRight, ArrowDownRight, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { alertsEngine } from '../../services/alertsEngine';
import { sounds } from '../../services/audio';
import { formatPrice } from '../../services/symbols';
import type { PriceAlert, AlertNotification } from '../../types/alerts';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: string;
  currentPrice: number;
  alerts: PriceAlert[];
  notifications: AlertNotification[];
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  currentSymbol,
  currentPrice,
  alerts,
  notifications,
  soundEnabled,
  onToggleSound,
}) => {
  const [targetPrice, setTargetPrice] = useState(currentPrice > 0 ? String(currentPrice) : '');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  if (!isOpen) return null;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (!priceNum || priceNum <= 0) return;

    alertsEngine.addAlert(currentSymbol, priceNum, condition, note.trim() || undefined);
    setNote('');
  };

  const activeAlerts = alerts.filter((a) => a.active);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '420px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <Bell size={16} color="var(--gold)" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Price Alerts
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                onToggleSound(next);
                sounds.setSoundEnabled(next);
                if (next) sounds.playAlertPing();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: soundEnabled ? 'var(--bull)' : 'var(--text-faint)',
                cursor: 'pointer',
                display: 'flex',
              }}
              title={soundEnabled ? 'Sound enabled' : 'Sound muted'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleAddAlert} style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Create Alert for <span style={{ color: 'var(--primary)' }}>{currentSymbol}</span> (Now: ${formatPrice(currentPrice)})
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {/* Condition selector */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="form-input"
              style={{ width: '130px', cursor: 'pointer' }}
            >
              <option value="above">rises above</option>
              <option value="below">drops below</option>
            </select>

            {/* Target Price input */}
            <input
              type="number"
              step="any"
              className="form-input font-mono"
              placeholder="Target Price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Optional note (e.g. Resistance breakout)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Set Alert
            </button>
          </div>
        </form>

        {/* Tabs: Active Alerts vs History */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
          }}
        >
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Triggered History ({notifications.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {activeTab === 'active' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {alt.condition === 'above' ? (
                      <ArrowUpRight size={16} color="var(--bull)" />
                    ) : (
                      <ArrowDownRight size={16} color="var(--bear)" />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>
                        {alt.symbol} {alt.condition === 'above' ? '≥' : '≤'} ${formatPrice(alt.targetPrice)}
                      </div>
                      {alt.note && <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{alt.note}</div>}
                    </div>
                  </div>

                  <button
                    onClick={() => alertsEngine.removeAlert(alt.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                    }}
                    title="Delete Alert"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-faint)' }}>
                  No active alerts. Create one above!
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((noteItem) => (
                <div
                  key={noteItem.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} color="var(--bull)" />
                      <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>
                        {noteItem.symbol}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(noteItem.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{noteItem.message}</div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-faint)' }}>
                  No triggered alerts yet.
                </div>
              )}
              {notifications.length > 0 && (
                <button
                  className="btn"
                  onClick={() => alertsEngine.clearNotifications()}
                  style={{ marginTop: '8px', fontSize: '11px' }}
                >
                  Clear Trigger History
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
