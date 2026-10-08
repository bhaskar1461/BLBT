'use client';

import React, { useState } from 'react';
import type { BacktestPreset, BacktestReport, StrategyType, BacktestParams } from '@/lib/backtestService';
import dynamic from 'next/dynamic';
import { BacktestForm } from './BacktestForm';

const BacktestResultsView = dynamic(
  () => import('./BacktestResultsView').then((m) => m.BacktestResultsView),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 rounded-xl bg-surface border border-subtle text-center text-xs font-mono text-muted animate-pulse">
        Loading Backtest Analytics & Equity Engine...
      </div>
    ),
  }
);

interface BacktestManagerProps {
  initialPresets: BacktestPreset[];
  initialReport: BacktestReport;
}

export function BacktestManager({
  initialPresets,
  initialReport,
}: BacktestManagerProps) {
  const [report, setReport] = useState<BacktestReport>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunBacktest(options: {
    strategyType: StrategyType;
    symbol: string;
    timeframe: string;
    periodDays: number;
    initialCapital: number;
    params: BacktestParams;
  }) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute backtest');
      }

      if (data.report) {
        setReport(data.report);
      }
    } catch (err: any) {
      setError(err.message || 'Error executing backtest simulation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Configuration Form */}
      <BacktestForm
        presets={initialPresets}
        onRunBacktest={handleRunBacktest}
        loading={loading}
      />

      {error && (
        <div className="p-4 bg-bear/10 border border-bear/30 rounded-xl text-bear text-xs font-mono">
          {error}
        </div>
      )}

      {/* Results View */}
      {report && <BacktestResultsView report={report} />}
    </div>
  );
}
