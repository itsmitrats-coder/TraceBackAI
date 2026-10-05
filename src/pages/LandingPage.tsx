import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Package, ArrowRight, ShieldCheck, Sparkles, Fingerprint,
  Cpu, Compass, CheckCircle2, ChevronRight, Zap, Flame
} from 'lucide-react';

interface LandingPageProps {
  onStartLost: () => void;
  onStartFound: () => void;
  onExploreFound: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLost,
  onStartFound,
  onExploreFound,
  onNavigate,
}) => {
  const { switchUser } = useAuth();

  const pipelineSteps = [
    { num: '01', title: 'Report', desc: 'Vague natural clue', icon: Search, color: 'text-blue-400', border: 'border-blue-500/30' },
    { num: '02', title: 'Fingerprint', desc: 'Multimodal extraction', icon: Fingerprint, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { num: '03', title: 'Investigate', desc: '5-factor evidence model', icon: Cpu, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { num: '04', title: 'Clarify', desc: 'AI Detective Mode', icon: Sparkles, color: 'text-amber-400', border: 'border-amber-500/30' },
    { num: '05', title: 'Verify', desc: 'Protected private clue', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { num: '06', title: 'Recovered', desc: 'Verified handover', icon: CheckCircle2, color: 'text-green-400', border: 'border-green-500/30' },
  ];

  return (
    <div className="space-y-16 py-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative text-center max-w-4xl mx-auto pt-8 pb-4">
        {/* Glowing backdrop halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-600/20 via-cyan-500/15 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-mono mb-6 shadow-lg shadow-blue-950/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Digital Detective for Campus Belongings</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-4">
          Find what you've lost.<br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            Prove what is yours.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Turn vague student memories and fragmented found reports into structured AI Item Fingerprints.
          TraceBack investigates visual, semantic, and temporal evidence to reunite campus belongings with certainty.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartLost}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-5 h-5 text-cyan-300" />
            <span>I Lost Something — Trace It</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onStartFound}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm transition border border-slate-700/80 flex items-center justify-center gap-2.5 shadow-xl hover:border-slate-600 transform hover:-translate-y-0.5"
          >
            <Package className="w-5 h-5 text-emerald-400" />
            <span>I Found Something — Log Item</span>
          </button>
        </div>

        {/* Quick Demo Persona Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Switch Persona:</span>
          <button
            onClick={() => switchUser('student')}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition"
          >
            Student (Alex)
          </button>
          <button
            onClick={() => {
              switchUser('staff');
              onNavigate('staff-ops');
            }}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition"
          >
            Campus Staff (Marcus)
          </button>
          <button
            onClick={() => {
              switchUser('admin');
              onNavigate('analytics');
            }}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition"
          >
            Administrator (Dr. Chen)
          </button>
        </div>
      </div>

      {/* The TraceBack Investigation Pipeline Visualization */}
      <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-1">
            THE FORENSIC RECOVERY PIPELINE
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            From Uncertainty to Irrefutable Evidence
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-4 rounded-2xl bg-slate-900/80 border ${step.border} text-center flex flex-col items-center justify-between hover:bg-slate-800/60 transition group`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block mb-2">
                  {step.num}
                </span>

                <div className={`p-3 rounded-xl bg-slate-950 mb-3 ${step.color} group-hover:scale-110 transition`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="text-xs font-bold text-white block mb-0.5">
                  {step.title}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Campus Recovery Highlights / Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            AI Item Fingerprint
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates terminology mismatch. Converts messy descriptions and photos into normalized object types, color palettes, materials, decals, and logos.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            AI Detective Mode
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            When multiple candidates look alike, the system dynamically formulates the single discriminating question that breaks ambiguity and recalibrates ranking.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            Zero-Knowledge Verification
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Owners provide secret identifying clues that are never exposed publicly. Claimants prove ownership blindly, preventing opportunistic theft.
          </p>
        </div>
      </div>
    </div>
  );
};
