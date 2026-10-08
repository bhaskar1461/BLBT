'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Percent,
  Brush,
  Type,
  Maximize,
  Scale,
  Ruler,
  Smile,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useChartStore, type ChartDrawing } from '@/stores/useChartStore';

interface Point {
  x: number;
  y: number;
}

export const ChartDrawingOverlay: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTool = useChartStore((s) => s.activeDrawingTool);
  const setActiveTool = useChartStore((s) => s.setActiveDrawingTool);
  const isMagnetMode = useChartStore((s) => s.isMagnetMode);
  const isLocked = useChartStore((s) => s.isDrawingsLocked);
  const isHidden = useChartStore((s) => s.isDrawingsHidden);
  const drawings = useChartStore((s) => s.drawings);
  const addDrawing = useChartStore((s) => s.addDrawing);
  const removeDrawing = useChartStore((s) => s.removeDrawing);
  const clearDrawings = useChartStore((s) => s.clearDrawings);
  const candles = useChartStore((s) => s.candles);

  // Drawing draft state
  const [draftStart, setDraftStart] = useState<Point | null>(null);
  const [currentHover, setCurrentHover] = useState<Point | null>(null);
  const [brushPoints, setBrushPoints] = useState<Point[]>([]);
  const [isBrushDrawing, setIsBrushDrawing] = useState(false);
  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState('Support / Resistance');

  const isDrawingActive = activeTool !== 'crosshair';

  // Global keyboard shortcuts for drawing management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraftStart(null);
        setCurrentHover(null);
        setIsBrushDrawing(false);
        setBrushPoints([]);
        setTextInputPos(null);
        setActiveTool('crosshair');
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !textInputPos && drawings.length > 0) {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          const last = drawings[drawings.length - 1];
          if (last) removeDrawing(last.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, textInputPos, drawings, removeDrawing]);

  // Helper to get relative coordinate inside overlay
  const getRelativeCoords = (e: React.PointerEvent | React.MouseEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Optional magnet snap simulation
    if (isMagnetMode && candles.length > 0) {
      // Round to nice grid increments
      y = Math.round(y / 8) * 8;
    }
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingActive || isLocked) return;
    const pt = getRelativeCoords(e);

    if (activeTool === 'brush') {
      setIsBrushDrawing(true);
      setBrushPoints([pt]);
      return;
    }

    if (activeTool === 'text') {
      setTextInputPos(pt);
      return;
    }

    if (activeTool === 'position') {
      // 1-click Risk-Reward Bracket
      const newDrawing: ChartDrawing = {
        id: `pos-${Date.now()}`,
        tool: 'position',
        color: '#089981',
        points: [
          { time: pt.x, price: pt.y },
          { time: Math.min(pt.x + 180, containerRef.current?.clientWidth || 300), price: pt.y },
        ],
        text: 'Risk 1.0% | Reward 2.0%',
      };
      addDrawing(newDrawing);
      setActiveTool('crosshair');
      return;
    }

    if (activeTool === 'patterns' || activeTool === 'icons') {
      // 1-click Pin / Pattern point
      const newDrawing: ChartDrawing = {
        id: `pin-${Date.now()}`,
        tool: activeTool,
        color: '#f59e0b',
        points: [{ time: pt.x, price: pt.y }],
        text: activeTool === 'patterns' ? 'Pivot P1' : '⭐ Key Level',
      };
      addDrawing(newDrawing);
      setActiveTool('crosshair');
      return;
    }

    // 2-Point Tools: trendline, measure, fib
    if (!draftStart) {
      setDraftStart(pt);
      setCurrentHover(pt);
    } else {
      // Complete drawing
      const newDrawing: ChartDrawing = {
        id: `draw-${Date.now()}`,
        tool: activeTool,
        color: activeTool === 'measure' ? '#2962ff' : activeTool === 'fib' ? '#f59e0b' : '#2962ff',
        points: [
          { time: draftStart.x, price: draftStart.y },
          { time: pt.x, price: pt.y },
        ],
      };
      addDrawing(newDrawing);
      setDraftStart(null);
      setCurrentHover(null);
      setActiveTool('crosshair');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingActive) return;
    const pt = getRelativeCoords(e);

    if (activeTool === 'brush' && isBrushDrawing) {
      setBrushPoints((prev) => [...prev, pt]);
      return;
    }

    if (draftStart) {
      setCurrentHover(pt);
    }
  };

  const handlePointerUp = () => {
    if (activeTool === 'brush' && isBrushDrawing) {
      if (brushPoints.length > 2) {
        const newDrawing: ChartDrawing = {
          id: `brush-${Date.now()}`,
          tool: 'brush',
          color: '#2962ff',
          points: brushPoints.map((p) => ({ time: p.x, price: p.y })),
        };
        addDrawing(newDrawing);
      }
      setIsBrushDrawing(false);
      setBrushPoints([]);
      setActiveTool('crosshair');
    }
  };

  const handleSaveTextNote = () => {
    if (!textInputPos) return;
    const newDrawing: ChartDrawing = {
      id: `text-${Date.now()}`,
      tool: 'text',
      color: '#d1d4dc',
      points: [{ time: textInputPos.x, price: textInputPos.y }],
      text: textInputValue.trim() || 'Key Level',
    };
    addDrawing(newDrawing);
    setTextInputPos(null);
    setTextInputValue('Support / Resistance');
    setActiveTool('crosshair');
  };

  const toolLabels: Record<string, { name: string; instruction: string; icon: React.ElementType }> = {
    trendline: { name: 'Trend Line', instruction: draftStart ? 'Click 2nd point to place line' : 'Click 1st point to start', icon: TrendingUp },
    fib: { name: 'Fib Retracement', instruction: draftStart ? 'Click 2nd anchor to set levels' : 'Click high/low anchor to start', icon: Percent },
    brush: { name: 'Brush', instruction: 'Drag mouse to draw freehand marker', icon: Brush },
    text: { name: 'Text Note', instruction: 'Click anywhere on chart to place note', icon: Type },
    patterns: { name: 'Pattern / Wave', instruction: 'Click to mark structural wave pivot', icon: Maximize },
    position: { name: 'Position Tool', instruction: 'Click to place 1% Risk / Reward bracket', icon: Scale },
    measure: { name: 'Measure', instruction: draftStart ? 'Click 2nd point to measure delta' : 'Click 1st point to start measuring', icon: Ruler },
    icons: { name: 'Marker', instruction: 'Click to drop sentiment pin', icon: Smile },
  };

  const activeMeta = toolLabels[activeTool];

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute inset-0 z-20 select-none overflow-hidden ${
        isDrawingActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      }`}
    >
      {/* Floating Active Tool Action Strip */}
      {isDrawingActive && activeMeta && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 bg-[#1e222d]/95 backdrop-blur-md border border-[#2962ff]/50 shadow-2xl px-3.5 py-1.5 rounded-full text-xs text-[#d1d4dc] pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            {React.createElement(activeMeta.icon, { size: 14, className: 'text-[#2962ff]' })}
            <span>{activeMeta.name}</span>
          </div>

          <span className="text-[#787b86] text-[11px] hidden sm:inline">
            • {activeMeta.instruction}
          </span>

          <div className="flex items-center gap-1 ml-1 border-l border-[#2a2e39] pl-2">
            <button
              onClick={() => {
                setDraftStart(null);
                setCurrentHover(null);
                setActiveTool('crosshair');
              }}
              className="px-2 py-0.5 rounded bg-[#2962ff] hover:bg-[#1d4ed8] text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
              title="Finish or cancel drawing mode"
            >
              <Check size={11} />
              <span>Done</span>
            </button>

            {drawings.length > 0 && (
              <button
                onClick={() => clearDrawings()}
                className="px-2 py-0.5 rounded bg-[#f23645]/20 hover:bg-[#f23645]/30 text-[#f23645] text-[10px] font-medium flex items-center gap-1 transition-colors"
                title="Clear all drawings"
              >
                <RotateCcw size={11} />
                <span>Clear ({drawings.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent floating pill when drawings exist, so user knows what the line is and can clear it */}
      {!isDrawingActive && drawings.length > 0 && !isHidden && (
        <div className="absolute top-2.5 right-14 z-30 flex items-center gap-1.5 bg-[#1e222d]/90 backdrop-blur border border-[#2a2e39] px-2 py-1 rounded-[4px] text-[11px] text-[#787b86] pointer-events-auto shadow-md">
          <span>{drawings.length} custom drawing{drawings.length > 1 ? 's' : ''}</span>
          <button
            onClick={() => clearDrawings()}
            className="text-[#f23645] hover:text-[#ff4a5a] px-1 py-0.5 rounded hover:bg-[#2a2e39] font-medium transition-colors"
            title="Clear all drawings from chart"
          >
            Clear
          </button>
        </div>
      )}

      {/* Inline Text Input Modal on Chart */}
      {textInputPos && (
        <div
          style={{ left: Math.min(textInputPos.x, (containerRef.current?.clientWidth || 400) - 240), top: textInputPos.y + 10 }}
          className="absolute z-50 bg-[#1e222d] border border-[#2962ff] shadow-2xl rounded-lg p-2.5 w-60 pointer-events-auto"
        >
          <div className="text-[11px] font-semibold text-white mb-1.5 flex items-center justify-between">
            <span>Chart Annotation Note</span>
            <button onClick={() => setTextInputPos(null)} className="text-[#787b86] hover:text-white">
              <X size={12} />
            </button>
          </div>
          <input
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTextNote()}
            placeholder="e.g. Resistance 85k, Order block..."
            className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#2962ff] mb-2"
            autoFocus
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setTextInputPos(null)}
              className="px-2 py-0.5 text-[10px] rounded bg-[#2a2e39] text-[#787b86] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTextNote}
              className="px-2 py-0.5 text-[10px] rounded bg-[#2962ff] text-white font-medium hover:bg-[#1d4ed8]"
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* SVG Canvas for Saved Drawings & Active Drafts */}
      {!isHidden && (
        <svg className="w-full h-full pointer-events-none">
          {/* 1. Saved Drawings */}
          {drawings.map((d) => {
            if (d.tool === 'trendline' && d.points.length >= 2) {
              const [p1, p2] = d.points;
              return (
                <g key={d.id} className="pointer-events-auto group cursor-pointer">
                  <line
                    x1={p1.time}
                    y1={p1.price}
                    x2={p2.time}
                    y2={p2.price}
                    stroke={d.color || '#2962ff'}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <circle cx={p1.time} cy={p1.price} r={3.5} fill="#2962ff" stroke="#ffffff" strokeWidth={1} />
                  <circle cx={p2.time} cy={p2.price} r={3.5} fill="#2962ff" stroke="#ffffff" strokeWidth={1} />
                  {!isLocked && (
                    <circle
                      cx={(p1.time + p2.time) / 2}
                      cy={(p1.price + p2.price) / 2}
                      r={6}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDrawing(d.id);
                      }}
                    />
                  )}
                </g>
              );
            }

            if (d.tool === 'measure' && d.points.length >= 2) {
              const [p1, p2] = d.points;
              const xMin = Math.min(p1.time, p2.time);
              const yMin = Math.min(p1.price, p2.price);
              const w = Math.abs(p2.time - p1.time);
              const h = Math.abs(p2.price - p1.price);
              const isUp = p2.price < p1.price;
              const pctChange = ((h / Math.max(1, p1.price)) * 100).toFixed(2);

              return (
                <g key={d.id} className="pointer-events-auto group">
                  <rect
                    x={xMin}
                    y={yMin}
                    width={w}
                    height={h}
                    fill={isUp ? 'rgba(8, 153, 129, 0.15)' : 'rgba(242, 54, 69, 0.15)'}
                    stroke={isUp ? '#089981' : '#f23645'}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={xMin + 5}
                    y={yMin + 5}
                    width={118}
                    height={22}
                    rx={3}
                    fill="#1e222d"
                    stroke="#2a2e39"
                    className="cursor-pointer hover:stroke-[#f23645] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) removeDrawing(d.id);
                    }}
                  />
                  <text
                    x={xMin + 10}
                    y={yMin + 20}
                    fill={isUp ? '#089981' : '#f23645'}
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) removeDrawing(d.id);
                    }}
                  >
                    {isUp ? '+' : '-'}{pctChange}% ({Math.round(w / 10)}b) ✕
                  </text>
                  {!isLocked && (
                    <circle
                      cx={xMin + w}
                      cy={yMin}
                      r={5}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            if (d.tool === 'fib' && d.points.length >= 2) {
              const [p1, p2] = d.points;
              const y1 = p1.price;
              const y2 = p2.price;
              const xLeft = Math.min(p1.time, p2.time);
              const xRight = Math.max(p1.time, p2.time) + 200;
              const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
              const colors = ['#787b86', '#089981', '#2962ff', '#f59e0b', '#f23645', '#9333ea', '#787b86'];

              return (
                <g key={d.id} className="pointer-events-auto group">
                  {levels.map((lvl, idx) => {
                    const y = y1 + (y2 - y1) * lvl;
                    return (
                      <g key={lvl}>
                        <line
                          x1={xLeft}
                          y1={y}
                          x2={xRight}
                          y2={y}
                          stroke={colors[idx]}
                          strokeWidth={1}
                          strokeDasharray={lvl === 0.5 ? 'none' : '2 2'}
                        />
                        <text
                          x={xLeft + 5}
                          y={y - 3}
                          fill={colors[idx]}
                          fontSize={9}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {lvl.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}
                  {!isLocked && (
                    <circle
                      cx={xLeft}
                      cy={y1}
                      r={5}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            if (d.tool === 'brush' && d.points.length > 1) {
              const pathStr = d.points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.time} ${p.price}`, '');
              return (
                <g key={d.id} className="pointer-events-auto group">
                  {/* Invisible hit area for easy 1-click removal */}
                  {!isLocked && (
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={16}
                      className="cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    >
                      <title>Click to remove brush drawing</title>
                    </path>
                  )}
                  <path
                    d={pathStr}
                    fill="none"
                    stroke={d.color || '#2962ff'}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={!isLocked ? 'cursor-pointer hover:stroke-[#f23645] transition-colors' : ''}
                    onClick={() => {
                      if (!isLocked) removeDrawing(d.id);
                    }}
                  />
                  {!isLocked && (
                    <circle
                      cx={d.points[0].time}
                      cy={d.points[0].price}
                      r={5}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            if (d.tool === 'text' && d.points.length > 0) {
              const p = d.points[0];
              return (
                <g key={d.id} className="pointer-events-auto group cursor-default">
                  <rect
                    x={p.time}
                    y={p.price - 16}
                    width={Math.max(80, (d.text?.length || 8) * 8 + 16)}
                    height={22}
                    rx={4}
                    fill="#1e222d"
                    stroke="#2962ff"
                    strokeWidth={1}
                  />
                  <text
                    x={p.time + 8}
                    y={p.price - 2}
                    fill="#f0f3fa"
                    fontSize={11}
                    fontWeight="500"
                  >
                    {d.text}
                  </text>
                  {!isLocked && (
                    <circle
                      cx={p.time + Math.max(80, (d.text?.length || 8) * 8 + 16)}
                      cy={p.price - 16}
                      r={5}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            if (d.tool === 'position' && d.points.length >= 2) {
              const [p1, p2] = d.points;
              const w = Math.max(120, p2.time - p1.time);
              const targetH = 45;
              const stopH = 25;

              return (
                <g key={d.id} className="pointer-events-auto group">
                  {/* Take Profit Zone (Green) */}
                  <rect
                    x={p1.time}
                    y={p1.price - targetH}
                    width={w}
                    height={targetH}
                    fill="rgba(8, 153, 129, 0.2)"
                    stroke="#089981"
                    strokeWidth={1}
                  />
                  {/* Entry Line */}
                  <line
                    x1={p1.time}
                    y1={p1.price}
                    x2={p1.time + w}
                    y2={p1.price}
                    stroke="#787b86"
                    strokeWidth={1.5}
                  />
                  {/* Stop Loss Zone (Red) */}
                  <rect
                    x={p1.time}
                    y={p1.price}
                    width={w}
                    height={stopH}
                    fill="rgba(242, 54, 69, 0.2)"
                    stroke="#f23645"
                    strokeWidth={1}
                  />
                  {/* Label */}
                  <text
                    x={p1.time + 6}
                    y={p1.price - 12}
                    fill="#089981"
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    TP: +2.0%
                  </text>
                  <text
                    x={p1.time + 6}
                    y={p1.price + 16}
                    fill="#f23645"
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    SL: -1.0% (Risk Cap)
                  </text>
                  {!isLocked && (
                    <circle
                      cx={p1.time + w}
                      cy={p1.price - targetH}
                      r={5}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            if ((d.tool === 'patterns' || d.tool === 'icons') && d.points.length > 0) {
              const p = d.points[0];
              return (
                <g key={d.id} className="pointer-events-auto group">
                  <circle cx={p.time} cy={p.price} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={1.5} />
                  <text x={p.time + 9} y={p.price + 3} fill="#f59e0b" fontSize={10} fontWeight="bold">
                    {d.text}
                  </text>
                  {!isLocked && (
                    <circle
                      cx={p.time}
                      cy={p.price}
                      r={6}
                      fill="#f23645"
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => removeDrawing(d.id)}
                    />
                  )}
                </g>
              );
            }

            return null;
          })}

          {/* 2. Active Draft Live Preview */}
          {draftStart && currentHover && (
            <g className="pointer-events-none">
              {activeTool === 'trendline' && (
                <>
                  <line
                    x1={draftStart.x}
                    y1={draftStart.y}
                    x2={currentHover.x}
                    y2={currentHover.y}
                    stroke="#2962ff"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                  <circle cx={draftStart.x} cy={draftStart.y} r={4} fill="#2962ff" />
                  <circle cx={currentHover.x} cy={currentHover.y} r={4} fill="#2962ff" />
                </>
              )}

              {activeTool === 'measure' && (
                <>
                  <rect
                    x={Math.min(draftStart.x, currentHover.x)}
                    y={Math.min(draftStart.y, currentHover.y)}
                    width={Math.abs(currentHover.x - draftStart.x)}
                    height={Math.abs(currentHover.y - draftStart.y)}
                    fill="rgba(41, 98, 255, 0.15)"
                    stroke="#2962ff"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={Math.min(draftStart.x, currentHover.x) + 8}
                    y={Math.min(draftStart.y, currentHover.y) + 16}
                    fill="#2962ff"
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Δ {Math.abs(currentHover.y - draftStart.y).toFixed(0)} pts
                  </text>
                </>
              )}

              {activeTool === 'fib' && (
                <>
                  <line
                    x1={draftStart.x}
                    y1={draftStart.y}
                    x2={currentHover.x}
                    y2={currentHover.y}
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <circle cx={draftStart.x} cy={draftStart.y} r={4} fill="#f59e0b" />
                  <circle cx={currentHover.x} cy={currentHover.y} r={4} fill="#f59e0b" />
                </>
              )}
            </g>
          )}

          {/* Active Brush Stroke */}
          {activeTool === 'brush' && brushPoints.length > 1 && (
            <path
              d={brushPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              fill="none"
              stroke="#2962ff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </div>
  );
};
