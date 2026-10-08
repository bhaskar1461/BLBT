'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Download, TrendingUp, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/trading';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareStatsViewerProps {
  entry: LeaderboardEntry;
  userId: string;
}

export const ShareStatsViewer: React.FC<ShareStatsViewerProps> = ({ entry, userId }) => {
  const [copied, setCopied] = useState(false);

  const ogImageUrl = `/api/og/stats/${userId}`;
  const sharePageUrl = typeof window !== 'undefined' ? window.location.href : `https://celsius.trade/share/stats/${userId}`;

  const tweetText = `Check my paper trading stats on @CelsiusNetwork! Ranked #${entry.rank} with +${entry.realizedPnlPct}% realized return (${entry.winRatePct}% win rate) 🏆\n\n${sharePageUrl}`;
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharePageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Verified Badge */}
      <div className="flex items-center gap-2 bg-elevated border border-cardborder px-4 py-1.5 rounded-full text-xs">
        <Trophy size={14} className="text-[#ffd700]" />
        <span className="text-faint">Verified Rank</span>
        <span className="font-bold text-white">#{entry.rank} on Leaderboard</span>
      </div>

      {/* 1200x630 Preview Container */}
      <div className="w-full max-w-2xl bg-card border border-subtle rounded-2xl overflow-hidden shadow-2xl relative group">
        <div className="relative aspect-[1200/630] w-full bg-canvas/80 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogImageUrl}
            alt={`${entry.displayName} Performance Card`}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Share Actions Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
        <button
          onClick={handleCopyLink}
          className="btn bg-elevated hover:bg-hover border border-cardborder text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          {copied ? <Check size={14} className="text-bull" /> : <Copy size={14} />}
          <span>{copied ? 'Link Copied!' : 'Copy Stats Link'}</span>
        </button>

        <a
          href={twitterIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <XIcon />
          <span>Post on X</span>
        </a>

        <a
          href={ogImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-card hover:bg-elevated border border-subtle text-muted hover:text-white text-xs px-3 py-2.5 rounded-lg font-medium flex items-center gap-1.5"
          title="Open raw 1200x630 card image"
        >
          <Download size={14} />
          <span>Save Image</span>
        </a>

        <Link
          href="/leaderboard"
          className="btn btn-primary text-xs px-5 py-2.5 rounded-lg font-extrabold flex items-center gap-2 shadow-lg shadow-bull/20"
        >
          <Trophy size={14} />
          <span>View Full Leaderboard</span>
        </Link>
      </div>
    </div>
  );
};
