import React from 'react';
import { Shield, Sparkles, Terminal, Database, Cpu } from 'lucide-react';
import { api } from '../../services/api';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const handleReset = async () => {
    if (window.confirm('Reset database to clean initial demo seed data?')) {
      await api.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono border border-blue-500/30">
              TB
            </div>
            <div>
              <span className="font-bold text-slate-200 block">TRACEBACK AI</span>
              <span className="text-[11px] text-slate-400">
                “Find what you've lost. Prove what is yours.”
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
              Home
            </button>
            <button onClick={() => onNavigate('found-items')} className="hover:text-white transition">
              Found Registry
            </button>
            <button onClick={() => onNavigate('heatmap')} className="hover:text-white transition">
              Campus Heatmap
            </button>
            <button onClick={() => onNavigate('staff-ops')} className="hover:text-white transition">
              Staff Operations
            </button>
            <button onClick={() => onNavigate('analytics')} className="hover:text-white transition">
              Analytics
            </button>
            <button onClick={handleReset} className="text-amber-400 hover:text-amber-300 font-mono transition">
              [Reset Demo Seed]
            </button>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono">
            <span>Team Zentrix • October 2026</span>
            <span className="block text-[10px] text-slate-500">
              Multimodal Vision & Forensic Matching Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
