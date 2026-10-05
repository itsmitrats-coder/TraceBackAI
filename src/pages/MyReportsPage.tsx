import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LostItem } from '../types';
import { RecoveryTimeline } from '../components/common/RecoveryTimeline';
import { FingerprintCard } from '../components/common/FingerprintCard';
import { PrivateClueBadge } from '../components/common/PrivateClueBadge';
import {
  Search, MapPin, Clock, ArrowRight, ShieldCheck,
  ChevronDown, ChevronUp, Sparkles, Plus
} from 'lucide-react';

interface MyReportsPageProps {
  onNewReport: () => void;
  onViewMatches: (lostItemId: string) => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({
  onNewReport,
  onViewMatches,
}) => {
  const [reports, setReports] = useState<LostItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getLostItems({ my_only: true });
        setReports(data);
        if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
            STUDENT ACTIVE CASES
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            My Investigation Records
          </h1>
          <p className="text-xs text-slate-400">
            Track forensic reconstruction, candidate matches, and recovery milestones for your items
          </p>
        </div>

        <button
          onClick={onNewReport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Lost Item</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading cases...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-slate-400 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <Search className="w-12 h-12 mx-auto mb-2 text-slate-600" />
          <p className="text-base font-bold text-white">No items reported lost yet.</p>
          <p className="text-xs text-slate-500 mt-1">Start an investigation anytime with our 6-step wizard.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl"
              >
                {/* Header Banner */}
                <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {report.image_url ? (
                      <img
                        src={report.image_url}
                        alt={report.title}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-800"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <Search className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-950 text-blue-400 border border-blue-800">
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{report.lost_at}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{report.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onViewMatches(report.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Examine Matches</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Section 25: Recovery Lifecycle Timeline */}
                <div className="px-6 pb-6">
                  <RecoveryTimeline status={report.status} candidateCount={3} />
                </div>

                {/* Expanded Details Dossier */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-800 bg-slate-950/60 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                          REPORTED DESCRIPTION:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                          "{report.description}"
                        </p>

                        <div className="mt-4">
                          <PrivateClueBadge clue={report.private_clue} isOwner={true} />
                        </div>
                      </div>

                      <div>
                        <FingerprintCard
                          fingerprint={report.fingerprint}
                          compact={true}
                          title="SYNTHESIZED AI FINGERPRINT"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
