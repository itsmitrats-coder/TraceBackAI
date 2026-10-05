import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface PrivateClueBadgeProps {
  clue?: string | null;
  isOwner?: boolean;
  className?: string;
}

export const PrivateClueBadge: React.FC<PrivateClueBadgeProps> = ({
  clue,
  isOwner = false,
  className = '',
}) => {
  return (
    <div className={`rounded-[14px] p-4 bg-[#FFF7F7] border border-[#FFCDD2] flex items-start space-x-3 ${className}`}>
      <div className="p-2 rounded-xl bg-white text-[#E53935] border border-[#FFCDD2] shadow-xs shrink-0">
        <Lock className="w-4 h-4" />
      </div>

      <div className="flex-1 text-xs">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-bold text-[#C62828] text-xs">
            Private Ownership Clue
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#C62828] font-bold text-[10px] border border-[#FECDD3]">
            Shielded
          </span>
        </div>

        {isOwner && clue ? (
          <div>
            <p className="text-[#171717] font-semibold italic bg-white p-2.5 rounded-lg border border-[#FFE4E6] mt-1.5 mb-1.5">
              "{clue}"
            </p>
            <span className="text-[11px] text-[#666666] block">
              Don't worry — this clue is never shown to anyone else on campus. It is only used to verify your claim.
            </span>
          </div>
        ) : (
          <p className="text-[#666666] leading-relaxed text-[11px]">
            Don't worry — your private clue won't be shown to anyone else. It stays confidential and is only used to prove ownership.
          </p>
        )}
      </div>
    </div>
  );
};
