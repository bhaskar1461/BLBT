'use client';

import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';
import { DEFAULT_INDICATORS } from '@/services/storage';
import { Button } from '@/components/ui/button';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({ isOpen, onClose }) => {
  const indicators = useChartStore((s) => s.indicators);
  const setIndicators = useChartStore((s) => s.setIndicators);
  const [local, setLocal] = useState(indicators);

  if (!isOpen) return null;

  const handleSave = () => {
    setIndicators(local);
    onClose();
  };

  const handleReset = () => {
    setLocal(DEFAULT_INDICATORS);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-cardborder rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <span className="text-sm font-semibold text-main">Technical Indicators</span>
          <button onClick={onClose} className="text-faint hover:text-main">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs font-sans">
          {/* EMA */}
          <div className="bg-card p-3.5 rounded-lg border border-subtle">
            <div className="font-semibold text-main mb-2">Exponential Moving Averages (EMA)</div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.ema.enabled9}
                  onChange={(e) => setLocal({ ...local, ema: { ...local.ema, enabled9: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-cyan-400" />
                <span>EMA 9 (Cyan)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.ema.enabled21}
                  onChange={(e) => setLocal({ ...local, ema: { ...local.ema, enabled21: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-yellow-400" />
                <span>EMA 21 (Gold)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.ema.enabled50}
                  onChange={(e) => setLocal({ ...local, ema: { ...local.ema, enabled50: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-purple-400" />
                <span>EMA 50 (Purple)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.ema.enabled200}
                  onChange={(e) => setLocal({ ...local, ema: { ...local.ema, enabled200: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                <span>EMA 200 (Crimson)</span>
              </label>
            </div>
          </div>

          {/* SMA */}
          <div className="bg-card p-3.5 rounded-lg border border-subtle">
            <div className="font-semibold text-main mb-2">Simple Moving Averages (SMA)</div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.sma.enabled20}
                  onChange={(e) => setLocal({ ...local, sma: { ...local.sma, enabled20: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-lime-400" />
                <span>SMA 20 (Lime)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                <input
                  type="checkbox"
                  checked={local.sma.enabled50}
                  onChange={(e) => setLocal({ ...local, sma: { ...local.sma, enabled50: e.target.checked } })}
                />
                <span className="w-3 h-3 rounded-sm bg-orange-400" />
                <span>SMA 50 (Orange)</span>
              </label>
            </div>
          </div>

          {/* RSI */}
          <div className="bg-card p-3.5 rounded-lg border border-subtle">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-main">
                <input
                  type="checkbox"
                  checked={local.rsi.enabled}
                  onChange={(e) => setLocal({ ...local, rsi: { ...local.rsi, enabled: e.target.checked } })}
                />
                <span>RSI Sub-Pane</span>
              </label>
              <span className="text-[10px] text-muted font-mono bg-elevated px-1.5 py-0.5 rounded">70 / 30 Bands</span>
            </div>
            <div className="text-muted text-[11px]">Wilder&apos;s 14-period Relative Strength Index with Overbought/Oversold boundaries.</div>
          </div>

          {/* MACD */}
          <div className="bg-card p-3.5 rounded-lg border border-subtle">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-main">
                <input
                  type="checkbox"
                  checked={local.macd.enabled}
                  onChange={(e) => setLocal({ ...local, macd: { ...local.macd, enabled: e.target.checked } })}
                />
                <span>MACD Sub-Pane</span>
              </label>
              <span className="text-[10px] text-muted font-mono bg-elevated px-1.5 py-0.5 rounded">12, 26, 9</span>
            </div>
            <div className="text-muted text-[11px]">Moving Average Convergence Divergence with Signal line and dynamic histogram.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-subtle flex items-center justify-between bg-surface">
          <Button variant="ghost" onClick={handleReset} className="gap-1 text-muted">
            <RotateCcw size={12} />
            <span>Reset</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="gap-1">
              <Check size={14} />
              <span>Apply</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
