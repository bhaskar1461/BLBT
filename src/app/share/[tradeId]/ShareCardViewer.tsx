'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Download,
} from 'lucide-react';
import type { ClosedTradeRecord } from '@/types/trading';
import { formatPrice } from '@/lib/utils';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareCardViewerProps {
  trade: ClosedTradeRecord;
  tradeId: string;
}

export const ShareCardViewer: React.FC<ShareCardViewerProps> = ({ trade, tradeId }) => {
  const [copied, setCopied] = useState(false);

  const isProfit = trade.realizedPnl >= 0;
  const ogImageUrl = `/api/og/trade/${tradeId}`;
  const sharePageUrl = typeof window !== 'undefined' ? window.location.href : `https://celsius.trade/share/${tradeId}`;

  const tweetText = `Just closed ${isProfit ? '+' : ''}${trade.realizedPnlPct}% on ${trade.symbol} (${isProfit ? '+' : ''}$${formatPrice(trade.realizedPnl, 2)} USDT) on @CelsiusNetwork paper trading! 🚀\n\nCheck trade: ${sharePageUrl}`;
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharePageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Verified Badge */}
      <div className="flex items-center gap-2 bg-elevated border border-cardborder px-4 py-1.5 rounded-full text-xs">
        <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
        <span className="text-faint">Verified Paper Execution on</span>
        <span className="font-bold text-white">Celsius Network</span>
      </div>

      {/* 1200x630 Preview Container */}
      <div className="w-full max-w-2xl bg-card border border-subtle rounded-2xl overflow-hidden shadow-2xl relative group">
        {/* Render dynamically generated OG image preview */}
        <div className="relative aspect-[1200/630] w-full bg-canvas/80 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogImageUrl}
            alt={`${trade.symbol} Trade Card`}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Share Actions Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="btn bg-elevated hover:bg-hover border border-cardborder text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          {copied ? <Check size={14} className="text-bull" /> : <Copy size={14} />}
          <span>{copied ? 'Link Copied!' : 'Copy Trade Link'}</span>
        </button>

        {/* Share to X/Twitter Button */}
        <a
          href={twitterIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <XIcon />
          <span>Post on X</span>
        </a>

        {/* View OpenGraph Image directly */}
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

        {/* Start Trading CTA */}
        <Link
          href="/"
          className="btn btn-primary text-xs px-5 py-2.5 rounded-lg font-extrabold flex items-center gap-2 shadow-lg shadow-bull/20"
        >
          <TrendingUp size={14} />
          <span>Trade {trade.symbol} Live</span>
        </Link>
      </div>

      {/* Trade Quick Facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-4">
        <div className="bg-card border border-subtle p-3 rounded-xl flex flex-col">
          <span className="text-[10px] text-faint uppercase">Symbol</span>
          <span className="font-bold text-sm text-white mt-0.5">{trade.symbol}</span>
        </div>
        <div className="bg-card border border-subtle p-3 rounded-xl flex flex-col">
          <span className="text-[10px] text-faint uppercase">Side</span>
          <span className={`font-bold text-sm mt-0.5 ${trade.side === 'long' ? 'text-bull' : 'text-bear'}`}>
            {trade.side.toUpperCase()}
          </span>
        </div>
        <div className="bg-card border border-subtle p-3 rounded-xl flex flex-col">
          <span className="text-[10px] text-faint uppercase">Realized Return</span>
          <span className={`font-bold text-sm mt-0.5 ${isProfit ? 'text-bull' : 'text-bear'}`}>
            {isProfit ? '+' : ''}${formatPrice(trade.realizedPnl, 2)} ({isProfit ? '+' : ''}{trade.realizedPnlPct}%)
          </span>
        </div>
        <div className="bg-card border border-subtle p-3 rounded-xl flex flex-col">
          <span className="text-[10px] text-faint uppercase">Duration</span>
          <span className="font-bold text-sm text-white mt-0.5">{trade.durationFormatted}</span>
        </div>
      </div>
    </div>
  );
};
