'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Coffee, Clock, Check } from 'lucide-react';
import type { RevengeTradeStatus } from '@/lib/lossProtectionService';

interface RevengeTradeWarningBannerProps {
  status: RevengeTradeStatus;
  userId: string;
  onBreakActivated?: () => void;
}

export function RevengeTradeWarningBanner({
  status,
  userId,
  onBreakActivated,
}: RevengeTradeWarningBannerProps) {
  const [cooldownSeconds, setCooldownSeconds] = useState(
    status.cooldownRemainingSeconds || 0
  );
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    setCooldownSeconds(status.cooldownRemainingSeconds || 0);
  }, [status.cooldownRemainingSeconds]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!status.detected && cooldownSeconds <= 0) {
    return null;
  }

  const handleTakeBreak = async () => {
    setActivating(true);
    try {
      const res = await fetch('/api/trade/protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          action: 'activate_cooldown',
          cooldownMinutes: 5,
        }),
      });
      if (res.ok) {
        setCooldownSeconds(300);
        if (onBreakActivated) onBreakActivated();
      }
    } catch {
      setCooldownSeconds(300);
    } finally {
      setActivating(false);
    }
  };

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          {cooldownSeconds > 0 ? <Coffee size={15} /> : <AlertCircle size={15} />}
        </div>
        <div>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <span>
              {cooldownSeconds > 0
                ? 'Discipline Cooldown Active'
                : 'Revenge-Trade Warning Detected'}
            </span>
            <span className="badge bg-amber-500/20 text-amber-300 text-[9px] font-mono px-1 py-0 border border-amber-500/30">
              TRUTH CHECK
            </span>
          </div>
          <p className="text-xs text-white/90 font-medium mt-0.5 leading-relaxed">
            {cooldownSeconds > 0
              ? `You are on a 5-minute break (${formattedTime} remaining). Step away from the screen, breathe, and let emotions settle.`
              : 'Pattern detected: 3 rapid trades after a loss. Revenge trading costs the average retail trader 4.2x more than their initial loss. Take 5 minutes.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {cooldownSeconds > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
            <Clock size={13} />
            <span>{formattedTime}</span>
          </div>
        ) : (
          <button
            onClick={handleTakeBreak}
            disabled={activating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Coffee size={13} />
            <span>Take a 5-Minute Break</span>
          </button>
        )}
      </div>
    </div>
  );
}
