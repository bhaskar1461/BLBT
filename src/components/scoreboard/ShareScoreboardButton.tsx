'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareScoreboardButtonProps {
  headline?: string;
  className?: string;
}

export function ShareScoreboardButton({
  headline = '82% of YouTube calls this month were wrong.',
  className = '',
}: ShareScoreboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `"${headline}"\n\nPublic trading calls objectively scored against real Binance prices. No selective editing. No deleted tweets.\n\nVerify the full scoreboard:`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/scoreboard` : 'https://celsius.network/scoreboard';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleTwitterShare = () => {
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleTwitterShare}
        className="px-3.5 py-1.5 rounded-lg bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 text-[#1d9bf0] border border-[#1d9bf0]/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
        title="Share on Twitter / X"
      >
        <XIcon />
        <span>Share Fact</span>
      </button>

      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white border border-subtle text-xs font-mono flex items-center gap-1.5 transition-colors"
        title="Copy Scoreboard Link"
      >
        {copied ? <Check size={13} className="text-bull" /> : <Share2 size={13} />}
        <span>{copied ? 'Copied Link' : 'Copy'}</span>
      </button>
    </div>
  );
}
