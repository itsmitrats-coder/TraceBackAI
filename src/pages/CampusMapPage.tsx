import React from 'react';
import { CampusHeatmapWidget } from '../components/common/CampusHeatmapWidget';
import { MapPin, Navigation } from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
          CAMPUS ZONES
        </span>
        <h1 className="text-3xl font-black text-[#171717] tracking-tight mb-2">
          Campus Map & Lost Item Zones
        </h1>
        <p className="text-xs text-[#666666] max-w-xl">
          See where items are reported lost or found across campus buildings and drop-off points.
        </p>
      </div>

      <CampusHeatmapWidget />
    </div>
  );
};
