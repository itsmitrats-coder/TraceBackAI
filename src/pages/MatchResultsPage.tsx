import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LostItem, CandidateMatch, FoundItem } from '../types';
import { TraceScoreRing } from '../components/common/TraceScoreRing';
import { FingerprintCard } from '../components/common/FingerprintCard';
import { EvidenceConstellation } from '../components/common/EvidenceConstellation';
import { MatchComparisonModal } from '../components/common/MatchComparisonModal';
import { DetectiveConsole } from '../components/investigation/DetectiveConsole';
import {
  Sparkles, ShieldCheck, ArrowRight, Eye, ArrowRightLeft,
  MapPin, Clock, Tag, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft
} from 'lucide-react';

interface MatchResultsPageProps {
  lostItemId: string;
  onInitiateClaim: (foundItemId: string, lostItemId: string) => void;
  onBack: () => void;
}

export const MatchResultsPage: React.FC<MatchResultsPageProps> = ({
  lostItemId,
  onInitiateClaim,
  onBack,
}) => {
  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expanded views
  const [activeConstellationMatchId, setActiveConstellationMatchId] = useState<string | null>(null);
  const [comparisonMatch, setComparisonMatch] = useState<CandidateMatch | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lData, mData] = await Promise.all([
        api.getLostItem(lostItemId),
        api.matchItem(lostItemId),
      ]);
      setLostItem(lData);
      setMatches(mData.matches || []);
      if (mData.matches && mData.matches.length > 0) {
        setActiveConstellationMatchId(mData.matches[0].id);
      }
    } catch (e) {
      console.error('Failed to load match results', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lostItemId]);

  const handleDetectiveResponse = (resp: any) => {
    if (resp.matches) {
      setMatches(resp.matches);
      if (resp.matches.length > 0) {
        setActiveConstellationMatchId(resp.matches[0].id);
      }
    }
    if (resp.updated_fingerprint && lostItem) {
      setLostItem({ ...lostItem, fingerprint: resp.updated_fingerprint });
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin mx-auto" />
        <p className="text-base font-bold text-[#171717]">Comparing campus items...</p>
        <p className="text-xs text-[#666666]">Checking descriptions, photos, and locations</p>
      </div>
    );
  }

  if (!lostItem) {
    return (
      <div className="py-12 text-center text-[#666666]">
        <p>Report not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#E53935] rounded-xl text-white text-xs font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const topMatch = matches[0];
  const activeConstellation = matches.find((m) => m.id === activeConstellationMatchId) || topMatch;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-[#666666] hover:text-[#E53935] font-semibold mb-1.5 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              We found a few possibilities 👀
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
              For: {lostItem.title}
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Here are items found recently that closely match your description.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Matches</span>
        </button>
      </div>

      {/* Target Item Dossier Summary & Detective Question */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FingerprintCard
            fingerprint={lostItem.fingerprint}
            title="YOUR REPORT SUMMARY"
            compact={true}
          />
        </div>

        {/* AI Detective / One More Thing Console */}
        <div className="lg:col-span-2">
          <DetectiveConsole
            lostItemId={lostItemId}
            onAnswerApplied={handleDetectiveResponse}
          />
        </div>
      </div>

      {/* Evidence Constellation Breakdown */}
      {activeConstellation && (
        <EvidenceConstellation
          scores={activeConstellation.component_scores}
          candidateTitle={activeConstellation.found_item.title}
          supportingEvidence={activeConstellation.supporting_evidence}
          conflictingEvidence={activeConstellation.conflicting_evidence}
        />
      )}

      {/* Ranked Candidate Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#171717] tracking-tight">
            Matching Items Found on Campus ({matches.length})
          </h3>
          <span className="text-xs text-[#666666]">
            Sorted by closest match
          </span>
        </div>

        <div className="space-y-5">
          {matches.map((match, index) => {
            const isHighest = index === 0;
            const found = match.found_item;

            return (
              <div
                key={match.id}
                className={`relative rounded-3xl bg-white border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  isHighest
                    ? 'border-[#E53935] ring-2 ring-[#FFF0F0]'
                    : 'border-[#EAEAEA] hover:border-[#171717]/30'
                }`}
              >
                {/* Visual Rank Pill */}
                <div className="flex items-center justify-between px-6 py-3 bg-[#FFF7F7] border-b border-[#EAEAEA]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHighest
                          ? 'bg-[#E53935] text-white'
                          : 'bg-white text-[#666666] border border-[#EAEAEA]'
                      }`}
                    >
                      Candidate #{index + 1}
                    </span>
                    {isHighest && (
                      <span className="text-xs font-bold text-[#E53935]">
                        ★ Strongest Match
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-[#666666]">
                    Found {found.found_at}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Photo & Score (4 Cols) */}
                  <div className="md:col-span-4 flex items-center gap-5">
                    {found.image_url ? (
                      <img
                        src={found.image_url}
                        alt={found.title}
                        className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-[#EAEAEA]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-center text-[#666666] shrink-0 text-xs font-medium">
                        No photo
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      <TraceScoreRing score={match.overall_score} size="md" />
                    </div>
                  </div>

                  {/* Details & Location (5 Cols) */}
                  <div className="md:col-span-5 space-y-2">
                    <h4 className="text-base font-bold text-[#171717]">{found.title}</h4>
                    <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                      "{found.description}"
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-[#666666] pt-1">
                      <span className="flex items-center gap-1 text-[#171717] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#E53935]" /> {found.location}
                      </span>
                      <span className="flex items-center gap-1 text-[#666666]">
                        <Clock className="w-3.5 h-3.5 text-[#666666]" /> {found.found_at}
                      </span>
                    </div>

                    <div className="text-xs text-[#666666]">
                      Held at: <strong className="text-[#171717]">{found.custody_location || 'Campus Front Desk'}</strong>
                    </div>
                  </div>

                  {/* Actions (3 Cols) */}
                  <div className="md:col-span-3 flex flex-col gap-2.5 justify-center">
                    <button
                      onClick={() => onInitiateClaim(found.id, lostItemId)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>This Is Mine</span>
                    </button>

                    <button
                      onClick={() => setComparisonMatch(match)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F9F9F9] text-[#171717] font-semibold text-xs transition flex items-center justify-center gap-2 border border-[#EAEAEA]"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#666666]" />
                      <span>Compare Side-by-Side</span>
                    </button>

                    <button
                      onClick={() => setActiveConstellationMatchId(match.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                        activeConstellationMatchId === match.id
                          ? 'bg-[#FFF0F0] text-[#E53935] border-[#E53935]'
                          : 'bg-white hover:bg-[#F9F9F9] text-[#666666] border-[#EAEAEA]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-[#666666]" />
                      <span>Inspect Match Factors</span>
                    </button>
                  </div>
                </div>

                {/* Why We Think It's a Match */}
                <div className="px-6 py-4 bg-[#FFF7F7] border-t border-[#EAEAEA] text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-xs text-emerald-800 block mb-1">
                      WHY WE THINK IT'S A MATCH:
                    </span>
                    <ul className="space-y-1">
                      {match.supporting_evidence.slice(0, 3).map((ev, i) => (
                        <li key={i} className="text-[#171717] text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-xs text-amber-800 block mb-1">
                      DIFFERENCES TO DOUBLE CHECK:
                    </span>
                    <ul className="space-y-1">
                      {match.conflicting_evidence.slice(0, 2).map((ev, i) => (
                        <li key={i} className="text-[#666666] text-xs flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparisonMatch && (
        <MatchComparisonModal
          isOpen={!!comparisonMatch}
          onClose={() => setComparisonMatch(null)}
          lostItem={lostItem}
          match={comparisonMatch}
          onClaim={() => {
            const foundId = comparisonMatch.found_item.id;
            setComparisonMatch(null);
            onInitiateClaim(foundId, lostItemId);
          }}
        />
      )}
    </div>
  );
};
