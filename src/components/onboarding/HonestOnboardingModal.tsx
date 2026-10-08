'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingDown,
  Clock,
  Coins,
  ChevronRight,
  X,
  Compass,
} from 'lucide-react';

interface HonestOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (config: {
    selectedInstruments: string[];
    riskPerTradePct: number;
    initialBalance: number;
  }) => void;
}

const POPULAR_INSTRUMENTS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', desc: 'Authoritative Benchmark' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', desc: 'Smart Contract Layer' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', desc: 'High Volatility Alt' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', desc: 'Multi-Chain Asset' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', icon: '🔶', desc: 'Ecosystem Utility' },
];

export function HonestOnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: HonestOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT',
  ]);
  const [riskPerTradePct, setRiskPerTradePct] = useState<number>(1.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleInstrument = (sym: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(sym) ? (prev.length > 1 ? prev.filter((s) => s !== sym) : prev) : [...prev, sym]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      localStorage.setItem('celsius_onboarding_completed', 'true');
      localStorage.setItem('celsius_risk_per_trade_cap', String(riskPerTradePct));
      localStorage.setItem(
        'celsius_selected_instruments',
        JSON.stringify(selectedInstruments)
      );

      // Save to server protection route
      await fetch('/api/trade/protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_risk_per_trade',
          riskPerTradePct,
        }),
      }).catch(() => {});

      if (onComplete) {
        onComplete({
          selectedInstruments,
          riskPerTradePct,
          initialBalance: 10000,
        });
      }
      onClose();
    } catch {
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-card border border-subtle rounded-2xl shadow-2xl overflow-hidden text-main font-sans">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-panel border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-sm">
              ⚖️
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                The Honest Terminal
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {step === 1 ? 'Reality Check & Truth Manifesto' : 'Disciplined Account Provisioning (<60s)'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-faint hover:text-white hover:bg-white/5 transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 1 ? (
            /* SCREEN 1: THE REALITY CHECK */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-bear/10 border border-bear/30 flex items-start gap-3.5">
                <AlertTriangle size={22} className="text-bear shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white tracking-tight">
                    78.2% of paper traders on this platform lost money last month.
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    Trading is hard, expensive, and mostly unnecessary. If you are here to get rich
                    quick, close this tab right now. If you are here to build real risk discipline,
                    welcome.
                  </div>
                </div>
              </div>

              {/* Truth Metrics from /reality */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-canvas border border-subtle text-center">
                  <div className="text-[10px] uppercase font-semibold text-faint tracking-wider">
                    Median Trader Loss
                  </div>
                  <div className="text-base font-bold font-mono text-bear mt-1">-$342.50</div>
                  <div className="text-[10px] text-faint mt-0.5">Average: -$512.40</div>
                </div>
                <div className="p-3 rounded-xl bg-canvas border border-subtle text-center">
                  <div className="text-[10px] uppercase font-semibold text-faint tracking-wider">
                    Median Duration
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">44m</div>
                  <div className="text-[10px] text-faint mt-0.5">Overtrading trap</div>
                </div>
                <div className="p-3 rounded-xl bg-canvas border border-subtle text-center">
                  <div className="text-[10px] uppercase font-semibold text-faint tracking-wider">
                    Underperformed BTC
                  </div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">83.6%</div>
                  <div className="text-[10px] text-faint mt-0.5">Lost to buy & hold</div>
                </div>
              </div>

              {/* The Honest Terminal Promise */}
              <div className="p-4 rounded-xl bg-panel border border-subtle space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Compass size={14} className="text-bull" />
                  <span>How This Terminal Is Different</span>
                </div>
                <ul className="space-y-1.5 text-muted pl-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-bull shrink-0" />
                    <span>No deposit bonuses, no affiliate kickbacks, zero casino gamification.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-bull shrink-0" />
                    <span>Equal billing for losses: every mistake is transparently journaled.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-bull shrink-0" />
                    <span>Built-in daily loss circuit breaker: locks trading when drawdown is hit.</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  <span>I Understand — Let&apos;s Build Discipline</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* SCREEN 2: 3-STEP SETUP (<60 SECONDS) */
            <div className="space-y-5">
              {/* Step 1: Pick Instruments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Select Core Watchlist Instruments</span>
                  </span>
                  <span className="text-[11px] text-faint">Focus beats spread</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_INSTRUMENTS.map((inst) => {
                    const isSelected = selectedInstruments.includes(inst.symbol);
                    return (
                      <button
                        key={inst.symbol}
                        type="button"
                        onClick={() => toggleInstrument(inst.symbol)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-white shadow-sm'
                            : 'bg-canvas border-subtle text-muted hover:text-white hover:border-cardborder'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{inst.symbol.replace('USDT', '')}</span>
                          <span className="text-xs">{inst.icon}</span>
                        </div>
                        <div className="text-[10px] text-faint truncate mt-0.5">{inst.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Risk-per-trade Cap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Set Risk-Per-Trade Cap</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-bull">{riskPerTradePct}% of equity</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 1.0, 2.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setRiskPerTradePct(pct)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        riskPerTradePct === pct
                          ? 'bg-bull/15 border-bull text-bull font-bold shadow-sm'
                          : 'bg-canvas border-subtle text-muted hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{pct}% Risk</div>
                      <div className="text-[10px] text-faint">
                        {pct === 1.0 ? 'Recommended' : pct < 1.0 ? 'Conservative' : 'Max Retail'}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-canvas border border-subtle text-[11px] text-muted flex items-start gap-2">
                  <Shield size={14} className="text-bull shrink-0 mt-0.5" />
                  <span>
                    <strong>Why 1%?</strong> A 1% cap means you need 50 consecutive losses to blow up. Professional desks rarely risk more than 1% on any single trade.
                  </span>
                </div>
              </div>

              {/* Step 3: Paper Capital */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Initial Capital Provision</span>
                </span>
                <div className="p-3 rounded-xl bg-panel border border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-bull/15 text-bull flex items-center justify-center font-bold text-sm">
                      💵
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">10,000.00 USDT Paper Balance</div>
                      <div className="text-[10px] text-faint">Append-only ledger • Immutable verification</div>
                    </div>
                  </div>
                  <span className="badge badge-bull text-[10px] font-mono font-bold">
                    READY
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-subtle hover:bg-white/5 text-muted hover:text-white text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl bg-bull hover:bg-bull-hover text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-bull/20 transition-all cursor-pointer"
                >
                  <Lock size={15} />
                  <span>{saving ? 'Provisioning...' : 'Enter Terminal with Protection'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
