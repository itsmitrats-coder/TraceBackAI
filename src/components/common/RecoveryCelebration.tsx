import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, X, HeartHandshake } from 'lucide-react';

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
      // Fire festive campus confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E53935', '#10B981', '#171717', '#F59E0B'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E53935', '#10B981', '#FFF0F0'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E53935', '#10B981', '#FFF0F0'],
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#EAEAEA] p-8 text-center shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wide mb-2">
          REUNITED ON CAMPUS
        </span>

        <h3 className="text-2xl font-bold text-[#171717] tracking-tight mb-1">
          Item Recovered! 🎉
        </h3>

        <p className="text-sm text-[#666666] mb-6">
          Another item safely made its way back home.
        </p>

        <div className="p-4 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-[#666666]">Recovered Item:</span>
            <span className="text-[#171717] font-semibold">{itemTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Returned To:</span>
            <span className="text-[#E53935] font-semibold">{recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Custody Status:</span>
            <span className="text-emerald-700 font-semibold">Handover Completed</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-2xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-sm transition shadow-md shadow-[#E53935]/20 flex items-center justify-center gap-2"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
