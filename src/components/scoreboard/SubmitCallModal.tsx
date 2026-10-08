'use client';

import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CallPlatform, CallDirection } from '@/lib/scoreboardService';

interface SubmitCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function SubmitCallModal({ isOpen, onClose, onSubmitted }: SubmitCallModalProps) {
  const [callerName, setCallerName] = useState('');
  const [callerHandle, setCallerHandle] = useState('');
  const [platform, setPlatform] = useState<CallPlatform>('youtube');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [direction, setDirection] = useState<CallDirection>('bullish');
  const [entryPrice, setEntryPrice] = useState('');
  const [timeframeDays, setTimeframeDays] = useState('14');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName,
          callerHandle,
          platform,
          symbol,
          direction,
          entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
          timeframeDays: parseInt(timeframeDays, 10),
          proofUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit call.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSubmitted?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-panel border border-subtle w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Submit a Public Trading Call</span>
              <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                COMMUNITY FACT-CHECK
              </span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Held accountable against real Binance spot prices when the timeframe expires.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-faint hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-bear/10 border border-bear/20 text-bear text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-bull/10 border border-bull/20 text-bull text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>Call submitted successfully! Added to verifiable scoring queue.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Caller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Public Figure / Channel Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BitBoy, CryptoCapo"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Social Handle (optional)
              </label>
              <input
                type="text"
                placeholder="@handle"
                value={callerHandle}
                onChange={(e) => setCallerHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white font-mono focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Platform & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as CallPlatform)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs"
              >
                <option value="youtube">YouTube Video</option>
                <option value="twitter">Twitter / X Post</option>
                <option value="telegram">Telegram Signal</option>
                <option value="tiktok">TikTok Video</option>
                <option value="tv">Financial News / TV</option>
                <option value="discord">Discord Community</option>
                <option value="other">Other Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Asset Pair *
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs font-mono"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="AVAXUSDT">AVAX/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
              </select>
            </div>
          </div>

          {/* Direction & Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Call Direction *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirection('bullish')}
                  className={`py-1.5 rounded-lg font-bold text-center border transition-all ${
                    direction === 'bullish'
                      ? 'bg-bull/20 text-bull border-bull shadow-sm'
                      : 'bg-canvas border-subtle text-muted hover:text-white'
                  }`}
                >
                  🟢 Bullish
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('bearish')}
                  className={`py-1.5 rounded-lg font-bold text-center border transition-all ${
                    direction === 'bearish'
                      ? 'bg-bear/20 text-bear border-bear shadow-sm'
                      : 'bg-canvas border-subtle text-muted hover:text-white'
                  }`}
                >
                  🔴 Bearish
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Timeframe (Days) *
              </label>
              <select
                value={timeframeDays}
                onChange={(e) => setTimeframeDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs font-mono"
              >
                <option value="7">7 Days (1 Week)</option>
                <option value="14">14 Days (2 Weeks)</option>
                <option value="30">30 Days (1 Month)</option>
                <option value="60">60 Days (2 Months)</option>
                <option value="90">90 Days (Quarter)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-faint mb-1">
                Entry Price (USDT)
              </label>
              <input
                type="number"
                step="any"
                placeholder="Leave blank for live"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white font-mono focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Proof URL */}
          <div>
            <label className="block text-[11px] font-semibold text-faint mb-1">
              Proof Link / Video URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://x.com/.../status/..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs"
            />
          </div>

          {/* Stated Thesis */}
          <div>
            <label className="block text-[11px] font-semibold text-faint mb-1">
              Quote / Stated Thesis
            </label>
            <textarea
              rows={2}
              placeholder='e.g. "Bitcoin to $80k before the end of the month"'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-subtle text-white focus:outline-none focus:border-primary text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-panel hover:bg-white/5 border border-subtle text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-lg shadow-primary/20"
            >
              <Send size={13} />
              <span>{loading ? 'Submitting...' : 'Submit Call'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
