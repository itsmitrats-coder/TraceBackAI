import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LostItem } from '../types';
import { RecoveryTimeline } from '../components/common/RecoveryTimeline';
import { FingerprintCard } from '../components/common/FingerprintCard';
import { PrivateClueBadge } from '../components/common/PrivateClueBadge';
import {
  Search, MapPin, Clock, ArrowRight, ShieldCheck,
  ChevronDown, ChevronUp, Sparkles, Plus, Eye
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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
            MY CASES
          </span>
          <h1 className="text-3xl font-black text-[#171717] tracking-tight">
            My Reported Items
          </h1>
          <p className="text-xs text-[#666666]">
            Keep track of your lost items and see match updates in real time.
          </p>
        </div>

        <button
          onClick={onNewReport}
          className="px-4 py-2.5 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report Another Item</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin mx-auto" />
          <p className="text-xs text-[#666666]">Loading your reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-[#666666] p-8 rounded-3xl bg-white border border-[#EAEAEA]">
          <Search className="w-12 h-12 mx-auto mb-2 text-[#666666]" />
          <p className="text-base font-bold text-[#171717]">No lost reports on file.</p>
          <p className="text-xs text-[#666666] mt-1">If you lose anything on campus, report it right away.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className="rounded-3xl bg-white border border-[#EAEAEA] overflow-hidden shadow-xs hover:border-[#171717]/20 transition"
              >
                {/* Header Banner */}
                <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {report.image_url ? (
                      <img
                        src={report.image_url}
                        alt={report.title}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#EAEAEA]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] flex items-center justify-center text-[#666666] shrink-0">
                        <Search className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
                          {report.status === 'potential_match' ? 'Match Found' : report.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#666666]">{report.lost_at}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#171717]">{report.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onViewMatches(report.id)}
                      className="px-4 py-2 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Check Matches</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="p-2 rounded-xl border border-[#EAEAEA] bg-white text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] transition"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Recovery Lifecycle Stepper */}
                <div className="px-6 pb-6">
                  <RecoveryTimeline status={report.status} candidateCount={3} />
                </div>

                {/* Expanded Details Dossier */}
                {isExpanded && (
                  <div className="p-6 border-t border-[#EAEAEA] bg-[#FFF7F7] space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs font-bold text-[#666666] block mb-1">
                          REPORTED DETAILS:
                        </span>
                        <p className="text-xs text-[#171717] leading-relaxed italic bg-white p-3.5 rounded-xl border border-[#EAEAEA]">
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
                          title="ITEM SUMMARY"
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
