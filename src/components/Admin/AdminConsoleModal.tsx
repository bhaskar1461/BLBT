import React, { useState } from 'react';
import {
  Shield,
  X,
  Users,
  Activity,
  Megaphone,
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';
import type { FeatureFlags, Announcement, AdminUserState } from '../../types/admin';
import { storage } from '../../services/storage';
import { formatPrice } from '../../services/symbols';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureFlags: FeatureFlags;
  onUpdateFeatureFlags: (flags: FeatureFlags) => void;
  announcements: Announcement[];
  onUpdateAnnouncements: (announcements: Announcement[]) => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  featureFlags,
  onUpdateFeatureFlags,
  announcements,
  onUpdateAnnouncements,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'announcements' | 'flags'>('metrics');
  const [users, setUsers] = useState<AdminUserState[]>(storage.getAdminUsers());
  const [userSearch, setUserSearch] = useState('');
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<'info' | 'warning' | 'alert' | 'update'>('info');

  if (!isOpen) return null;

  // Toggle user suspension
  const handleToggleUserBan = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: (u.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended',
        };
      }
      return u;
    });
    setUsers(updated);
    storage.setAdminUsers(updated);
  };

  // Reset user simulated funds
  const handleResetUserFunds = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, portfolioValue: 100000 };
      }
      return u;
    });
    setUsers(updated);
    storage.setAdminUsers(updated);
  };

  // Add announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      text: newAnnouncementText.trim(),
      type: newAnnouncementType,
      active: true,
      createdAt: Date.now(),
    };
    const updated = [newAnn, ...announcements];
    onUpdateAnnouncements(updated);
    storage.setAnnouncements(updated);
    setNewAnnouncementText('');
  };

  const handleToggleAnnouncementActive = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    onUpdateAnnouncements(updated);
    storage.setAnnouncements(updated);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    onUpdateAnnouncements(updated);
    storage.setAnnouncements(updated);
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '720px', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(41,98,255,0.12) 0%, rgba(16,20,30,0.5) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(41,98,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={18} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Celsius Admin Console
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                Platform Telemetry, User Administration & Broadcast Controls
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            padding: '0 12px',
          }}
        >
          <button
            onClick={() => setActiveTab('metrics')}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'metrics' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'metrics' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Activity size={14} />
            <span>Dashboard Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={14} />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'announcements' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'announcements' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Megaphone size={14} />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => setActiveTab('flags')}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'flags' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'flags' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sliders size={14} />
            <span>Feature Flags</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {/* 1. DASHBOARD METRICS */}
          {activeTab === 'metrics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Total Simulated Traders</div>
                  <div className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    1,428
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--bull)', marginTop: '4px' }}>+12% this week</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>24h Paper Volume Traded</div>
                  <div className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                    $18.4M USDT
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>3,892 Orders Executed</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>WebSocket Stream Health</div>
                  <div className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--bull)', marginTop: '4px' }}>
                    99.98%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Avg Latency: 24ms</div>
                </div>
              </div>

              {/* System Info */}
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                  Infrastructure & Feed Status
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Data Source:</span>{' '}
                    <span style={{ fontWeight: 600 }}>Binance Spot REST v3 & WebSocket Stream</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Engine Core:</span>{' '}
                    <span style={{ fontWeight: 600 }}>Lightweight Charts v5 Canvas (60 FPS)</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Auth Layer:</span>{' '}
                    <span style={{ fontWeight: 600 }}>Supabase Auth Ready (Local Session Active)</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Storage Engine:</span>{' '}
                    <span style={{ fontWeight: 600 }}>Synchronized LocalStore & State Bus</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search user by display name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-faint)', fontSize: '11px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>User</th>
                    <th style={{ padding: '8px 10px' }}>Role</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Portfolio Value</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Trades</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.displayName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={`badge ${u.status === 'active' ? 'badge-bull' : 'badge-bear'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ${formatPrice(u.portfolioValue, 2)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {u.tradesCount}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="btn"
                            onClick={() => handleToggleUserBan(u.id)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              background: u.status === 'active' ? 'rgba(255,59,87,0.15)' : 'rgba(0,240,144,0.15)',
                              color: u.status === 'active' ? 'var(--bear)' : 'var(--bull)',
                              border: 'none',
                            }}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleResetUserFunds(u.id)}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            title="Reset portfolio to $100k"
                          >
                            <RotateCcw size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Creator Form */}
              <form
                onSubmit={handleAddAnnouncement}
                style={{
                  background: 'var(--bg-card)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Create Global Broadcast Announcement</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 📢 Scheduled Binance API maintenance today at 02:00 UTC..."
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    required
                  />
                  <select
                    className="form-input"
                    value={newAnnouncementType}
                    onChange={(e) => setNewAnnouncementType(e.target.value as 'info' | 'warning' | 'alert' | 'update')}
                    style={{ width: '130px' }}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={14} />
                    <span>Publish</span>
                  </button>
                </div>
              </form>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Megaphone size={16} color={ann.active ? 'var(--bull)' : 'var(--text-faint)'} />
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{ann.text}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                          {new Date(ann.createdAt).toLocaleString()} • Type: {ann.type}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn"
                        onClick={() => handleToggleAnnouncementActive(ann.id)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          background: ann.active ? 'var(--bull-bg)' : 'var(--bg-elevated)',
                          color: ann.active ? 'var(--bull)' : 'var(--text-faint)',
                          border: 'none',
                        }}
                      >
                        {ann.active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-faint)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. FEATURE FLAGS */}
          {activeTab === 'flags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Enable Paper Trading Engine</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Allows users to place simulated orders and manage portfolios</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.paperTradingEnabled}
                    onChange={(e) => {
                      const updated = { ...featureFlags, paperTradingEnabled: e.target.checked };
                      onUpdateFeatureFlags(updated);
                      storage.setFeatureFlags(updated);
                    }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>High-Frequency WebSocket Ticker Updates</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Streams raw 100ms ticker feed from Binance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.highFrequencyWs}
                    onChange={(e) => {
                      const updated = { ...featureFlags, highFrequencyWs: e.target.checked };
                      onUpdateFeatureFlags(updated);
                      storage.setFeatureFlags(updated);
                    }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Sub-Chart Indicator Panes</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Enable RSI and MACD dedicated lower panes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.subChartIndicators}
                    onChange={(e) => {
                      const updated = { ...featureFlags, subChartIndicators: e.target.checked };
                      onUpdateFeatureFlags(updated);
                      storage.setFeatureFlags(updated);
                    }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Platform Maintenance Mode</div>
                    <div style={{ fontSize: '11px', color: 'var(--bear)' }}>Shows maintenance warning banner across all sessions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureFlags.maintenanceMode}
                    onChange={(e) => {
                      const updated = { ...featureFlags, maintenanceMode: e.target.checked };
                      onUpdateFeatureFlags(updated);
                      storage.setFeatureFlags(updated);
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
