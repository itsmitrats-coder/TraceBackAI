import React, { useState, useEffect } from 'react';
import { CampusLocationItem } from '../../types';
import { api } from '../../services/api';
import { MapPin, Flame, Shield, Compass, Layers, CheckCircle2 } from 'lucide-react';

interface CampusHeatmapWidgetProps {
  onSelectZone?: (zoneName: string) => void;
  className?: string;
}

export const CampusHeatmapWidget: React.FC<CampusHeatmapWidgetProps> = ({
  onSelectZone,
  className = '',
}) => {
  const [locations, setLocations] = useState<CampusLocationItem[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<CampusLocationItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const data = await api.getHeatmap();
        setLocations(data.locations || []);
        setHotspots(data.hotspots || []);
        if (data.locations && data.locations.length > 0) {
          setSelectedLoc(data.locations[0]);
        }
      } catch (e) {
        console.error('Failed to load heatmap data', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  const filteredLocations = filterCategory === 'all'
    ? locations
    : locations.filter((l) => l.category.toLowerCase() === filterCategory.toLowerCase());

  const handleZoneClick = (loc: CampusLocationItem) => {
    setSelectedLoc(loc);
    if (onSelectZone) {
      onSelectZone(loc.name);
    }
  };

  return (
    <div className={`rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            Interactive Campus Incident Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Real-time loss density, retrieval hotspots, and recovery statistics across campus zones
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {['all', 'academic', 'dining', 'residential', 'athletics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) & Zone Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Campus Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 relative overflow-hidden flex flex-col items-center">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            viewBox="0 0 100 100"
            className="w-full max-w-md h-auto select-none"
            style={{ minHeight: '320px' }}
          >
            {/* Campus Pathways & Quad Contour Lines */}
            <path
              d="M 15 80 Q 35 60 50 48 T 82 28"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
              strokeDasharray="2 2"
            />
            <path
              d="M 42 35 L 50 48 L 48 62"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
            />
            <path
              d="M 25 50 L 50 48 L 65 45"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
            />

            {/* Central Quad Lawn contour */}
            <circle cx="50" cy="48" r="14" fill="#064E3B" opacity="0.15" stroke="#059669" strokeWidth="0.5" strokeDasharray="1 1" />

            {/* Campus Zone Pins */}
            {filteredLocations.map((loc) => {
              const isSelected = selectedLoc?.id === loc.id;
              const intensity = loc.intensity || (loc.loss_count / 15);
              const heatColor = intensity > 0.6 ? '#EF4444' : intensity > 0.35 ? '#F59E0B' : '#3B82F6';

              return (
                <g
                  key={loc.id}
                  transform={`translate(${loc.x}, ${loc.y})`}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleZoneClick(loc)}
                >
                  {/* Heat Intensity Ring */}
                  <circle
                    r={isSelected ? 10 : 7 * (0.8 + intensity * 0.6)}
                    fill={heatColor}
                    opacity={isSelected ? 0.4 : 0.2}
                    className={intensity > 0.6 ? 'animate-pulse' : ''}
                  />

                  {/* Core Node */}
                  <circle
                    r={isSelected ? 3.8 : 2.8}
                    fill={isSelected ? '#FFFFFF' : heatColor}
                    stroke="#0B1120"
                    strokeWidth="1"
                  />

                  {/* Zone Code Label */}
                  <text
                    textAnchor="middle"
                    y={-5}
                    fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                    fontSize="3.2"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {loc.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> High Loss Zone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate Activity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Monitored Baseline
            </span>
          </div>
        </div>

        {/* Selected Zone Dossier & Density List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedLoc && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block mb-0.5">
                    ZONE INSPECTION DOSSIER
                  </span>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    {selectedLoc.name}
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                  {selectedLoc.code}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {selectedLoc.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center mb-4">
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">LOST</span>
                  <span className="text-base font-bold text-red-400 font-mono">
                    {selectedLoc.loss_count}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">FOUND</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {selectedLoc.found_count}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">RECOVERY</span>
                  <span className="text-base font-bold text-blue-400 font-mono">
                    {selectedLoc.recovery_rate}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Campus Security Patrolled
                </span>
                <button
                  onClick={() => onSelectZone && onSelectZone(selectedLoc.name)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
                >
                  View items here →
                </button>
              </div>
            </div>
          )}

          {/* Density Bars */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-3">
              HIGHEST REPORT DENSITY BY ZONE
            </span>
            <div className="space-y-2.5">
              {hotspots.slice(0, 4).map((h, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-medium">{h.zone}</span>
                    <span className="font-mono text-slate-400">{h.count} incidents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (h.count / 25) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
