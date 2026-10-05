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
  MapPin, Clock, Tag, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Lock, RefreshCw
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
  const [showDetective, setShowDetective] = useState(true);

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
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-base font-bold text-white">Synthesizing Candidate Evidence...</p>
        <p className="text-xs text-slate-400">Comparing 5-signal forensic vectors</p>
      </div>
    );
  }

  if (!lostItem) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p>Report not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-white text-xs">
          Return
        </button>
      </div>
    );
  }

  const topMatch = matches[0];
  const activeConstellation = matches.find((m) => m.id === activeConstellationMatchId) || topMatch;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-blue-400 hover:text-blue-300 font-mono mb-1.5 flex items-center gap-1"
          >
            ← Return to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TraceBack found <span className="text-cyan-400">{matches.length} possible matches</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
              Target: {lostItem.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by multimodal similarity (Visual 30%, Semantic 25%, Distinctive 20%, Location 15%, Time 10%)
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-scan Database</span>
        </button>
      </div>

      {/* Target Item Dossier Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FingerprintCard
            fingerprint={lostItem.fingerprint}
            title="YOUR REPORT FINGERPRINT"
            compact={true}
          />
        </div>

        {/* AI Detective Mode Console (Section 16) */}
        <div className="lg:col-span-2">
          <DetectiveConsole
            lostItemId={lostItemId}
            onAnswerApplied={handleDetectiveResponse}
          />
        </div>
      </div>

      {/* Interactive Evidence Constellation (Section 15 & 38) */}
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
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            RANKED RECOVERY CANDIDATES
          </h3>
          <span className="text-xs text-slate-400">
            Sorted by Forensic Confidence Score
          </span>
        </div>

        <div className="space-y-5">
          {matches.map((match, index) => {
            const isHighest = index === 0;
            const found = match.found_item;

            return (
              <div
                key={match.id}
                className={`relative rounded-3xl bg-slate-900 border transition-all duration-300 overflow-hidden shadow-xl ${
                  isHighest
                    ? 'border-blue-500/50 shadow-blue-950/30 ring-1 ring-blue-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Rank Pill */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-950/60 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                        isHighest
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{String(index + 1).padStart(2, '0')} CANDIDATE
                    </span>
                    {isHighest && (
                      <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        ★ TOP CORROBORATED MATCH
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
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
                        className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-800"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 shrink-0 text-xs">
                        No photo
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      <TraceScoreRing score={match.overall_score} size="md" />
                    </div>
                  </div>

                  {/* Details & Location (5 Cols) */}
                  <div className="md:col-span-5 space-y-2">
                    <h4 className="text-base font-bold text-white">{found.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      "{found.description}"
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" /> {found.location}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {found.found_at}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Custody: <strong className="text-slate-300">{found.custody_location || 'Campus Dispatch Desk'}</strong>
                    </div>
                  </div>

                  {/* Actions (3 Cols) */}
                  <div className="md:col-span-3 flex flex-col gap-2.5 justify-center">
                    <button
                      onClick={() => setComparisonMatch(match)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                      <span>Compare Side-by-Side</span>
                    </button>

                    <button
                      onClick={() => setActiveConstellationMatchId(match.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                        activeConstellationMatchId === match.id
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect Evidence Graph</span>
                    </button>

                    <button
                      onClick={() => onInitiateClaim(found.id, lostItemId)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Claim This Item</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Reasoning Footer Bar */}
                <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/80 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      WHY THIS MATCH?
                    </span>
                    <ul className="space-y-1">
                      {match.supporting_evidence.slice(0, 3).map((ev, i) => (
                        <li key={i} className="text-slate-300 text-[11px] flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block mb-1">
                      CONFLICTS & QUERIES:
                    </span>
                    <ul className="space-y-1">
                      {match.conflicting_evidence.slice(0, 2).map((ev, i) => (
                        <li key={i} className="text-slate-400 text-[11px] flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">!</span>
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
