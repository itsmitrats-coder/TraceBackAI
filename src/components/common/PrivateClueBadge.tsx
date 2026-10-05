import React from 'react';
import { Lock, Shield, EyeOff } from 'lucide-react';

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
    <div className={`rounded-xl p-3 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-start space-x-3 ${className}`}>
      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
        <Lock className="w-4 h-4" />
      </div>

      <div className="flex-1 text-xs">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-mono font-bold uppercase tracking-wider text-indigo-300 text-[10px]">
            PROTECTED OWNERSHIP EVIDENCE
          </span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[9px] border border-indigo-500/30 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> Zero-Knowledge Guard
          </span>
        </div>

        {isOwner && clue ? (
          <div>
            <p className="text-slate-200 font-medium leading-relaxed italic">
              "{clue}"
            </p>
            <span className="text-[10px] text-indigo-400 mt-1 block flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Shielded from public listings & claimants. Used strictly during AI claim verification.
            </span>
          </div>
        ) : (
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Owner-provided identifying clue is securely encrypted. It is never displayed publicly and is evaluated solely by TraceBack AI during physical claim disputes.
          </p>
        )}
      </div>
    </div>
  );
};
