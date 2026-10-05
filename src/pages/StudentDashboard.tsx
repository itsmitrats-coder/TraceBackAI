import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LostItem, FoundItem } from '../types';
import { api } from '../services/api';
import { TraceScoreRing } from '../components/common/TraceScoreRing';
import { NaturalSearchBar } from '../components/investigation/NaturalSearchBar';
import {
  Search, Package, ArrowRight, MapPin, Clock,
  Sparkles, ChevronRight, Eye, AlertCircle
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
      <div className="rounded-3xl bg-[#FFF7F7] border border-[#EAEAEA] p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAEAEA] text-[#E53935] text-xs font-semibold mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#E53935]" />
            <span>Campus Network Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight mb-2">
            Hey {firstName},<br />
            <span className="text-[#E53935]">let's trace it back.</span>
          </h1>

          <p className="text-sm text-[#666666] leading-relaxed">
            You currently have <strong className="text-[#171717] font-semibold">{lostItems.length} active reports</strong> being tracked across campus departments.
          </p>
        </div>
      </div>

      {/* Two Large Action Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: I LOST SOMETHING */}
        <div
          onClick={onStartLost}
          className="group relative overflow-hidden rounded-3xl bg-white border border-[#EAEAEA] hover:border-[#E53935] p-7 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0F0] text-[#E53935]">
                Lost Item
              </span>
            </div>

            <h3 className="text-2xl font-bold text-[#171717] mb-2 group-hover:text-[#E53935] transition">
              I Lost Something
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed mb-6">
              Tell us what you lost. Even vague descriptions like "black bottle near library" help us find a match.
            </p>
          </div>

          <div className="flex items-center text-xs font-bold text-[#E53935] gap-1 group-hover:translate-x-1 transition-transform">
            <span>Report lost item</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* CARD 2: I FOUND SOMETHING */}
        <div
          onClick={onStartFound}
          className="group relative overflow-hidden rounded-3xl bg-white border border-[#EAEAEA] hover:border-[#171717] p-7 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9F9] text-[#171717] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F9F9F9] text-[#171717]">
                Found Item
              </span>
            </div>

            <h3 className="text-2xl font-bold text-[#171717] mb-2">
              I Found Something
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed mb-6">
              Help someone get their belongings back. Snap a quick photo or tell us where you dropped it off.
            </p>
          </div>

          <div className="flex items-center text-xs font-bold text-[#171717] gap-1 group-hover:translate-x-1 transition-transform">
            <span>Log found item</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Suggested Match Banner (If applicable) */}
      <div className="rounded-2xl bg-[#FFF0F0] border border-[#E53935]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#E53935] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#E53935] uppercase tracking-wider block">
              Match Update 👀
            </span>
            <span className="text-xs text-[#171717]">
              We found a strong match for your <strong>Hydro Flask bottle</strong> at Central Library!
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewMatches('lost_bottle_1')}
          className="px-4 py-2 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-semibold text-xs transition shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <span>See Matches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Natural Language Search Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#171717]">
            Quick Campus Search
          </h3>
          <span className="text-xs text-[#666666]">
            Search by natural descriptions
          </span>
        </div>
        <NaturalSearchBar
          onResultsFound={() => {
            onNavigate('found-items');
          }}
        />
      </div>

      {/* Active Reports / Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              My Active Reports
            </h3>
            <p className="text-xs text-[#666666]">
              Items you're currently looking for
            </p>
          </div>

          <button
            onClick={() => onNavigate('my-reports')}
            className="text-xs text-[#E53935] hover:text-[#C62828] font-bold flex items-center gap-1 transition"
          >
            <span>View All ({lostItems.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lostItems.map((item) => {
            const confidence = item.title.includes('Hydro Flask') ? 88 : item.title.includes('MacBook') ? 92 : 82;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-[#EAEAEA] p-5 flex flex-col justify-between hover:border-[#E53935] transition shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'potential_match'
                        ? 'bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20'
                        : 'bg-[#F9F9F9] text-[#666666] border border-[#EAEAEA]'
                    }`}>
                      {item.status === 'potential_match' ? 'Match Found' : item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#666666]">{item.lost_at}</span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#EAEAEA]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-center text-[#666666] shrink-0">
                        <Search className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-[#171717] leading-tight mb-1 group-hover:text-[#E53935] transition">
                        {item.title}
                      </h4>
                      <span className="text-xs text-[#666666] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E53935]" /> {item.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 mb-4 leading-relaxed">
                    "{item.description}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TraceScoreRing score={confidence} size="sm" showLabel={false} />
                    <div className="text-left text-xs leading-tight">
                      <span className="font-bold text-[#171717] block">Match Score</span>
                      <span className="text-[#666666] text-[11px]">{confidence}% match</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewMatches(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FFF0F0] hover:bg-[#E53935] text-[#E53935] hover:text-white font-bold text-xs transition flex items-center gap-1"
                  >
                    <span>Check</span>
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
