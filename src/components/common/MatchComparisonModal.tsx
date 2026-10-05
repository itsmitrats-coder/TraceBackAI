import React from 'react';
import { LostItem, CandidateMatch } from '../../types';
import { TraceScoreRing } from './TraceScoreRing';
import { X, ArrowRightLeft, MapPin, Clock, Tag, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-[22px] bg-white border border-[#EAEAEA] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-[#FFF7F7]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white text-[#E53935] border border-[#FFCDD2] shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#171717] flex items-center gap-2">
                Side-by-Side Comparison
              </h3>
              <p className="text-xs text-[#666666]">
                Compare your report with what was discovered on campus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#666666] hover:text-[#171717] hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
            {/* Left: Your Report (4 Cols) */}
            <div className="lg:col-span-4 rounded-[18px] bg-[#FAFAFA] border border-[#EAEAEA] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0F0] text-[#E53935] border border-[#FFCDD2]">
                    YOUR REPORT
                  </span>
                  <span className="text-xs text-[#666666]">{lostItem.lost_at}</span>
                </div>

                {lostItem.image_url ? (
                  <img
                    src={lostItem.image_url}
                    alt={lostItem.title}
                    className="w-full h-44 object-cover rounded-[14px] mb-3 border border-[#EAEAEA]"
                  />
                ) : (
                  <div className="w-full h-44 rounded-[14px] bg-[#EAEAEA] flex items-center justify-center text-[#666666] mb-3 text-xs">
                    No photo provided
                  </div>
                )}

                <h4 className="text-base font-extrabold text-[#171717] mb-1">{lostItem.title}</h4>
                <p className="text-xs text-[#666666] line-clamp-3 mb-4 leading-relaxed">
                  "{lostItem.description}"
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Category:</span>
                    <span className="text-[#171717] font-semibold">{lostItem.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Colour:</span>
                    <span className="text-[#171717] font-semibold">{lf?.primary_color || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Location:</span>
                    <span className="text-[#171717] font-semibold">{lostItem.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Time:</span>
                    <span className="text-[#171717] font-semibold">{lostItem.lost_at}</span>
                  </div>
                </div>
              </div>

              {lostItem.private_clue && (
                <div className="mt-4 p-3 rounded-[12px] bg-[#FFF0F0] border border-[#FFCDD2] text-[11px] text-[#C62828]">
                  <span className="font-bold block mb-0.5">Your Private Clue (Shielded):</span>
                  "{lostItem.private_clue}"
                </div>
              )}
            </div>

            {/* Center: Match Score (3 Cols) */}
            <div className="lg:col-span-3 rounded-[18px] bg-white border border-[#EAEAEA] p-5 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666] mb-2">
                OVERALL MATCH
              </span>

              <TraceScoreRing score={match.overall_score} size="lg" />

              {/* Breakdown Bars */}
              <div className="w-full mt-6 space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[#666666] mb-1">
                    <span>Looks & Colour</span>
                    <span className="font-bold text-[#171717]">{Math.round(match.component_scores.visual)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${match.component_scores.visual}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[#666666] mb-1">
                    <span>Description Words</span>
                    <span className="font-bold text-[#171717]">{Math.round(match.component_scores.semantic)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${match.component_scores.semantic}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[#666666] mb-1">
                    <span>Stickers / Marks</span>
                    <span className="font-bold text-[#171717]">{Math.round(match.component_scores.distinctive)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${match.component_scores.distinctive}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[#666666] mb-1">
                    <span>Campus Area</span>
                    <span className="font-bold text-[#171717]">{Math.round(match.component_scores.location)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${match.component_scores.location}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[#666666] mb-1">
                    <span>Time Window</span>
                    <span className="font-bold text-[#171717]">{Math.round(match.component_scores.time)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${match.component_scores.time}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Found Item Candidate (4 Cols) */}
            <div className="lg:col-span-4 rounded-[18px] bg-[#FAFAFA] border border-[#EAEAEA] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    FOUND ITEM
                  </span>
                  <span className="text-xs text-[#666666]">{foundItem.found_at}</span>
                </div>

                {foundItem.image_url ? (
                  <img
                    src={foundItem.image_url}
                    alt={foundItem.title}
                    className="w-full h-44 object-cover rounded-[14px] mb-3 border border-[#EAEAEA]"
                  />
                ) : (
                  <div className="w-full h-44 rounded-[14px] bg-[#EAEAEA] flex items-center justify-center text-[#666666] mb-3 text-xs">
                    No photo available
                  </div>
                )}

                <h4 className="text-base font-extrabold text-[#171717] mb-1">{foundItem.title}</h4>
                <p className="text-xs text-[#666666] line-clamp-3 mb-4 leading-relaxed">
                  "{foundItem.description}"
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Category:</span>
                    <span className="text-[#171717] font-semibold">{foundItem.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Colour:</span>
                    <span className="text-[#171717] font-semibold">{ff?.primary_color || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Drop-off Point:</span>
                    <span className="text-[#171717] font-semibold">{foundItem.custody_location || foundItem.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                    <span className="text-[#666666]">Found Time:</span>
                    <span className="text-[#171717] font-semibold">{foundItem.found_at}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-[12px] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safely stored in campus lost & found custody</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EAEAEA] bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#666666] hover:text-[#171717] hover:bg-white border border-transparent hover:border-[#EAEAEA] transition"
          >
            Close
          </button>

          {onClaim && (
            <button
              onClick={() => {
                onClose();
                onClaim();
              }}
              className="px-6 py-2.5 rounded-[12px] bg-[#E53935] hover:bg-[#C62828] text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <span>This is mine — Claim Item →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
