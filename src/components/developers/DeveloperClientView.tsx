// src/components/developers/DeveloperClientView.tsx
'use client';

import React, { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Trash2,
  Zap,
  Play,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import type { ApiKeyRecord, ApiUsageStats } from '@/lib/developerApiService';

interface DeveloperClientViewProps {
  initialKeys: ApiKeyRecord[];
  initialUsage: ApiUsageStats;
}

export const DeveloperClientView: React.FC<DeveloperClientViewProps> = ({
  initialKeys,
  initialUsage,
}) => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [usage, setUsage] = useState<ApiUsageStats>(initialUsage);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testSymbol, setTestSymbol] = useState('BTCUSDT');
  const [testResult, setTestResult] = useState<any>(null);
  const [testHeaders, setTestHeaders] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  // Active key to use for testing
  const activeKey = keys.find((k) => !k.isRevoked);

  const handleGenerateKey = async (tier: 'free' | 'pro' = 'free') => {
    setLoading(true);
    setErrorMsg(null);
    setNewlyCreatedKey(null);

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim() || undefined,
          tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate API key');
      }

      setNewlyCreatedKey(data.rawKey);
      setKeys((prev) => [data.key, ...prev]);
      setNewKeyName('');

      // Refresh usage stats
      const statsRes = await fetch('/api/developer/keys');
      const statsData = await statsRes.json();
      if (statsData.usage) setUsage(statsData.usage);
    } catch (err: any) {
      setErrorMsg(err.message || 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action is permanent.')) return;

    try {
      const res = await fetch(`/api/developer/keys?id=${keyId}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, isRevoked: true } : k))
        );
      }
    } catch (e) {
      console.error('Failed to revoke key:', e);
    }
  };

  const handleUpgradeToPro = async (keyId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/developer/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upgrade failed');

      setKeys((prev) => prev.map((k) => (k.id === keyId ? data.key : k)));
      alert('Upgraded to Pro tier ($49/mo). Real-time streaming unlocked!');
    } catch (err: any) {
      alert(err.message || 'Failed to upgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleTestQuery = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const keyParam = newlyCreatedKey || (activeKey ? 'cel_free_demo_key_778062e9' : '');
      const res = await fetch(`/api/v1/sentiment?symbol=${testSymbol}`, {
        headers: {
          Authorization: `Bearer ${keyParam}`,
        },
      });

      const data = await res.json();
      const headersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        if (key.startsWith('x-') || key === 'content-type') {
          headersObj[key] = val;
        }
      });

      setTestHeaders(headersObj);
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Usage Dashboard & Key Management */}
      <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-bull" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Developer API Keys & Usage
              </h2>
            </div>
            <p className="text-xs text-muted">
              Manage your credentials to authenticate with the Celsius Sentiment API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Key label (e.g. My Bot)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="bg-surface border border-subtle rounded-lg px-3 py-1.5 text-xs text-white placeholder-faint focus:outline-none focus:border-bull font-sans w-40"
            />
            <button
              onClick={() => handleGenerateKey('free')}
              disabled={loading}
              className="btn btn-primary px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
            >
              + Generate Free Key
            </button>
          </div>
        </div>

        {/* Newly Generated Key Banner */}
        {newlyCreatedKey && (
          <div className="p-4 rounded-xl bg-bull/10 border border-bull/30 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-bull uppercase">
                New API Key Created — Save Immediately
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newlyCreatedKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex items-center gap-1 text-xs font-mono text-bull hover:text-white"
              >
                {copiedKey ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
            <div className="bg-canvas p-2.5 rounded-lg font-mono text-xs text-bull select-all break-all border border-bull/20">
              {newlyCreatedKey}
            </div>
            <p className="text-[11px] text-zinc-400">
              For security, this raw key will not be displayed again. Include it in the{' '}
              <code className="text-bull">Authorization: Bearer &lt;KEY&gt;</code> header.
            </p>
          </div>
        )}

        {/* Usage Progress Meter */}
        <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-faint uppercase text-[11px]">Monthly Quota</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                  usage.tier === 'pro'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {usage.tier} tier
              </span>
            </div>
            <span className="font-mono font-bold text-white">
              {usage.currentMonthRequests.toLocaleString()} /{' '}
              {usage.monthlyLimit.toLocaleString()} requests
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.percentUsed > 90
                  ? 'bg-bear'
                  : usage.percentUsed > 60
                  ? 'bg-amber-400'
                  : 'bg-bull'
              }`}
              style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
            />
          </div>
        </div>

        {/* API Keys Table */}
        <div className="border border-subtle rounded-xl overflow-hidden bg-surface">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-subtle bg-panel/60 text-faint font-mono text-[11px]">
                <th className="py-3 px-4">Key Label</th>
                <th className="py-3 px-4">Prefix</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Usage (Month)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    No API keys created yet. Generate your first free key above.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-hover/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{k.name}</td>
                    <td className="py-3 px-4 font-mono text-muted text-[11px]">{k.keyPrefix}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          k.tier === 'pro'
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {k.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-300">
                      {k.currentMonthRequests} / {k.monthlyLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {k.isRevoked ? (
                        <span className="text-[10px] font-mono text-bear font-bold">REVOKED</span>
                      ) : (
                        <span className="text-[10px] font-mono text-bull font-bold">ACTIVE</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {k.tier === 'free' && !k.isRevoked && (
                          <button
                            onClick={() => handleUpgradeToPro(k.id)}
                            className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-bull/15 text-bull border border-bull/30 hover:bg-bull hover:text-black transition-colors"
                          >
                            Upgrade Pro ($49/mo)
                          </button>
                        )}
                        {!k.isRevoked && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1 text-faint hover:text-bear transition-colors"
                            title="Revoke key"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive API Query Tester */}
      <div className="bg-panel border border-subtle rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-bull" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Interactive Sentiment Feed Explorer
            </h3>
          </div>
          <span className="text-xs font-mono text-faint">GET /api/v1/sentiment</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-surface border border-subtle rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-mono">
            <span className="text-bull font-bold">GET</span>
            <span className="text-muted">/api/v1/sentiment?symbol=</span>
            <input
              type="text"
              value={testSymbol}
              onChange={(e) => setTestSymbol(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold uppercase w-24"
            />
          </div>

          <button
            onClick={handleTestQuery}
            disabled={testing}
            className="btn btn-primary px-4 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5"
          >
            <Play size={13} />
            <span>{testing ? 'Fetching...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Live Result View */}
        {testResult && (
          <div className="space-y-2 pt-2 animate-in fade-in">
            {/* Headers Strip */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono bg-surface p-2.5 rounded-lg border border-subtle">
              <span className="text-faint">RESPONSE HEADERS:</span>
              {Object.entries(testHeaders).map(([k, v]) => (
                <span key={k} className="text-zinc-300">
                  <strong className="text-bull">{k}:</strong> {v}
                </span>
              ))}
            </div>

            {/* JSON Output */}
            <pre className="p-4 rounded-xl bg-canvas border border-subtle font-mono text-xs text-bull overflow-x-auto max-h-80 leading-relaxed">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
