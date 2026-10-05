import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';

interface RecoveryCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  recipientName: string;
}

export const RecoveryCelebration: React.FC<RecoveryCelebrationProps> = ({
  isOpen,
  onClose,
  itemTitle,
  recipientName,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#10B981', '#6366F1', '#F59E0B'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 p-8 text-center shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
          LIFECYCLE RESOLVED
        </span>

        <h3 className="text-2xl font-black text-white tracking-tight mb-2">
          ITEM RECOVERED ✓
        </h3>

        <p className="text-sm text-slate-300 mb-6 font-medium">
          “Another trace completed.”
        </p>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Recovered Item:</span>
            <span className="text-white font-semibold">{itemTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reunited With:</span>
            <span className="text-emerald-400 font-semibold">{recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Custody Status:</span>
            <span className="text-slate-200 font-mono">HANDOVER VERIFIED</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Complete Investigation</span>
        </button>
      </div>
    </div>
  );
};
