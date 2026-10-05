import React from 'react';
import { LostItem, CandidateMatch } from '../../types';
import { TraceScoreRing } from './TraceScoreRing';
import { X, CheckCircle, AlertTriangle, ArrowRightLeft, ShieldCheck, MapPin, Clock, Tag } from 'lucide-react';

interface MatchComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: LostItem;
  match: CandidateMatch;
  onClaim?: () => void;
}

export const MatchComparisonModal: React.FC<MatchComparisonModalProps> = ({
  isOpen,
  onClose,
  lostItem,
  match,
  onClaim,
}) => {
  if (!isOpen) return null;

  const foundItem = match.found_item;
  const lf = lostItem.fingerprint;
  const ff = foundItem.fingerprint;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Comparative Evidence Dossier
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 font-mono font-normal">
                  Side-by-Side Analysis
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                AI forensic cross-examination of reported vs discovered item attributes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main 3-Column Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
            {/* Left: Your Lost Report (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-950/70 border border-blue-900/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    YOUR REPORT
                  </span>
                  <span className="text-xs text-slate-400">{lostItem.lost_at}</span>
                </div>

                {lostItem.image_url ? (
                  <img
                    src={lostItem.image_url}
                    alt={lostItem.title}
                    className="w-full h-44 object-cover rounded-xl mb-3 border border-slate-800"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 flex items-center justify-center text-slate-600 mb-3 border border-slate-800 text-xs">
                    No reference photo provided
                  </div>
                )}

                <h4 className="text-base font-bold text-white mb-1">{lostItem.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  "{lostItem.description}"
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-200 font-medium">{lostItem.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Color Profile:</span>
                    <span className="text-slate-200 font-medium">{lf?.primary_color || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-200 font-medium">{lostItem.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-slate-200 font-medium">{lostItem.lost_at}</span>
                  </div>
                </div>
              </div>

              {lostItem.private_clue && (
                <div className="mt-4 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300">
                  <span className="font-semibold block mb-0.5">Protected Private Clue (Shielded)</span>
                  {lostItem.private_clue}
                </div>
              )}
            </div>

            {/* Center: Match Confidence & Evidence Connectors (3 Cols) */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-950/90 border border-slate-800 p-5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                MATCH CONFIDENCE
              </span>

              <TraceScoreRing score={match.overall_score} size="lg" />

              {/* Component breakdown connectors */}
              <div className="w-full mt-6 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>VISUAL SIMILARITY</span>
                    <span className="text-sky-400 font-bold">{Math.round(match.component_scores.visual)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all duration-700"
                      style={{ width: `${match.component_scores.visual}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>SEMANTIC TEXT</span>
                    <span className="text-indigo-400 font-bold">{Math.round(match.component_scores.semantic)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                      style={{ width: `${match.component_scores.semantic}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>DISTINCTIVE MARKS</span>
                    <span className="text-amber-400 font-bold">{Math.round(match.component_scores.distinctive)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${match.component_scores.distinctive}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>ZONE PROXIMITY</span>
                    <span className="text-emerald-400 font-bold">{Math.round(match.component_scores.location)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${match.component_scores.location}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>TIME PROXIMITY</span>
                    <span className="text-rose-400 font-bold">{Math.round(match.component_scores.time)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full transition-all duration-700"
                      style={{ width: `${match.component_scores.time}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Found Candidate Item (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-950/70 border border-emerald-900/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FOUND ITEM CANDIDATE
                  </span>
                  <span className="text-xs text-slate-400">{foundItem.found_at}</span>
                </div>

                {foundItem.image_url ? (
                  <img
                    src={foundItem.image_url}
                    alt={foundItem.title}
                    className="w-full h-44 object-cover rounded-xl mb-3 border border-slate-800"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 flex items-center justify-center text-slate-600 mb-3 border border-slate-800 text-xs">
                    No physical photo available
                  </div>
                )}

                <h4 className="text-base font-bold text-white mb-1">{foundItem.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  "{foundItem.description}"
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-200 font-medium">{foundItem.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Color Profile:</span>
                    <span className="text-slate-200 font-medium">{ff?.primary_color || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Custody Station:</span>
                    <span className="text-slate-200 font-medium">{foundItem.custody_location || foundItem.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Found Time:</span>
                    <span className="text-slate-200 font-medium">{foundItem.found_at}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Safely secured in campus custody vault</span>
              </div>
            </div>
          </div>

          {/* Reasoning & Conflicting Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/30">
              <h5 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                WHY TRACEBACK FLAGGED THIS MATCH:
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {match.supporting_evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/30">
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                UNRESOLVED CONFLICTS & QUERIES:
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {match.conflicting_evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Close Comparison
          </button>

          {onClaim && (
            <button
              onClick={() => {
                onClose();
                onClaim();
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <span>This is My Item — Initiate Claim</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
