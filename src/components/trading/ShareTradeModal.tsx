'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Share2, X, Copy, Check, Download, ExternalLink, Flame } from 'lucide-react';
import type { ClosedTradeRecord } from '@/types/trading';
import { formatPrice } from '@/lib/utils';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: ClosedTradeRecord | null;
}

export const ShareTradeModal: React.FC<ShareTradeModalProps> = ({ isOpen, onClose, trade }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trade) return null;

  const isProfit = trade.realizedPnl >= 0;
  const ogImageUrl = `/api/og/trade/${trade.id}`;
  const sharePageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${trade.id}`
    : `https://celsius.trade/share/${trade.id}`;

  const tweetText = `Just closed ${isProfit ? '+' : ''}${trade.realizedPnlPct}% on ${trade.symbol} (${isProfit ? '+' : ''}$${formatPrice(trade.realizedPnl, 2)} USDT) on @CelsiusNetwork paper trading! 🚀\n\n${sharePageUrl}`;
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharePageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-content"
        style={{ width: '560px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} className="text-bull" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Share Your Closed Trade Card
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Card Preview */}
          <div className="rounded-xl overflow-hidden border border-subtle bg-canvas shadow-xl aspect-[1200/630] relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImageUrl}
              alt="Trade Card Preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Facts Summary */}
          <div className="flex items-center justify-between bg-card border border-subtle p-3 rounded-lg text-xs">
            <div>
              <span className="text-faint text-[10px] block">RETURN</span>
              <span className={`font-mono font-bold text-sm ${isProfit ? 'text-bull' : 'text-bear'}`}>
                {isProfit ? '+' : ''}${formatPrice(trade.realizedPnl, 2)} ({isProfit ? '+' : ''}{trade.realizedPnlPct}%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-faint text-[10px] block">DURATION</span>
              <span className="font-mono font-bold text-white text-sm">{trade.durationFormatted}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="btn flex-1 bg-elevated hover:bg-hover border border-cardborder text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              {copied ? <Check size={14} className="text-bull" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <a
              href={twitterIntentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs py-2 px-4 rounded-lg font-bold flex items-center gap-1.5"
            >
              <XIcon />
              <span>Share to X</span>
            </a>

            <Link
              href={`/share/${trade.id}`}
              target="_blank"
              className="btn bg-card hover:bg-elevated border border-subtle text-muted hover:text-white text-xs py-2 px-3 rounded-lg flex items-center gap-1"
            >
              <ExternalLink size={13} />
              <span>Open Public Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
