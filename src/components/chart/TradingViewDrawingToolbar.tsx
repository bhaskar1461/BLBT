'use client';

import React from 'react';
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
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Smile,
} from 'lucide-react';
import { useChartStore } from '@/stores/useChartStore';

interface ToolItem {
  id: string;
  name: string;
  icon: React.ElementType;
  shortcut?: string;
  description: string;
}

const TOOLS: ToolItem[] = [
  { id: 'crosshair', name: 'Crosshair', icon: Crosshair, shortcut: 'C', description: 'Standard chart inspect & crosshair' },
  { id: 'trendline', name: 'Trend Line', icon: TrendingUp, shortcut: 'Alt+T', description: 'Click 2 points to draw line' },
  { id: 'fib', name: 'Fib Retracement', icon: Percent, shortcut: 'Alt+F', description: 'Click high & low anchors' },
  { id: 'brush', name: 'Brush & Freehand', icon: Brush, shortcut: 'Alt+B', description: 'Freehand marker on chart' },
  { id: 'text', name: 'Text Annotation', icon: Type, shortcut: 'Alt+N', description: 'Click to place note on chart' },
  { id: 'patterns', name: 'Patterns & Waves', icon: Maximize, description: 'Mark chart waves and structure' },
  { id: 'position', name: 'Long / Short Position', icon: Scale, shortcut: 'Alt+P', description: 'Risk / Reward bracket with 1% risk cap' },
  { id: 'measure', name: 'Measure (Ruler)', icon: Ruler, shortcut: 'Shift+Click', description: 'Measure price & bar delta' },
  { id: 'icons', name: 'Stickers & Markers', icon: Smile, description: 'Pin sentiment marker on candle' },
];

export const TradingViewDrawingToolbar: React.FC = () => {
  const activeTool = useChartStore((s) => s.activeDrawingTool);
  const setActiveTool = useChartStore((s) => s.setActiveDrawingTool);
  const isMagnetActive = useChartStore((s) => s.isMagnetMode);
  const setMagnetMode = useChartStore((s) => s.setMagnetMode);
  const isLocked = useChartStore((s) => s.isDrawingsLocked);
  const setDrawingsLocked = useChartStore((s) => s.setDrawingsLocked);
  const isHidden = useChartStore((s) => s.isDrawingsHidden);
  const setDrawingsHidden = useChartStore((s) => s.setDrawingsHidden);
  const drawings = useChartStore((s) => s.drawings);
  const clearDrawings = useChartStore((s) => s.clearDrawings);

  const handleSelectTool = (toolId: string) => {
    if (activeTool === toolId && toolId !== 'crosshair') {
      setActiveTool('crosshair');
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <aside
      className="hidden lg:flex w-11 bg-[#131722] border-r border-[#2a2e39] flex-col items-center py-2 select-none shrink-0 z-20 transition-colors"
      aria-label="TradingView Drawing Tools"
    >
      {/* Top Main Drawing Tools */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleSelectTool(tool.id)}
              className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all duration-150 ${
                isActive
                  ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/40'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
              }`}
              title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} />

              {/* Active Indicator Pip */}
              {isActive && tool.id !== 'crosshair' && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#2962ff]" />
              )}

              {/* Tooltip on Hover */}
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded-md shadow-2xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>{tool.name}</span>
                  {tool.shortcut && <span className="text-[#2962ff] text-[10px]">({tool.shortcut})</span>}
                </div>
                <div className="text-[10px] text-[#787b86] mt-0.5">{tool.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-6 h-[1px] bg-[#2a2e39] my-2" />

      {/* Utilities: Magnet, Lock, Hide, Trash */}
      <div className="flex flex-col items-center gap-1 w-full px-1 mt-auto">
        {/* Magnet Tool (Snap to OHLC) */}
        <button
          onClick={() => setMagnetMode(!isMagnetActive)}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all ${
            isMagnetActive
              ? 'bg-[#1e222d] text-[#2962ff] ring-1 ring-[#2962ff]/30'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title="Magnet Mode (Snap to OHLC)"
        >
          <Magnet size={15} strokeWidth={isMagnetActive ? 2.2 : 1.75} />
          <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="text-white font-semibold">Magnet Mode: {isMagnetActive ? 'ON' : 'OFF'}</div>
            <div className="text-[10px] text-[#787b86]">Snap drawing points to candle High / Low</div>
          </div>
        </button>

        {/* Lock Drawings */}
        <button
          onClick={() => setDrawingsLocked(!isLocked)}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all ${
            isLocked
              ? 'bg-[#1e222d] text-[#f59e0b] ring-1 ring-[#f59e0b]/30'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title={isLocked ? 'Unlock All Drawings' : 'Lock All Drawings'}
        >
          {isLocked ? <Lock size={15} strokeWidth={2} /> : <Unlock size={15} strokeWidth={1.75} />}
          <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="text-white font-semibold">{isLocked ? 'Drawings Locked' : 'Lock Drawings'}</div>
            <div className="text-[10px] text-[#787b86]">Prevent accidental modification</div>
          </div>
        </button>

        {/* Hide / Show Drawings */}
        <button
          onClick={() => setDrawingsHidden(!isHidden)}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all ${
            isHidden
              ? 'bg-[#1e222d] text-[#f23645] ring-1 ring-[#f23645]/30'
              : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]'
          }`}
          title={isHidden ? 'Show Custom Drawings' : 'Hide Custom Drawings'}
        >
          {isHidden ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={1.75} />}
          <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="text-white font-semibold">{isHidden ? 'Drawings Hidden' : 'Hide Drawings'}</div>
            <div className="text-[10px] text-[#787b86]">Toggle drawing overlay visibility</div>
          </div>
        </button>

        {/* Clear Drawings / Trash */}
        <button
          onClick={() => clearDrawings()}
          disabled={drawings.length === 0}
          className={`w-8 h-8 rounded-[4px] flex items-center justify-center relative group transition-all ${
            drawings.length > 0
              ? 'text-[#787b86] hover:text-[#f23645] hover:bg-[#1e222d] active:scale-95'
              : 'text-[#434651] cursor-not-allowed opacity-40'
          }`}
          title="Remove All Drawings"
        >
          <Trash2 size={15} strokeWidth={1.75} />
          {drawings.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1 rounded-full bg-[#f23645] text-white text-[9px] font-bold min-w-3.5 h-3.5 flex items-center justify-center">
              {drawings.length}
            </span>
          )}
          <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc] text-[11px] font-medium rounded shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="text-white font-semibold">Remove All Drawings</div>
            <div className="text-[10px] text-[#787b86]">{drawings.length} drawing(s) placed</div>
          </div>
        </button>
      </div>
    </aside>
  );
};
