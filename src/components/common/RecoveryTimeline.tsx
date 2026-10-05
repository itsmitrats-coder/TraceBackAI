import React from 'react';
import { Check, Clock } from 'lucide-react';

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
      label: 'Reported',
      desc: 'Saved in system',
      completed: true,
      current: false,
    },
    {
      id: 'fingerprint',
      label: 'Details Checked',
      desc: 'Clues organized',
      completed: true,
      current: false,
    },
    {
      id: 'matched',
      label: `${candidateCount} Matches`,
      desc: 'Compared with found items',
      completed: status !== 'open' || candidateCount > 0,
      current: status === 'potential_match' && !hasDetectiveAnswered,
    },
    {
      id: 'detective',
      label: 'Clarified',
      desc: 'Narrowed down',
      completed: hasDetectiveAnswered || status === 'claim_pending' || status === 'verified' || status === 'recovered',
      current: status === 'potential_match' && hasDetectiveAnswered,
    },
    {
      id: 'claimed',
      label: 'Claim Filed',
      desc: 'Proof submitted',
      completed: status === 'claim_pending' || status === 'verified' || status === 'recovered',
      current: status === 'claim_pending',
    },
    {
      id: 'review',
      label: 'Staff Check',
      desc: 'Reviewed at desk',
      completed: status === 'verified' || status === 'recovered',
      current: status === 'claim_pending',
    },
    {
      id: 'recovered',
      label: 'Recovered 🎉',
      desc: 'Handed back',
      completed: status === 'recovered',
      current: status === 'verified',
    },
  ];

  return (
    <div className={`p-5 rounded-[18px] bg-white border border-[#EAEAEA] shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0F0F0]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E53935]">
          Recovery Progress
        </span>
        <span className="text-xs text-[#666666]">
          Current status: <strong className="text-[#171717] uppercase font-bold">{status.replace('_', ' ')}</strong>
        </span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                {!isLast && (
                  <div
                    className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 -z-0 ${
                      step.completed ? 'bg-[#E53935]' : 'bg-[#EAEAEA]'
                    }`}
                  />
                )}

                {/* Node icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                    step.completed
                      ? 'bg-[#E53935] text-white shadow-xs'
                      : step.current
                      ? 'bg-[#FFF0F0] text-[#E53935] border-2 border-[#E53935]'
                      : 'bg-[#F5F5F5] text-[#999999] border border-[#EAEAEA]'
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : step.current ? (
                    <Clock className="w-4 h-4 text-[#E53935]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="sm:w-full overflow-hidden">
                  <span
                    className={`block text-xs font-bold truncate ${
                      step.completed
                        ? 'text-[#171717]'
                        : step.current
                        ? 'text-[#E53935]'
                        : 'text-[#999999]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[10px] text-[#666666] truncate">
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
