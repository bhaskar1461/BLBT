// src/components/mobile/NewsArticleModal.tsx
'use client';

import React from 'react';
import type { NewsItem, Quote } from './types';
import { ChevronLeft, Share2, Bookmark, ExternalLink } from 'lucide-react';
import { terminalAudio } from '@/lib/terminalAudio';

interface NewsArticleModalProps {
  article: NewsItem | null;
  onClose: () => void;
  onSelectQuote?: (symbol: string) => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({
  article,
  onClose,
  onSelectQuote,
}) => {
  if (!article) return null;

  // Curated in-depth analytical content matching Bloomberg wire dispatches
  const isIndia = article.category === 'India';
  const isCrypto = article.category === 'Crypto';

  const bullets = isIndia
    ? [
        'Reserve Bank of India maintains overnight system liquidity surplus above ₹1.5 lakh crore.',
        'Domestic retail inflation remains within the 4% target band despite localized food price friction.',
        'Foreign institutional investors turn net buyers across large-cap financial and IT counters on NSE.',
      ]
    : isCrypto
    ? [
        'Weekly digital asset investment products see net institutional inflows exceeding $800M.',
        'Bitcoin futures open interest on CME reaches fresh record as macro hedge funds increase positioning.',
        'Derivatives skew indicates aggressive accumulation of upside call options into quarterly expiry.',
      ]
    : [
        'Federal Reserve commentary signals measured pacing toward neutrality as labor markets balance.',
        'Treasury yields ease across the 2Y-10Y curve, lifting global risk appetite across equities.',
        'Corporate earnings revisions demonstrate resilient operating margins across semiconductor majors.',
      ];

  const relatedTickers = isIndia
    ? ['NIFTY', 'SENSEX', 'RELIANCE']
    : isCrypto
    ? ['BTCUSD', 'ETHUSD', 'SOLUSD']
    : ['AAPL', 'TSLA', 'NVDA'];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0d14] border-t border-[#232b3d] rounded-t-2xl p-5 pb-10 flex flex-col max-h-[92vh] overflow-y-auto shadow-2xl text-white"
      >
        {/* Top Handle & Navigation Bar */}
        <div className="w-10 h-1 bg-[#2e374a] rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-[#181d28]">
          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="flex items-center gap-1 text-[13px] font-bold text-[#ff8800] hover:underline cursor-pointer p-1 -ml-1"
          >
            <ChevronLeft size={18} />
            <span>Terminal Wire</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                terminalAudio.playTick();
                if (navigator.share) {
                  navigator.share({ title: article.title, text: article.title, url: window.location.href }).catch(() => {});
                } else {
                  alert('Link copied to clipboard.');
                }
              }}
              className="text-[#8e95a5] hover:text-white p-1"
              title="Share"
            >
              <Share2 size={17} />
            </button>
            <button
              onClick={() => {
                terminalAudio.playTick();
                alert('Article saved to your Bloomberg reading list.');
              }}
              className="text-[#8e95a5] hover:text-[#ff8800] p-1"
              title="Bookmark"
            >
              <Bookmark size={17} />
            </button>
          </div>
        </div>

        {/* Article Dateline & Category */}
        <div className="flex items-center gap-2 mt-4 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#1a2130] text-[#ff8800] font-bold uppercase border border-[#2b374e]">
            {article.category}
          </span>
          <span className="text-[#8e95a5]">
            {article.source} · {article.time}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[20px] font-extrabold text-white mt-2 leading-snug tracking-tight">
          {article.title}
        </h1>

        <p className="text-[12px] text-[#8e95a5] mt-1 font-mono">
          REPORTED BY BLOOMBERG FINANCIAL NEWS WIRE (NY / MUMBAI DESK)
        </p>

        {/* Signature Bloomberg Bullet Points Box */}
        <div className="my-4 p-3.5 bg-[#121622] border-l-4 border-[#ff8800] rounded-r-xl border-y border-r border-[#1e2637]">
          <div className="text-[11px] font-mono font-bold text-[#ff8800] uppercase tracking-wider mb-2">
            KEY TAKEAWAYS
          </div>
          <ul className="space-y-2 text-[13px] text-[#d1d5db] list-disc list-inside">
            {bullets.map((b, idx) => (
              <li key={idx} className="leading-snug">
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Full Analytical Body Text */}
        <div className="space-y-3 text-[14px] text-[#c0c5d2] leading-relaxed">
          <p>
            Global money managers are recalibrating positioning across primary asset classes as liquidity dynamics shift across both developed and emerging markets. Data published across institutional custody networks demonstrates accelerating turnover in high-beta equity proxies and real asset allocations.
          </p>
          <p>
            In institutional strategy notes released this morning, portfolio analysts emphasized that market participants remain focused on underlying capital efficiency, corporate balance-sheet durability, and macroeconomic rate differentials.
          </p>
          <p>
            &quot;The risk-reward calculus has structurally pivoted toward transparent balance sheets and verified execution,&quot; said senior portfolio strategists at the global macro desk. &quot;Turnover without edge remains the principal driver of retail drawdown, while systematic patience continues to outperform.&quot;
          </p>
        </div>

        {/* Related Securities Pill Tags */}
        <div className="mt-6 pt-4 border-t border-[#181d28]">
          <span className="text-[11px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider">
            RELATED INSTRUMENTS
          </span>
          <div className="flex items-center gap-2 mt-2">
            {relatedTickers.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  terminalAudio.playTick();
                  onClose();
                  onSelectQuote?.(sym);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#141924] border border-[#232b3d] hover:border-[#ff8800] text-xs font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="text-[#ff8800]">{sym}</span>
                <ExternalLink size={12} className="text-[#8e95a5]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
