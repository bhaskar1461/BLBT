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

  const isIndia = article.category === 'India';
  const isCrypto = article.category === 'Crypto';

  const bullets = article.bullets && article.bullets.length > 0
    ? article.bullets
    : isIndia
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end p-2 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl mx-auto bg-[#070a10] border-2 border-[#ff8800] p-4 flex flex-col max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.95)] text-white"
      >
        {/* Navigation Strip */}
        <div className="flex items-center justify-between pb-2 border-b border-[#182030]">
          <button
            onClick={() => {
              terminalAudio.playTick();
              onClose();
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#ff8800] hover:underline cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>&lt;TOP WIRE BACK&gt;</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#00ff66] font-bold">BN WIRE TRANSMISSION</span>
            <button
              onClick={() => {
                terminalAudio.playTick();
                onClose();
              }}
              className="text-[#8e95a5] hover:text-white text-xs px-2 py-0.5 border border-[#1e2a40] bg-[#0c1018]"
            >
              &lt;ESC&gt;
            </button>
          </div>
        </div>

        {/* Dateline & Urgency */}
        <div className="flex items-center gap-2 mt-3 text-[10px] text-[#8e95a5]">
          <span className="px-1.5 py-0.2 bg-[#ff8800]/20 text-[#ff8800] border border-[#ff8800]/40 font-bold uppercase">
            {article.category}
          </span>
          <span className="text-white font-bold">{article.source}</span>
          <span>·</span>
          <span>{article.time}</span>
          <span className="text-[#ffd600] font-black">***</span>
        </div>

        {/* Headline */}
        <h1 className="text-base font-black text-white mt-1.5 leading-snug tracking-tight">
          {article.title}
        </h1>

        <div className="text-[10px] text-[#6b768e] mt-1 border-b border-[#141b28] pb-2">
          BLOOMBERG NEWS WIRE DISPATCH &bull; MONITORED INSTITUTIONAL FEED
        </div>

        {/* Signature Bloomberg Bullet Points Box */}
        <div className="my-3 p-3 bg-[#0c1018] border-l-2 border-[#ff8800] border-y border-r border-[#1a2334]">
          <div className="text-[10px] font-bold text-[#ff8800] uppercase tracking-wider mb-1.5">
            EXECUTIVE DISPATCH BULLETS:
          </div>
          <ul className="space-y-1 text-xs text-[#cbd5e1]">
            {bullets.map((b, idx) => (
              <li key={idx} className="leading-snug">
                &bull; {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Analytical Body Text */}
        <div className="space-y-2.5 text-xs text-[#94a3b8] leading-relaxed">
          <p>
            Global institutional accounts are recalibrating positioning across primary liquid instruments as macro indicators and rate guidance recalibrate risk premia. Order blotters reflect steady systematic accumulation in high-liquidity proxies.
          </p>
          <p>
            &quot;Disciplined capital allocation with strict drawdown caps and zero casino turnover remains the structural winner across both volatile and range-bound regimes,&quot; observed global macro strategy desks.
          </p>
        </div>

        {article.link && article.link !== '#' && (
          <div className="mt-3">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => terminalAudio.playTick()}
              className="w-full py-2 px-3 bg-[#101520] hover:bg-[#182030] border border-[#1e2a40] text-xs font-bold text-[#ff8800] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Source Telemetry ({article.source})</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Related Securities */}
        <div className="mt-4 pt-3 border-t border-[#182030]">
          <span className="text-[10px] font-bold text-[#8e95a5] uppercase">
            RELATED INSTRUMENTS (INSPECT &lt;DES&gt;):
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {relatedTickers.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  terminalAudio.playTick();
                  onClose();
                  onSelectQuote?.(sym);
                }}
                className="px-2 py-1 bg-[#101520] border border-[#1e2a40] hover:border-[#ff8800] text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="text-[#ff8800]">{sym}</span>
                <span className="text-[9px] text-[#00e5ff]">&lt;GO&gt;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
