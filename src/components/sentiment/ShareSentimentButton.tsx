'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareSentimentButtonProps {
  symbol: string;
  longPct: number;
}

export function ShareSentimentButton({ symbol, longPct }: ShareSentimentButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/sentiment?symbol=${symbol}` : `/sentiment?symbol=${symbol}`;
    const text = `Retail paper traders are ${longPct}% LONG on ${symbol}. See what the herd is doing before entering: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${symbol} Retail Sentiment Index`,
          text,
          url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className="btn flex items-center gap-2 py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-subtle text-xs font-semibold transition-all cursor-pointer"
      title="Share Contrarian Sentiment Card"
    >
      {copied ? <Check size={14} className="text-bull" /> : <Share2 size={14} />}
      <span>{copied ? 'Link Copied!' : 'Share Sentiment Card'}</span>
    </button>
  );
}
