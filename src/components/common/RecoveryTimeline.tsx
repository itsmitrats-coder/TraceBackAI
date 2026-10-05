import React from 'react';
import { Check, Clock, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface RecoveryTimelineProps {
  status: 'open' | 'potential_match' | 'claim_pending' | 'verified' | 'recovered' | 'closed';
  hasDetectiveAnswered?: boolean;
  candidateCount?: number;
  className?: string;
}

export const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({
  status,
  hasDetectiveAnswered = true,
  candidateCount = 3,
  className = '',
}) => {
  const steps = [
    {
      id: 'reported',
      label: 'Report Logged',
      desc: 'Validated & stored',
      completed: true,
      current: false,
    },
    {
      id: 'fingerprint',
      label: 'AI Fingerprint',
      desc: 'Multimodal vector created',
      completed: true,
      current: false,
    },
    {
      id: 'matched',
      label: `${candidateCount} Candidates`,
      desc: 'Evidence scored',
      completed: status !== 'open' || candidateCount > 0,
      current: status === 'potential_match' && !hasDetectiveAnswered,
    },
    {
      id: 'detective',
      label: 'Detective Probe',
      desc: 'Ambiguity clarified',
      completed: hasDetectiveAnswered || status === 'claim_pending' || status === 'verified' || status === 'recovered',
      current: status === 'potential_match' && hasDetectiveAnswered,
    },
    {
      id: 'claimed',
      label: 'Claim Submitted',
      desc: 'Protected clue verified',
      completed: status === 'claim_pending' || status === 'verified' || status === 'recovered',
      current: status === 'claim_pending',
    },
    {
      id: 'review',
      label: 'Staff Decision',
      desc: 'Custody authorization',
      completed: status === 'verified' || status === 'recovered',
      current: status === 'claim_pending',
    },
    {
      id: 'recovered',
      label: 'Handover & Closed',
      desc: 'Reunited with owner',
      completed: status === 'recovered',
      current: status === 'verified',
    },
  ];

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
          INVESTIGATION RECOVERY TIMELINE
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Status: <strong className="text-white uppercase">{status.replace('_', ' ')}</strong>
        </span>
      </div>

      <div className="relative">
        {/* Horizontal bar on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative flex md:flex-col items-center md:text-center gap-3 md:gap-2">
                {/* Connector Line for desktop */}
                {!isLast && (
                  <div
                    className={`hidden md:block absolute top-4 left-1/2 w-full h-0.5 -z-0 ${
                      step.completed ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}

                {/* Node Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                    step.completed
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : step.current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : step.current ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label & Description */}
                <div className="md:w-full overflow-hidden">
                  <span
                    className={`block text-xs font-semibold truncate ${
                      step.completed
                        ? 'text-slate-100'
                        : step.current
                        ? 'text-blue-400 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
