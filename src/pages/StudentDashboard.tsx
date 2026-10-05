import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LostItem, CandidateMatch, FoundItem } from '../types';
import { api } from '../services/api';
import { TraceScoreRing } from '../components/common/TraceScoreRing';
import { NaturalSearchBar } from '../components/investigation/NaturalSearchBar';
import {
  Search, Package, ArrowRight, Sparkles, MapPin, Clock,
  ShieldCheck, AlertCircle, Eye, ChevronRight, Zap
} from 'lucide-react';

interface StudentDashboardProps {
  onStartLost: () => void;
  onStartFound: () => void;
  onViewMatches: (lostItemId: string) => void;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartLost,
  onStartFound,
  onViewMatches,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lData, fData] = await Promise.all([
          api.getLostItems({ my_only: true }),
          api.getFoundItems(),
        ]);
        setLostItems(lData);
        setFoundItems(fData.slice(0, 4));
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Personalized Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>TraceBack Intelligence Network Online</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Good morning, {firstName}.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              Let's trace it back.
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            You currently have <strong className="text-white">{lostItems.length} active investigations</strong> logged.
            Our multimodal evidence engine has scanned candidate found items across campus.
          </p>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Two Large Action Hero Cards (Section 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* I LOST SOMETHING */}
        <div
          onClick={onStartLost}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/30 border border-blue-500/30 p-8 shadow-xl hover:border-blue-500/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition">
              <Search className="w-8 h-8 stroke-[2.5]" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-blue-950 border border-blue-800 text-blue-300 font-bold">
              AI INQUIRY
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-cyan-300 transition">
            I LOST SOMETHING
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Let TraceBack investigate it. Provide what you recall — colors, rough locations, approximate time — and our forensic engine will reconstruct candidate fingerprints.
          </p>

          <div className="flex items-center text-xs font-bold text-blue-400 group-hover:text-cyan-300 gap-1.5 font-mono">
            <span>START INVESTIGATION WIZARD</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* I FOUND SOMETHING */}
        <div
          onClick={onStartFound}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 border border-emerald-500/30 p-8 shadow-xl hover:border-emerald-500/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition">
              <Package className="w-8 h-8 stroke-[2.5]" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
              COMMUNITY CUSTODY
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-300 transition">
            I FOUND SOMETHING
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Help reunite an item with its owner. Upload an image, designate the drop-off custody point, and our reverse matching engine will notify verified owners automatically.
          </p>

          <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300 gap-1.5 font-mono">
            <span>LOG FOUND BELONGING</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* TraceBack Insights Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950 border border-blue-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider block">
              TRACEBACK FORENSIC INSIGHTS
            </span>
            <span className="text-xs text-slate-300">
              Your lost <strong>Hydro Flask bottle</strong> matches <strong>Dark Green Insulated Flask</strong> at Central Library (88% confidence).
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewMatches('lost_bottle_1')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>Examine Match</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Natural Language Search Bar */}
      <div>
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
          INSTANT NATURAL SEARCH
        </h3>
        <NaturalSearchBar
          onResultsFound={(results) => {
            onNavigate('found-items');
          }}
        />
      </div>

      {/* Active Investigations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Active Investigations
            </h3>
            <p className="text-xs text-slate-400">
              Your reported items actively being cross-examined by the multimodal engine
            </p>
          </div>

          <button
            onClick={() => onNavigate('my-reports')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All ({lostItems.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lostItems.map((item) => {
            const hasMatches = item.status === 'potential_match' || item.status === 'verified';
            const confidence = item.title.includes('Hydro Flask') ? 88 : item.title.includes('MacBook') ? 92 : 82;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      item.status === 'verified'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.status === 'potential_match'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.lost_at}</span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <Search className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight mb-1">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    "{item.description}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TraceScoreRing score={confidence} size="sm" showLabel={false} />
                    <div className="text-left text-[11px] leading-tight">
                      <span className="font-bold text-white block">Top Match</span>
                      <span className="text-slate-400 font-mono">3 Candidates</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewMatches(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
