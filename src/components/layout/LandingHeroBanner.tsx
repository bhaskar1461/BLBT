// src/components/layout/LandingHeroBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, ArrowRight, X, ChevronDown, ChevronUp, Scale, Zap } from 'lucide-react';

export const LandingHeroBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const showRequested = localStorage.getItem('celsius_show_hero') === 'true';
    if (showRequested) {
      setIsDismissed(false);
    }
  }, []);

  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('celsius_hero_dismissed', 'true');
    setIsDismissed(true);
  };

  if (isCollapsed) {
    return (
      <div className="bg-panel/90 border-b border-subtle px-4 py-1.5 flex items-center justify-between text-xs text-muted z-20">
        <div className="flex items-center gap-2">
          <span className="text-bull font-bold">°C</span>
          <span className="text-white font-medium truncate">
            The only trading platform that profits from you not losing money.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-faint hover:text-white flex items-center gap-1 text-[11px]"
          >
            <span>Show Manifesto</span>
            <ChevronDown size={12} />
          </button>
          <button
            onClick={handleDismiss}
            className="text-faint hover:text-white p-0.5"
            title="Dismiss permanently"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-panel via-surface to-panel border-b border-subtle px-4 py-3 text-xs z-20 relative shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bull/15 text-bull border border-bull/30 uppercase">
              THE HONEST TERMINAL
            </span>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              The only trading platform that profits from you not losing money.
            </h1>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds.
          </p>
        </div>

        {/* Action Links & Controls */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/about"
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-subtle transition-colors"
            >
              Manifesto
            </Link>
            <Link
              href="/reality"
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-subtle transition-colors"
            >
              Reality Check
            </Link>
            <Link
              href="/funding"
              className="px-2.5 py-1 rounded bg-bull/10 hover:bg-bull/20 text-bull border border-bull/30 transition-colors font-medium flex items-center gap-1"
            >
              <Heart size={11} />
              <span>Zero Ads ($150/mo)</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-subtle">
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-faint hover:text-white rounded"
              title="Collapse banner"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-faint hover:text-white rounded"
              title="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
