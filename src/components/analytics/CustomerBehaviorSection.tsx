import React, { useState, useMemo } from 'react';
import { MousePointer, ArrowDown, Eye, Layers, Compass } from 'lucide-react';
import { HeatmapClickPoint, TopClickedElement, ScrollRetentionItem } from '../../types/analytics';

interface CustomerBehaviorSectionProps {
  heatmapClicks?: HeatmapClickPoint[];
  topClickedElements?: TopClickedElement[];
  scrollRetention?: ScrollRetentionItem[];
}

const PLACEMENT_OPTIONS = [
  { id: 'all', label: 'All Screens' },
  { id: 'home', label: 'Homepage' },
  { id: 'menu', label: 'Menu Catalog' },
  { id: 'cart', label: 'Cart Checkout' },
  { id: 'daily_run', label: 'Daily Run Game' }
];

export const CustomerBehaviorSection: React.FC<CustomerBehaviorSectionProps> = ({
  heatmapClicks = [],
  topClickedElements = [],
  scrollRetention = []
}) => {
  const [selectedPlacement, setSelectedPlacement] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapClickPoint | null>(null);

  // Filter clicks by selected placement
  const filteredClicks = useMemo(() => {
    if (selectedPlacement === 'all') return heatmapClicks;
    return heatmapClicks.filter(c => {
      const p = (c.placement || '').toLowerCase();
      if (selectedPlacement === 'home') return p.includes('home') || p === '/' || p.includes('hero');
      if (selectedPlacement === 'menu') return p.includes('menu') || p.includes('product');
      if (selectedPlacement === 'cart') return p.includes('cart') || p.includes('checkout');
      if (selectedPlacement === 'daily_run') return p.includes('daily_run') || p.includes('game') || p.includes('run');
      return true;
    });
  }, [heatmapClicks, selectedPlacement]);

  // Filter top clicked elements
  const filteredTopElements = useMemo(() => {
    if (selectedPlacement === 'all') return topClickedElements.slice(0, 8);
    return topClickedElements.filter(e => {
      const p = (e.placement || '').toLowerCase();
      if (selectedPlacement === 'home') return p.includes('home') || p === '/' || p.includes('hero');
      if (selectedPlacement === 'menu') return p.includes('menu') || p.includes('product');
      if (selectedPlacement === 'cart') return p.includes('cart') || p.includes('checkout');
      if (selectedPlacement === 'daily_run') return p.includes('daily_run') || p.includes('game');
      return true;
    }).slice(0, 8);
  }, [topClickedElements, selectedPlacement]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <MousePointer size={16} className="text-orange-400" />
          <span>7. Customer Behavior & Heat Map</span>
        </h2>
        <p className="text-xs text-slate-400">
          Spatial interaction tracking, element engagement, and scroll depth retention
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Wireframe Heatmap (2 cols on large) */}
        <div className="lg:col-span-2 bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Interaction Wireframe & Click Density
              </h3>
            </div>

            {/* Screen Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {PLACEMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPlacement(opt.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedPlacement === opt.id
                      ? 'bg-orange-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Wireframe Canvas Container */}
          <div className="relative w-full h-80 bg-[#0a0d14] rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between">
            {/* Wireframe UI Elements background representation */}
            <div className="absolute inset-0 pointer-events-none p-3 opacity-30 flex flex-col justify-between">
              {/* Wireframe Header */}
              <div className="h-6 w-full bg-slate-800 rounded-lg flex items-center px-3 justify-between">
                <div className="w-16 h-2 bg-slate-700 rounded"></div>
                <div className="flex gap-2">
                  <div className="w-10 h-2 bg-slate-700 rounded"></div>
                  <div className="w-10 h-2 bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Wireframe Hero / Content */}
              <div className="space-y-2 py-4">
                <div className="w-48 h-4 bg-slate-800 rounded mx-auto"></div>
                <div className="w-64 h-2 bg-slate-800/80 rounded mx-auto"></div>
                <div className="flex justify-center gap-3 pt-3">
                  <div className="w-24 h-8 bg-orange-500/20 border border-orange-500/40 rounded-lg"></div>
                  <div className="w-24 h-8 bg-slate-800 rounded-lg"></div>
                </div>
              </div>

              {/* Wireframe Product / Card Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-slate-800/60 rounded-lg border border-slate-800"></div>
                <div className="h-16 bg-slate-800/60 rounded-lg border border-slate-800"></div>
                <div className="h-16 bg-slate-800/60 rounded-lg border border-slate-800"></div>
              </div>
            </div>

            {/* Plotted Click Points */}
            {filteredClicks.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
                <MousePointer size={24} className="text-slate-600 mb-2" />
                <span className="text-xs font-mono text-slate-400 font-bold">
                  No interaction map data yet
                </span>
                <span className="text-[10px] font-mono text-slate-600 mt-1">
                  Click interactions will plot in real-time as users browse {selectedPlacement}.
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 z-10">
                {filteredClicks.map((pt, idx) => {
                  const left = Math.min(Math.max(pt.x_normalized, 4), 96);
                  const top = Math.min(Math.max(pt.y_normalized, 6), 94);
                  return (
                    <div
                      key={pt.id || idx}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    >
                      {/* Radial Heat Glow */}
                      <span className="absolute -inset-2 rounded-full bg-orange-500/30 blur-xs group-hover:bg-orange-400/60 transition-colors"></span>
                      {/* Core Dot */}
                      <span className="relative block w-2.5 h-2.5 rounded-full bg-orange-400 border border-white/80 shadow-md group-hover:scale-125 transition-transform"></span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Tooltip */}
            {hoveredPoint && (
              <div
                style={{
                  left: `${Math.min(Math.max(hoveredPoint.x_normalized, 15), 85)}%`,
                  top: `${Math.min(Math.max(hoveredPoint.y_normalized + 8, 12), 85)}%`
                }}
                className="absolute z-20 -translate-x-1/2 bg-[#121722] border border-orange-500/40 text-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono shadow-xl pointer-events-none space-y-0.5"
              >
                <div className="font-bold text-orange-400">
                  {hoveredPoint.element_id || hoveredPoint.placement}
                </div>
                <div className="text-slate-400">
                  Type: {hoveredPoint.element_type || 'button'} • X: {hoveredPoint.x_normalized}%, Y: {hoveredPoint.y_normalized}%
                </div>
              </div>
            )}

            {/* Bottom Status Bar */}
            <div className="relative z-10 bg-[#121722]/90 border-t border-slate-800 p-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Plotted Interactions: <strong className="text-slate-200">{filteredClicks.length} clicks</strong></span>
              <span className="text-slate-500">Normalized coordinates (0-100%)</span>
            </div>
          </div>
        </div>

        {/* Top Clicked Elements & Scroll Retention (1 col on large) */}
        <div className="space-y-4">
          {/* Top Clicked Elements */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Top Clicked Elements
              </span>
              <span className="text-[10px] font-mono text-slate-500">Clicks</span>
            </div>

            <div className="space-y-1.5">
              {filteredTopElements.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-2">No elements recorded yet</p>
              ) : (
                filteredTopElements.map((el, idx) => (
                  <div
                    key={el.element_id || idx}
                    className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/40 last:border-0"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                      <span className="text-slate-200 font-medium">{el.element_id}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{el.placement}</span>
                    </div>
                    <span className="text-orange-400 font-bold ml-2">{el.count.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scroll Retention Depth Visualizer */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <ArrowDown size={14} className="text-emerald-400" />
                <span>Scroll Retention Depth</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">% Visitors</span>
            </div>

            <div className="space-y-2.5">
              {scrollRetention.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-2">No scroll data recorded</p>
              ) : (
                scrollRetention.map((s) => (
                  <div key={s.depth} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{s.depth}% Depth</span>
                      <span className="text-emerald-400 font-bold">
                        {s.retentionPercent.toFixed(1)}% ({s.visitorsReached.toLocaleString()} visitors)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#0a0d14] rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${Math.min(s.retentionPercent, 100)}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all"
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
