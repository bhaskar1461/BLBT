'use client';

import React from 'react';
import { X, Award, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Activity, Shield } from 'lucide-react';
import type { SessionReviewSummary } from '@/lib/lossProtectionService';
import { formatPrice } from '@/lib/utils';

interface PostSessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: SessionReviewSummary;
}

export function PostSessionReviewModal({
  isOpen,
  onClose,
  review,
}: PostSessionReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-card border border-subtle rounded-2xl shadow-2xl overflow-hidden text-main font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 bg-panel border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-xs">
              📊
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                Trading Session Close
              </span>
              <h3 className="text-xs font-bold text-white tracking-tight">
                Honest Post-Session Review
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-faint hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body: The 3-Line Honest Card */}
        <div className="p-5 space-y-4">
          <div className="text-xs text-muted leading-relaxed">
            {review.summaryHeadline}
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-subtle space-y-3 font-mono">
            {/* Line 1: Total trades today */}
            <div className="flex items-center justify-between pb-2 border-b border-subtle/60 text-xs">
              <span className="text-muted flex items-center gap-1.5 font-sans">
                <Activity size={14} className="text-primary" />
                <span>Total Trades Today:</span>
              </span>
              <span className="text-white font-bold">
                {review.totalTradesToday} ({review.winningTrades}W, {review.losingTrades}L)
              </span>
            </div>

            {/* Line 2: Fees paid */}
            <div className="flex items-center justify-between pb-2 border-b border-subtle/60 text-xs">
              <span className="text-muted flex items-center gap-1.5 font-sans">
                <DollarSign size={14} className="text-amber-400" />
                <span>Fees Paid (What casino made):</span>
              </span>
              <span className="text-amber-400 font-bold">
                ${formatPrice(review.feesPaidUsdt, 2)} USDT
              </span>
            </div>

            {/* Line 3: If you had done nothing */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted flex items-center gap-1.5 font-sans">
                <Shield size={14} className="text-bull" />
                <span>If you had done nothing:</span>
              </span>
              <span
                className={`font-bold ${
                  review.ifDoneNothingUsdt > 0
                    ? 'text-bull'
                    : review.ifDoneNothingUsdt < 0
                    ? 'text-bear'
                    : 'text-white'
                }`}
              >
                {review.ifDoneNothingUsdt >= 0 ? '+' : ''}${formatPrice(review.ifDoneNothingUsdt, 2)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-panel border border-subtle text-[11px] text-faint leading-normal font-sans">
            Brokers profit from turnover and commissions. We profit from your longevity and discipline.
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Acknowledge & Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
