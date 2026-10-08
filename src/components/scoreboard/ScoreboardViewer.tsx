'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Radio,
  Tv,
} from 'lucide-react';
import type {
  ScoreboardSummary,
  PublicTradingCall,
  CallPlatform,
} from '@/lib/scoreboardService';
import { SubmitCallModal } from './SubmitCallModal';
import { ShareScoreboardButton } from './ShareScoreboardButton';
import { formatPrice } from '@/lib/utils';

const YouTubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#38bdf8">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ScoreboardViewerProps {
  initialSummary: ScoreboardSummary;
}

export function ScoreboardViewer({ initialSummary }: ScoreboardViewerProps) {
  const [summary, setSummary] = useState<ScoreboardSummary>(initialSummary);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const refreshData = async () => {
    try {
      const res = await fetch('/api/scoreboard');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSummary(data);
      }
    } catch {}
  };

  const platformIcons: Record<string, React.ReactNode> = {
    youtube: <YouTubeIcon />,
    twitter: <XIcon />,
    telegram: <Send size={14} className="text-blue-400" />,
    tiktok: <Radio size={14} className="text-pink-400" />,
    tv: <Tv size={14} className="text-amber-400" />,
  };

  // Filter calls
  const filteredCalls = summary.recentCalls.filter((c) => {
    if (selectedPlatform !== 'all' && c.platform !== selectedPlatform) return false;
    if (selectedSymbol !== 'all' && c.symbol !== selectedSymbol) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Dynamic Headline Callout Banner (Prompt 6.1 verbatim) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl shrink-0 mt-0.5">
            ⚖️
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                OBJECTIVE INDUSTRY FACT-CHECK
              </span>
              <span className="text-xs text-muted font-mono">• Scored against Binance Spot</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              &ldquo;{summary.headlineFact}&rdquo;
            </h2>
            <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
              Every public trading call is locked at announcement and automatically evaluated against live
              Binance prices upon expiry. Tone: neutral, factual, undeniable. Never mock — let the numbers
              do the talking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center shrink-0">
          <ShareScoreboardButton headline={summary.headlineFact} />
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="btn btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <PlusCircle size={14} />
            <span>Submit a Call</span>
          </button>
        </div>
      </div>

      {/* Platform Accuracy Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {summary.platformBreakdown.map((plat) => (
          <div
            key={plat.platform}
            className="p-4 sm:p-5 rounded-xl bg-panel border border-subtle space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {platformIcons[plat.platform] || <span>🌐</span>}
                <span>{plat.displayName}</span>
              </span>
              <span className="text-[10px] font-mono text-faint">
                {plat.totalCalls} Scored Calls
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-faint block">
                  Wrong Rate
                </span>
                <span className="text-2xl font-extrabold font-mono text-bear">
                  {plat.wrongPct}%
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-faint block">
                  Accuracy
                </span>
                <span className="text-sm font-bold font-mono text-bull">
                  {plat.accuracyPct}%
                </span>
              </div>
            </div>

            <div className="w-full bg-bull/20 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-bear h-full"
                style={{ width: `${plat.wrongPct}%` }}
                title={`${plat.wrongPct}% Wrong`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Public Caller Leaderboard Section */}
      <div className="p-6 rounded-2xl bg-panel border border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Public Caller Accuracy Leaderboard</span>
              <span className="text-xs font-normal text-muted font-mono">
                ({summary.topRankedCallers.length} Tracked Figures)
              </span>
            </h3>
            <p className="text-xs text-faint mt-0.5">
              Ranked by verified price prediction accuracy. Every prediction is held to its stated timeframe.
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted">
            Minimum 1 scored call required for ranking
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-subtle bg-canvas">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-subtle/40 border-b border-subtle text-faint uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Public Figure / Channel</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3 text-center">Total Calls</th>
                <th className="py-2.5 px-3 text-center">Correct</th>
                <th className="py-2.5 px-3 text-center">Wrong</th>
                <th className="py-2.5 px-3 text-right">Accuracy (%)</th>
                <th className="py-2.5 px-3 text-right">Avg Follower Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/30">
              {summary.topRankedCallers.map((caller) => {
                const isAccurate = caller.accuracyPct >= 50;
                return (
                  <tr key={caller.callerName} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-faint">
                      #{caller.rank}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-sans">
                        {caller.callerName}
                      </div>
                      {caller.callerHandle && (
                        <div className="text-[11px] text-muted font-mono">
                          {caller.callerHandle}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[11px] capitalize text-muted">
                        {platformIcons[caller.primaryPlatform]}
                        <span>{caller.primaryPlatform}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-white">
                      {caller.totalCalls}
                    </td>
                    <td className="py-3 px-3 text-center text-bull font-bold">
                      {caller.correctCalls}
                    </td>
                    <td className="py-3 px-3 text-center text-bear font-bold">
                      {caller.wrongCalls}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isAccurate ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {caller.accuracyPct.toFixed(1)}%
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        caller.avgPriceChangePct >= 0 ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {caller.avgPriceChangePct >= 0 ? '+' : ''}
                      {caller.avgPriceChangePct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filterable Feed of Scored & Active Calls */}
      <div className="p-6 rounded-2xl bg-panel border border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Public Trading Calls Feed</span>
              <span className="text-xs font-mono text-muted">({filteredCalls.length})</span>
            </h3>
            <p className="text-xs text-faint mt-0.5">
              Live Binance execution verification. Filter by asset, platform, or status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Platform filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-canvas border border-subtle text-xs text-white focus:outline-none focus:border-primary font-mono"
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter / X</option>
              <option value="telegram">Telegram</option>
            </select>

            {/* Symbol filter */}
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-canvas border border-subtle text-xs text-white focus:outline-none focus:border-primary font-mono"
            >
              <option value="all">All Assets</option>
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="AVAXUSDT">AVAX/USDT</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-canvas border border-subtle text-xs text-white focus:outline-none focus:border-primary font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="scored">Scored Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center text-xs text-faint font-mono">
            No trading calls match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCalls.map((call) => {
              const isPending = call.status === 'pending';
              const isCorrect = call.result === 'correct';
              const isWrong = call.result === 'wrong';

              return (
                <div
                  key={call.id}
                  className="p-4 rounded-xl bg-canvas border border-subtle hover:border-cardborder transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs font-sans">
                          {call.callerName}
                        </span>
                        {call.callerHandle && (
                          <span className="text-[10px] text-muted font-mono">
                            {call.callerHandle}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-faint">
                          {platformIcons[call.platform]}
                        </span>
                      </div>
                      <span className="text-[10px] text-faint font-mono block mt-0.5">
                        Called {new Date(call.calledAt).toLocaleDateString()} • {call.timeframeDays}d timeframe
                      </span>
                    </div>

                    {/* Status / Result Badge */}
                    {isPending ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock size={10} />
                        <span>AWAITING EXPIRY</span>
                      </span>
                    ) : isCorrect ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-bull/15 text-bull border border-bull/30 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>CORRECT</span>
                      </span>
                    ) : isWrong ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-bear/15 text-bear border border-bear/30 flex items-center gap-1">
                        <XCircle size={10} />
                        <span>WRONG</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-white/10 text-muted">
                        UNDEFINED
                      </span>
                    )}
                  </div>

                  {/* Call Parameters */}
                  <div className="p-3 rounded-lg bg-panel/70 border border-subtle/60 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{call.symbol}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            call.direction === 'bullish'
                              ? 'bg-bull/20 text-bull'
                              : 'bg-bear/20 text-bear'
                          }`}
                        >
                          {call.direction}
                        </span>
                      </div>
                      <span className="text-[10px] text-faint mt-0.5 block">
                        Call Price: ${formatPrice(call.entryPrice, 2)}
                      </span>
                    </div>

                    <div className="text-right">
                      {isPending ? (
                        <span className="text-[10px] text-muted">
                          Expires: {new Date(call.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <div>
                          <span
                            className={`font-bold block ${
                              (call.priceChangePct || 0) >= 0 ? 'text-bull' : 'text-bear'
                            }`}
                          >
                            {(call.priceChangePct || 0) >= 0 ? '+' : ''}
                            {call.priceChangePct?.toFixed(2)}% move
                          </span>
                          <span className="text-[10px] text-faint">
                            Exit: ${formatPrice(call.exitPrice || 0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quote / Thesis */}
                  {call.notes && (
                    <p className="text-[11px] text-muted italic border-l-2 border-subtle pl-2.5 leading-snug">
                      {call.notes}
                    </p>
                  )}

                  {/* Proof Link */}
                  {call.proofUrl && (
                    <div className="pt-1 flex items-center justify-end">
                      <a
                        href={call.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-muted hover:text-primary flex items-center gap-1 group font-mono"
                      >
                        <span className="group-hover:underline">Verify Source Proof</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SubmitCallModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitted={refreshData}
      />
    </div>
  );
}
