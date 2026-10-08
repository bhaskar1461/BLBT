'use client';

import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import type { Announcement } from '../../types/admin';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const activeAnnouncements = announcements.filter((a) => a.active);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  // Find highest priority active visible announcement (critical first)
  const critical = activeAnnouncements.find((a) => a.type === 'critical');
  const visible = critical || activeAnnouncements.find((a) => !dismissed[a.id]);

  if (!visible) return null;

  const isCritical = visible.type === 'critical';
  const isWarning = visible.type === 'warning';
  const isDismissible = visible.dismissible !== false && !isCritical;

  let bgGradient = 'linear-gradient(90deg, rgba(41,98,255,0.18) 0%, rgba(0,240,144,0.18) 100%)';
  let borderColor = 'var(--border-card)';
  let iconColor = 'var(--bull)';

  if (isCritical) {
    bgGradient = 'linear-gradient(90deg, rgba(255,59,87,0.3) 0%, rgba(183,28,28,0.3) 100%)';
    borderColor = 'rgba(255,59,87,0.4)';
    iconColor = 'var(--bear)';
  } else if (isWarning) {
    bgGradient = 'linear-gradient(90deg, rgba(255,214,0,0.22) 0%, rgba(255,145,0,0.2) 100%)';
    borderColor = 'rgba(255,214,0,0.35)';
    iconColor = 'var(--gold)';
  }

  return (
    <div
      style={{
        background: bgGradient,
        borderBottom: `1px solid ${borderColor}`,
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-main)',
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isCritical ? (
          <AlertTriangle size={15} color={iconColor} className="animate-pulse" />
        ) : isWarning ? (
          <AlertTriangle size={15} color={iconColor} />
        ) : (
          <Megaphone size={15} color={iconColor} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {visible.title && (
            <span style={{ fontWeight: 700, color: isCritical ? 'var(--bear)' : 'var(--text-main)' }}>
              [{visible.title}]
            </span>
          )}
          <span style={{ fontWeight: 500 }}>{visible.text || visible.message}</span>
          {isCritical && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'rgba(255,59,87,0.25)',
                color: 'var(--bear)',
                marginLeft: '4px',
              }}
            >
              CRITICAL NOTICE
            </span>
          )}
        </div>
      </div>

      {/* Only show dismiss button if dismissible and not critical */}
      {isDismissible && (
        <button
          onClick={() => setDismissed((prev) => ({ ...prev, [visible.id]: true }))}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-faint)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Dismiss announcement"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
