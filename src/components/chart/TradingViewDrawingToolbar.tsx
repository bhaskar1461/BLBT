'use client';

import React, { useState } from 'react';
import {
  Crosshair,
  TrendingUp,
  Percent,
  Brush,
  Type,
  Maximize,
  Scale,
  Ruler,
  Magnet,
  Lock,
  Eye,
  Trash2,
  Smile,
  Circle,
  HelpCircle,
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  icon: React.ElementType;
  shortcut?: string;
}

const TOOLS: ToolItem[] = [
  { id: 'crosshair', name: 'Crosshair', icon: Crosshair, shortcut: 'C' },
  { id: 'trendline', name: 'Trend Line', icon: TrendingUp, shortcut: 'Alt+T' },
  { id: 'fib', name: 'Fib Retracement', icon: Percent, shortcut: 'Alt+F' },
  { id: 'brush', name: 'Brush & Geometric Shapes', icon: Brush, shortcut: 'Alt+B' },
  { id: 'text', name: 'Text Note', icon: Type, shortcut: 'Alt+N' },
  { id: 'patterns', name: 'Patterns & Waves', icon: Maximize },
  { id: 'position', name: 'Long / Short Position Tool', icon: Scale, shortcut: 'Alt+P' },
  { id: 'measure', name: 'Measure (Date & Price Range)', icon: Ruler, shortcut: 'Shift+Click' },
  { id: 'icons', name: 'Stickers & Icons', icon: Smile },
];

export const TradingViewDrawingToolbar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('crosshair');
  const [isMagnetActive, setIsMagnetActive] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  return (
    <aside
      className="w-11 bg-[#131722] border-r border-[#2a2e39] flex flex-col items-center py-2 select-none shrink-0 z-10 transition-colors"
      aria-label="TradingView Drawing Tools"
    >
      {/* Top Main Tools */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-8 h-8 rounded flex items-center justify-center relative group transition-colors ${
                isActive
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
              title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {/* Tooltip on Hover */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {tool.name} {tool.shortcut && <span className="text-[#787b86] ml-1">({tool.shortcut})</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-6 h-[1px] bg-[#2a2e39] my-2" />

      {/* Utilities: Magnet, Lock, Hide, Trash */}
      <div className="flex flex-col items-center gap-1 w-full px-1 mt-auto">
        {/* Magnet Tool */}
        <button
          onClick={() => setIsMagnetActive(!isMagnetActive)}
          className={`w-8 h-8 rounded flex items-center justify-center relative group transition-colors ${
            isMagnetActive
              ? 'bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/40'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Magnet Mode (Snap to OHLC)"
        >
          <Magnet size={16} strokeWidth={1.75} />
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Magnet Mode {isMagnetActive ? '(Active)' : '(Off)'}
          </div>
        </button>

        {/* Lock Drawings */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`w-8 h-8 rounded flex items-center justify-center relative group transition-colors ${
            isLocked
              ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Lock All Drawings"
        >
          <Lock size={16} strokeWidth={1.75} />
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {isLocked ? 'Unlock Drawings' : 'Lock All Drawings'}
          </div>
        </button>

        {/* Hide Drawings */}
        <button
          onClick={() => setIsHidden(!isHidden)}
          className={`w-8 h-8 rounded flex items-center justify-center relative group transition-colors ${
            isHidden
              ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Hide All Drawings"
        >
          <Eye size={16} strokeWidth={1.75} />
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {isHidden ? 'Show Drawings' : 'Hide All Drawings'}
          </div>
        </button>

        {/* Clear Drawings / Trash */}
        <button
          onClick={() => {
            if (window.confirm('Remove all custom chart drawings?')) {
              setActiveTool('crosshair');
            }
          }}
          className="w-8 h-8 rounded flex items-center justify-center relative group text-[#787b86] hover:text-[#f23645] hover:bg-[#1e222d] transition-colors"
          title="Remove All Drawings"
        >
          <Trash2 size={16} strokeWidth={1.75} />
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Remove All Drawings
          </div>
        </button>
      </div>
    </aside>
  );
};
