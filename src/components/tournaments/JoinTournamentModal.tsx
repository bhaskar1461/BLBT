// src/components/tournaments/JoinTournamentModal.tsx
'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, DollarSign, Lock, Trophy } from 'lucide-react';
import type { Tournament } from '@/lib/tournamentService';

interface JoinTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onRegisteredSuccess?: () => void;
}

export const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onRegisteredSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          tournamentId: tournament.id,
          user: {
            userId: 'usr_celsius_demo',
            username: 'satoshisniper',
            displayName: 'Alex "Satoshi" Chen',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join tournament');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onRegisteredSuccess) onRegisteredSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while joining');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-panel border border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bull/15 text-bull border border-bull/30 flex items-center justify-center">
              <Trophy size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Join Tournament</h2>
              <p className="text-xs text-muted font-mono">Zero Entry Fees • Discipline Invariant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-faint hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs font-bold text-bull block uppercase tracking-wider font-mono">
              Tournament Event
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">{tournament.title}</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {tournament.description}
            </p>
          </div>

          {/* Guaranteed Invariants Grid */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono text-faint block uppercase">
              Tournament Rules & Enforced Safeguards
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-0.5">
                <span className="text-faint block text-[10px]">Entry Fee</span>
                <span className="font-mono font-bold text-emerald-400">$0.00 (Free Forever)</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-0.5">
                <span className="text-faint block text-[10px]">Initial Allocation</span>
                <span className="font-mono font-bold text-white">
                  ${tournament.startingBalanceUsdt.toLocaleString()} USDT
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-0.5">
                <span className="text-faint block text-[10px]">Per-Trade Risk Cap</span>
                <span className="font-mono font-bold text-bull">
                  {tournament.riskCapPct.toFixed(1)}% Max / Trade
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-0.5">
                <span className="text-faint block text-[10px]">Max Daily Loss Lock</span>
                <span className="font-mono font-bold text-bear">
                  -{tournament.maxDailyLossPct.toFixed(1)}% Hard Stop
                </span>
              </div>
            </div>
          </div>

          {/* Ethical Statement */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
            <strong>Honest Scoring:</strong> Your ranking is determined by your Risk-Adjusted Score
            (Return ÷ Drawdown). YOLO trades will hurt your rank even if they turn a profit.
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-bear/15 border border-bear/30 text-bear text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-bull/15 border border-bull/30 text-bull text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Registered successfully! Rerouting to tournament...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-subtle bg-surface/50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || success}
            className="btn btn-primary px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
          >
            {loading ? (
              <span>Registering...</span>
            ) : success ? (
              <span>Registered!</span>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Confirm Free Registration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
