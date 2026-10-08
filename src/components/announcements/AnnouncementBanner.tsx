'use client';

import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import type { Announcement } from '../../types/admin';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const activeAnnouncements = announcements.filter((a) => a.active);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('celsius_dismissed_announcements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Only critical notices or active warnings force a banner on the terminal screen
  const critical = activeAnnouncements.find((a) => a.type === 'critical');
  const warning = activeAnnouncements.find((a) => a.type === 'warning' && !dismissed[a.id]);
  const visible = critical || warning;

  if (!visible) return null;

  const isCritical = visible.type === 'critical';
  const isWarning = visible.type === 'warning';
  const isDismissible = visible.dismissible !== false && !isCritical;

  const handleDismiss = (id: string) => {
    const updated = { ...dismissed, [id]: true };
    setDismissed(updated);
    try {
      localStorage.setItem('celsius_dismissed_announcements', JSON.stringify(updated));
    } catch {}
  };

  let bgClass = 'bg-[#171b26] border-b border-[#2a2e39] text-[#d1d4dc]';
  let iconColor = '#2962ff';

  if (isCritical) {
    bgClass = 'bg-[#f23645]/15 border-b border-[#f23645]/40 text-[#ffffff]';
    iconColor = '#f23645';
  } else if (isWarning) {
    bgClass = 'bg-[#f59e0b]/15 border-b border-[#f59e0b]/40 text-[#ffffff]';
    iconColor = '#f59e0b';
  }

  return (
    <div
      className={`px-3 py-1.5 flex items-center justify-between text-xs select-none z-30 transition-all ${bgClass}`}
    >
      <div className="flex items-center gap-2 overflow-hidden truncate">
        {isCritical ? (
          <AlertTriangle size={14} color={iconColor} className="animate-pulse shrink-0" />
        ) : isWarning ? (
          <AlertTriangle size={14} color={iconColor} className="shrink-0" />
        ) : (
          <Megaphone size={14} color={iconColor} className="shrink-0" />
        )}

        <div className="flex items-center gap-1.5 overflow-hidden truncate">
          {visible.title && (
            <span className={`font-bold shrink-0 ${isCritical ? 'text-[#f23645]' : 'text-white'}`}>
              [{visible.title}]
            </span>
          )}
          <span className="truncate text-[11px] text-[#d1d4dc]">{visible.text || visible.message}</span>
          {isCritical && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-[2px] bg-[#f23645]/30 text-[#f23645] uppercase shrink-0">
              CRITICAL NOTICE
            </span>
          )}
        </div>
      </div>

      {/* Only show dismiss button if dismissible and not critical */}
      {isDismissible && (
        <button
          onClick={() => handleDismiss(visible.id)}
          className="text-[#787b86] hover:text-white p-1 rounded hover:bg-[#2a2e39] transition-colors ml-2 shrink-0 cursor-pointer"
          title="Dismiss announcement"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
