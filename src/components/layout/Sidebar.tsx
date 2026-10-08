'use client';

import React from 'react';
import { Watchlist } from '../watchlist/Watchlist';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-subtle bg-surface flex flex-col shrink-0 overflow-hidden transition-all duration-200">
      <Watchlist />
    </aside>
  );
};
