import React from 'react';
import { ItemFingerprint } from '../../types';
import { Fingerprint, Cpu, ShieldCheck, Tag, Sparkles } from 'lucide-react';

interface FingerprintCardProps {
  fingerprint?: ItemFingerprint | null;
  title?: string;
  className?: string;
  compact?: boolean;
}

export const FingerprintCard: React.FC<FingerprintCardProps> = ({
  fingerprint,
  title = 'AI ITEM FINGERPRINT',
  className = '',
  compact = false,
}) => {
  if (!fingerprint) {
    return (
      <div className={`p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 ${className}`}>
        <Fingerprint className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm">Fingerprint synthesis in progress...</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-blue-500/30 shadow-xl shadow-blue-950/20 backdrop-blur-md ${className}`}>
      {/* Top Evidence Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/40 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              {title}
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> Multimodal Feature Vector
            </span>
          </div>
        </div>

        {fingerprint.confidence && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{Math.round(fingerprint.confidence)}% Precision</span>
          </div>
        )}
      </div>

      {/* Structured Evidence Matrix */}
      <div className={`p-5 space-y-3.5 text-xs ${compact ? 'text-[11px] space-y-2.5' : ''}`}>
        {/* Object & Brand */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              OBJECT TYPE
            </span>
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-blue-400" />
              {fingerprint.object_type || 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              BRAND / MAKER
            </span>
            <span className={fingerprint.brand ? 'font-semibold text-slate-100' : 'text-slate-500 italic'}>
              {fingerprint.brand || 'Unknown / Not detected'}
            </span>
          </div>
        </div>

        {/* Color & Material */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              COLOR PROFILE
            </span>
            <span className="font-semibold text-slate-200">
              {fingerprint.primary_color || 'Unknown'}
              {fingerprint.secondary_colors && fingerprint.secondary_colors.length > 0 && (
                <span className="text-slate-400 font-normal text-[11px] block">
                  Secondary: {fingerprint.secondary_colors.join(', ')}
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              MATERIAL
            </span>
            <span className={fingerprint.material ? 'font-semibold text-slate-200' : 'text-slate-500 italic'}>
              {fingerprint.material || 'Undetermined'}
            </span>
          </div>
        </div>

        {/* Shape & Silhouette */}
        <div className="pb-3 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
            SILHOUETTE / FORM
          </span>
          <span className="font-semibold text-slate-200">
            {fingerprint.shape_size || 'Standard Profile'}
          </span>
        </div>

        {/* Distinctive Marks */}
        <div className="pb-3 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500/90 block mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> DISTINCTIVE IDENTIFIERS
          </span>
          {fingerprint.distinctive_marks && fingerprint.distinctive_marks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {fingerprint.distinctive_marks.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 italic">None logged (AI Detective can clarify)</span>
          )}
        </div>

        {/* Location & Time */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              CAMPUS SECTOR
            </span>
            <span className="text-slate-300 font-medium">{fingerprint.location || 'General Campus'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
              TEMPORAL WINDOW
            </span>
            <span className="text-slate-300 font-medium">{fingerprint.event_time || 'Recent'}</span>
          </div>
        </div>
      </div>

      {/* Decorative scanline overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-60" />
    </div>
  );
};
