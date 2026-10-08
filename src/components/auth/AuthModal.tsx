import React, { useState } from 'react';
import { User, X, Mail, Shield, LogOut, Settings, MessageSquare, Trophy, Share2 } from 'lucide-react';
import Link from 'next/link';
import { supabaseService } from '../../services/supabase';
import { storage } from '../../services/storage';
import type { UserProfile } from '../../types/user';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onOpenFeedback?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenFeedback,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Supabase keys
  const config = storage.getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.anonKey);
  const [configSaved, setConfigSaved] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const profile = await supabaseService.signInWithEmail(email.trim());
    onUpdateUser(profile);
    setIsSubmitting(false);
    onClose();
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    const profile = await supabaseService.signInWithGoogle();
    onUpdateUser(profile);
    setIsSubmitting(false);
    onClose();
  };

  const handleSignOut = async () => {
    await supabaseService.signOut();
    const guest = storage.getUserProfile();
    onUpdateUser(guest);
    onClose();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseService.updateConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const toggleAdminRole = () => {
    const newRole = user.role === 'admin' ? 'trader' : 'admin';
    const updated = { ...user, role: newRole as 'trader' | 'admin' };
    storage.setUserProfile(updated);
    onUpdateUser(updated);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '440px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Trader Profile & Authentication
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Profile Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  {user.displayName}
                </span>
                <span className="badge badge-bull font-bold text-[9px] px-1 py-0">
                  VIP HNW
                </span>
                <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                {user.email}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn"
                onClick={toggleAdminRole}
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Toggle role between Trader and Admin"
              >
                <Shield size={12} />
                <span>{user.role === 'admin' ? 'Switch to Trader' : 'Make Admin'}</span>
              </button>
              <button
                className="btn btn-icon"
                onClick={handleSignOut}
                title="Sign Out"
                style={{ width: '28px', height: '28px' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          {/* Institutional Portfolio Holdings Card (4.8 Cr) */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.08), rgba(0, 229, 255, 0.04))',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Verified Net Worth Holdings
              </div>
              <div style={{ fontSize: '11px', color: 'var(--bull)', fontFamily: 'monospace', fontWeight: 700 }}>
                $576,000.00 USDT
              </div>
            </div>

            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bull)', fontFamily: 'monospace', margin: '4px 0 2px' }}>
              ₹4.80 Crore
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Institutional multi-crypto holdings: <strong>4.25 BTC</strong>, <strong>42.0 ETH</strong>, <strong>450 SOL</strong>, <strong>65 BNB</strong>, <strong>600 AVAX</strong> + Liquid Margin Cash.
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Link
              href="/leaderboard"
              onClick={onClose}
              className="btn"
              style={{ padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Trophy size={12} color="#ffd700" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href={`/share/stats/${encodeURIComponent(user.id)}`}
              onClick={onClose}
              className="btn"
              style={{ padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Share2 size={12} color="var(--bull)" />
              <span>Stats Card</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenFeedback) onOpenFeedback();
              }}
              className="btn"
              style={{ padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <MessageSquare size={12} color="var(--primary)" />
              <span>Feedback</span>
            </button>
          </div>

          {/* Quick Sign In options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="btn"
              style={{
                background: '#fff',
                color: '#1a1a1a',
                padding: '9px 14px',
                fontWeight: 600,
                border: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-faint)', margin: '4px 0' }}>
              — OR SIGN IN WITH EMAIL —
            </div>

            {/* Email input form */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Mail size={13} />
                <span>Sign In</span>
              </button>
            </form>
          </div>

          {/* Collapsible Supabase Backend Settings */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Settings size={12} />
              <span>{showConfig ? 'Hide Supabase Integration Config' : 'Supabase Cloud Config (v2)'}</span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveConfig} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>VITE_SUPABASE_URL</span>
                  <input
                    type="text"
                    className="form-input font-mono"
                    style={{ fontSize: '11px' }}
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>VITE_SUPABASE_ANON_KEY</span>
                  <input
                    type="password"
                    className="form-input font-mono"
                    style={{ fontSize: '11px' }}
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--bull)' }}>
                    {configSaved ? 'Config updated successfully!' : ''}
                  </span>
                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Save Cloud Config
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
