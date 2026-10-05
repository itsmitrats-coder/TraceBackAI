import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const handleReset = async () => {
    if (window.confirm('Reset database to clean initial demo seed data?')) {
      await api.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <footer className="w-full border-t border-[#EAEAEA] bg-white py-10 text-xs text-[#666666] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E53935] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#171717] block text-sm">
                Trace<span className="text-[#E53935]">Back</span>
              </span>
              <span className="text-xs text-[#666666]">
                Lost it? Trace it back.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#666666]">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-[#E53935] transition">
              Home
            </button>
            <button onClick={() => onNavigate('found-items')} className="hover:text-[#E53935] transition">
              Found Registry
            </button>
            <button onClick={() => onNavigate('heatmap')} className="hover:text-[#E53935] transition">
              Campus Map
            </button>
            <button onClick={() => onNavigate('staff-ops')} className="hover:text-[#E53935] transition">
              Staff Operations
            </button>
            <button onClick={() => onNavigate('analytics')} className="hover:text-[#E53935] transition">
              Analytics
            </button>
            <button
              onClick={handleReset}
              className="text-[#E53935] hover:text-[#C62828] font-medium flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Seed
            </button>
          </div>

          <div className="text-center md:text-right text-xs text-[#666666]">
            <span className="font-medium text-[#171717]">Campus Lost & Found Platform</span>
            <span className="block text-[11px] text-[#666666]">
              Built for university campuses everywhere.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
