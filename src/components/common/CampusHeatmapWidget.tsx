import React, { useState, useEffect } from 'react';
import { CampusLocationItem } from '../../types';
import { api } from '../../services/api';
import { MapPin, Flame, CheckCircle2 } from 'lucide-react';

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
    <div className={`rounded-[20px] bg-white border border-[#EAEAEA] p-6 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">📍</span>
            <h3 className="text-base font-extrabold text-[#171717]">
              Campus Lost & Found Map
            </h3>
          </div>
          <p className="text-xs text-[#666666]">
            See which spots on campus have the most reports and recovered items
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-[12px] bg-[#F5F5F5] border border-[#EAEAEA] text-xs">
          {['all', 'academic', 'dining', 'residential', 'athletics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-[9px] capitalize font-semibold transition ${
                filterCategory === cat
                  ? 'bg-white text-[#E53935] shadow-xs border border-[#EAEAEA]'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Map on Left, Zone Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 rounded-[16px] bg-[#FAFAFA] border border-[#EAEAEA] p-4 relative overflow-hidden flex flex-col items-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full max-w-md h-auto select-none"
            style={{ minHeight: '300px' }}
          >
            {/* Campus Pathways */}
            <path
              d="M 15 80 Q 35 60 50 48 T 82 28"
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="3"
              strokeDasharray="2 2"
            />
            <path
              d="M 42 35 L 50 48 L 48 62"
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="3"
            />
            <path
              d="M 25 50 L 50 48 L 65 45"
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="3"
            />

            {/* Central Quad Green Lawn */}
            <circle cx="50" cy="48" r="14" fill="#E8F5E9" stroke="#C8E6C9" strokeWidth="1" />
            <text x="50" y="49" textAnchor="middle" fill="#2E7D32" fontSize="2.8" fontWeight="bold">
              Campus Quad
            </text>

            {/* Campus Zone Pins */}
            {filteredLocations.map((loc) => {
              const isSelected = selectedLoc?.id === loc.id;
              const intensity = loc.intensity || (loc.loss_count / 15);
              const isHigh = intensity > 0.5;

              return (
                <g
                  key={loc.id}
                  transform={`translate(${loc.x}, ${loc.y})`}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleZoneClick(loc)}
                >
                  {/* Subtle Red Heat Aura */}
                  <circle
                    r={isSelected ? 10 : 6 + intensity * 4}
                    fill={isHigh ? '#E53935' : '#FF8A80'}
                    opacity={isSelected ? 0.35 : 0.18}
                  />

                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? 4 : 3}
                    fill={isSelected ? '#E53935' : '#FFFFFF'}
                    stroke="#E53935"
                    strokeWidth="1.5"
                  />

                  {/* Pin Dot / Code */}
                  <text
                    textAnchor="middle"
                    y={-5}
                    fill={isSelected ? '#C62828' : '#171717'}
                    fontSize="3"
                    fontWeight="bold"
                  >
                    {loc.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="w-full flex items-center justify-between pt-3 border-t border-[#EAEAEA] text-[11px] text-[#666666]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" /> More reports
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A80]" /> Normal activity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8F5E9] border border-[#A5D6A7]" /> Green quad
            </span>
          </div>
        </div>

        {/* Selected Zone Dossier (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedLoc && (
            <div className="p-5 rounded-[16px] bg-white border border-[#EAEAEA] shadow-xs">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E53935] block mb-0.5">
                    SELECTED AREA
                  </span>
                  <h4 className="text-base font-extrabold text-[#171717] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E53935]" />
                    {selectedLoc.name}
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F5] border border-[#EAEAEA] text-[#171717] font-bold text-xs">
                  {selectedLoc.code}
                </span>
              </div>

              <p className="text-xs text-[#666666] mb-4 leading-relaxed">
                {selectedLoc.description}
              </p>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#F0F0F0] text-center mb-4">
                <div className="p-2.5 rounded-[12px] bg-[#FAFAFA]">
                  <span className="text-[10px] uppercase font-bold text-[#666666] block">LOST</span>
                  <span className="text-base font-extrabold text-[#E53935]">
                    {selectedLoc.loss_count}
                  </span>
                </div>
                <div className="p-2.5 rounded-[12px] bg-[#FAFAFA]">
                  <span className="text-[10px] uppercase font-bold text-[#666666] block">FOUND</span>
                  <span className="text-base font-extrabold text-[#171717]">
                    {selectedLoc.found_count}
                  </span>
                </div>
                <div className="p-2.5 rounded-[12px] bg-[#FAFAFA]">
                  <span className="text-[10px] uppercase font-bold text-[#666666] block">RECOVERY</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {selectedLoc.recovery_rate}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Campus Patrol
                </span>
                <button
                  onClick={() => onSelectZone && onSelectZone(selectedLoc.name)}
                  className="text-xs text-[#E53935] hover:text-[#C62828] font-bold underline"
                >
                  See items in this area →
                </button>
              </div>
            </div>
          )}

          {/* Top Activity Spots */}
          <div className="p-4 rounded-[16px] bg-[#FAFAFA] border border-[#EAEAEA] text-xs">
            <span className="text-[11px] font-bold uppercase text-[#666666] tracking-wider block mb-3">
              AREAS WITH MOST ACTIVITY
            </span>
            <div className="space-y-2.5">
              {hotspots.slice(0, 4).map((h, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-[#171717] mb-1">
                    <span className="font-semibold">{h.zone}</span>
                    <span className="text-[#666666] font-medium">{h.count} reports</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
                    <div
                      className="h-full bg-[#E53935] rounded-full"
                      style={{ width: `${Math.min(100, (h.count / 22) * 100)}%` }}
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
