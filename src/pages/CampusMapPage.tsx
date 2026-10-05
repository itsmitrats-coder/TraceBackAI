import React from 'react';
import { CampusHeatmapWidget } from '../components/common/CampusHeatmapWidget';
import { MapPin, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
          GEOSPATIAL FORENSIC MATRIX
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Campus Heatmap & Zone Directory
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Visual representation of report density, recovery hotspots, and security dispatch coverage across all 10 campus sectors.
        </p>
      </div>

      <CampusHeatmapWidget />
    </div>
  );
};
