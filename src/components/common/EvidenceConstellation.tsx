import React, { useState } from 'react';
import { ComponentScores } from '../../types';
import { Eye, FileText, Sparkles, MapPin, Clock, Check, AlertCircle } from 'lucide-react';

interface EvidenceConstellationProps {
  scores: ComponentScores;
  candidateTitle: string;
  supportingEvidence?: string[];
  conflictingEvidence?: string[];
}

export const EvidenceConstellation: React.FC<EvidenceConstellationProps> = ({
  scores,
  candidateTitle,
  supportingEvidence = [],
  conflictingEvidence = [],
}) => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const factors = [
    {
      id: 'visual',
      label: 'Looks & Colour',
      score: scores.visual,
      weight: '30%',
      icon: Eye,
      desc: 'Matches in colour tone, shape silhouette, and material build.',
    },
    {
      id: 'semantic',
      label: 'Description Words',
      score: scores.semantic,
      weight: '25%',
      icon: FileText,
      desc: 'How closely the written descriptions match even if different words were used.',
    },
    {
      id: 'distinctive',
      label: 'Unique Marks & Stickers',
      score: scores.distinctive,
      weight: '20%',
      icon: Sparkles,
      desc: 'Matches on brand logos, specific stickers, scratches, or accessories.',
    },
    {
      id: 'location',
      label: 'Campus Area',
      score: scores.location,
      weight: '15%',
      icon: MapPin,
      desc: 'How close the lost and found locations are on campus.',
    },
    {
      id: 'time',
      label: 'Time Frame',
      score: scores.time,
      weight: '10%',
      icon: Clock,
      desc: 'Found shortly after the reported loss window.',
    },
  ];

  return (
    <div className="rounded-[18px] bg-white border border-[#EAEAEA] p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E53935] block mb-0.5">
            MATCH BREAKDOWN
          </span>
          <h3 className="text-base font-extrabold text-[#171717]">
            How this match adds up for "{candidateTitle}"
          </h3>
        </div>
        <span className="text-xs font-medium text-[#666666] bg-[#F5F5F5] px-3 py-1 rounded-full border border-[#EAEAEA]">
          5 key factors compared
        </span>
      </div>

      {/* Clean Interactive Factors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {factors.map((f) => {
          const Icon = f.icon;
          const isSelected = selectedFactor === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setSelectedFactor(isSelected ? null : f.id)}
              className={`p-3.5 rounded-[14px] text-left border transition text-xs ${
                isSelected
                  ? 'bg-[#FFF0F0] border-[#E53935] shadow-xs'
                  : 'bg-[#FAFAFA] border-[#EAEAEA] hover:border-[#D4D4D4] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#E53935] text-white' : 'bg-white text-[#E53935] border border-[#EAEAEA]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-[#171717] text-sm">
                  {Math.round(f.score)}%
                </span>
              </div>
              <span className="font-bold text-[#171717] block text-[11px] leading-tight mb-1">
                {f.label}
              </span>
              <div className="w-full bg-[#E5E5E5] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#E53935] h-full rounded-full transition-all duration-500"
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail or Why It Matches Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Supporting Points */}
        <div className="p-4 rounded-[14px] bg-[#F9F9F9] border border-[#EAEAEA]">
          <h4 className="text-xs font-bold text-[#171717] mb-2.5 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            Why we think it's a match:
          </h4>
          {supportingEvidence.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#333333]">
              {supportingEvidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#E53935] font-bold shrink-0">✓</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#666666]">General attributes match.</p>
          )}
        </div>

        {/* Conflicting Points */}
        <div className="p-4 rounded-[14px] bg-[#FFFBF0] border border-[#FEF3C7]">
          <h4 className="text-xs font-bold text-amber-900 mb-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Things to double-check:
          </h4>
          {conflictingEvidence.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-amber-900/90">
              {conflictingEvidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-800">No conflicts found so far.</p>
          )}
        </div>
      </div>
    </div>
  );
};
