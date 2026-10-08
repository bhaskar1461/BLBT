'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareRealityButton() {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-panel border border-subtle text-xs font-semibold hover:bg-white/5 text-white transition-colors cursor-pointer"
    >
      {copied ? <Check size={14} className="text-bull" /> : <Share2 size={14} />}
      <span>{copied ? 'Link Copied!' : 'Share Reality'}</span>
    </button>
  );
}
