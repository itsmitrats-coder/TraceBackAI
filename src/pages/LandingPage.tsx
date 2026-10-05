import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Package, ArrowRight, ShieldCheck, Sparkles,
  MapPin, CheckCircle2, ChevronRight, Compass, HeartHandshake, Eye
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
    { num: '01', title: 'Report', desc: 'Tell us what you remember in natural English', icon: Search },
    { num: '02', title: 'Fingerprint', desc: 'Auto-extracts colors, brand & distinctive marks', icon: Sparkles },
    { num: '03', title: 'Compare', desc: 'Compares visual, location & time clues', icon: Eye },
    { num: '04', title: 'Clarify', desc: 'Asks a quick question to confirm the right item', icon: Compass },
    { num: '05', title: 'Verify', desc: 'Private clue proof protects against wrongful claims', icon: ShieldCheck },
    { num: '06', title: 'Reunited', desc: 'Safe campus handover at designated desk', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F0] border border-[#E53935]/20 text-[#E53935] text-xs font-semibold mb-6">
          <Compass className="w-4 h-4 text-[#E53935]" />
          <span>The Campus Lost & Found Network</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#171717] tracking-tight leading-tight mb-4">
          Lost something?<br />
          <span className="text-[#E53935]">Let's Trace It Back.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#666666] max-w-2xl mx-auto leading-relaxed mb-8">
          Lost it somewhere on campus? Tell us what happened in plain English, and our campus intelligence network will help you find an exact match.
        </p>

        {/* Two Large Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-8">
          {/* CARD 1: I Lost Something */}
          <div
            onClick={onStartLost}
            className="group p-6 rounded-3xl bg-white border border-[#EAEAEA] hover:border-[#E53935] shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#171717] mb-1 group-hover:text-[#E53935] transition">
                I Lost Something
              </h3>
              <p className="text-xs text-[#666666] mb-4">
                Tell us what you lost. Even vague clues help us locate it.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-[#E53935] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Start Report</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARD 2: I Found Something */}
          <div
            onClick={onStartFound}
            className="group p-6 rounded-3xl bg-white border border-[#EAEAEA] hover:border-[#171717] shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9F9] text-[#171717] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#171717] mb-1">
                I Found Something
              </h3>
              <p className="text-xs text-[#666666] mb-4">
                Help someone get it back. Upload a photo or log campus location.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-[#171717] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Log Found Item</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Demo Persona Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[#666666] text-xs font-medium mr-1">Switch demo persona:</span>
          <button
            onClick={() => switchUser('student')}
            className="px-3 py-1 rounded-full bg-white border border-[#EAEAEA] hover:border-[#E53935] text-[#171717] hover:text-[#E53935] transition font-medium"
          >
            Student (Alex)
          </button>
          <button
            onClick={() => {
              switchUser('staff');
              onNavigate('staff-ops');
            }}
            className="px-3 py-1 rounded-full bg-white border border-[#EAEAEA] hover:border-[#E53935] text-[#171717] hover:text-[#E53935] transition font-medium"
          >
            Campus Staff (Marcus)
          </button>
          <button
            onClick={() => {
              switchUser('admin');
              onNavigate('analytics');
            }}
            className="px-3 py-1 rounded-full bg-white border border-[#EAEAEA] hover:border-[#E53935] text-[#171717] hover:text-[#E53935] transition font-medium"
          >
            Campus Admin (Dr. Chen)
          </button>
        </div>
      </div>

      {/* How It Works - Clean Step Cards */}
      <div className="rounded-3xl bg-[#FFF7F7] border border-[#EAEAEA] p-8 sm:p-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E53935] block mb-1">
            HOW IT WORKS
          </span>
          <h3 className="text-2xl font-bold text-[#171717] tracking-tight">
            How items find their way back
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-white border border-[#EAEAEA] text-center flex flex-col items-center justify-between hover:border-[#E53935]/40 transition shadow-2xs group"
              >
                <span className="text-[10px] font-bold text-[#666666] block mb-2">
                  STEP {step.num}
                </span>

                <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                <span className="text-xs font-bold text-[#171717] block mb-1">
                  {step.title}
                </span>
                <span className="text-[11px] text-[#666666] leading-tight">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three Core Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center mb-4">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#171717] mb-2">
            No Exact Wording Needed
          </h4>
          <p className="text-xs text-[#666666] leading-relaxed">
            Call it a "black water bottle", "metal flask", or "insulated Hydro Flask" — TraceBack connects different words for the same item.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#171717] mb-2">
            One Smart Question
          </h4>
          <p className="text-xs text-[#666666] leading-relaxed">
            If multiple similar items were found on campus, TraceBack asks one simple clarifying question (like stickers or scratches) to pick the right one.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAEAEA] shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E53935] flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#171717] mb-2">
            Prove It's Yours Privately
          </h4>
          <p className="text-xs text-[#666666] leading-relaxed">
            Your private clues (like engraving or lock screen wallpaper) stay hidden from strangers. Only verified owners can claim items.
          </p>
        </div>
      </div>
    </div>
  );
};
