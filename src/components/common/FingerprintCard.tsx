import React from 'react';
import { ItemFingerprint } from '../../types';
import { Tag, MapPin, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface FingerprintCardProps {
  fingerprint?: ItemFingerprint | null;
  title?: string;
  className?: string;
  compact?: boolean;
}

export const FingerprintCard: React.FC<FingerprintCardProps> = ({
  fingerprint,
  title = 'Item Summary',
  className = '',
  compact = false,
}) => {
  if (!fingerprint) {
    return (
      <div className={`p-6 rounded-[18px] bg-[#F9F9F9] border border-[#EAEAEA] text-center text-[#666666] ${className}`}>
        <p className="text-sm">Looking into item details...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[18px] bg-white border border-[#EAEAEA] shadow-sm overflow-hidden ${className}`}>
      {/* Clean Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFF7F7] border-b border-[#FEE2E2]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
            {title}
          </h4>
        </div>

        {fingerprint.confidence && (
          <span className="text-[11px] font-semibold text-[#C62828] bg-white px-2.5 py-0.5 rounded-full border border-[#FECDD3]">
            {Math.round(fingerprint.confidence)}% detail score
          </span>
        )}
      </div>

      {/* Attributes Grid */}
      <div className={`p-5 space-y-3 text-xs ${compact ? 'text-[11px] space-y-2.5 p-4' : ''}`}>
        {/* Object & Brand */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#F0F0F0]">
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5">
              Type of Item
            </span>
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#E53935]" />
              {fingerprint.object_type || 'General item'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5">
              Brand / Maker
            </span>
            <span className={fingerprint.brand ? 'font-bold text-[#171717]' : 'text-[#666666] italic'}>
              {fingerprint.brand || 'Unbranded / Unknown'}
            </span>
          </div>
        </div>

        {/* Color & Material */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#F0F0F0]">
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5">
              Colour
            </span>
            <span className="font-semibold text-[#171717]">
              {fingerprint.primary_color || 'Not specified'}
              {fingerprint.secondary_colors && fingerprint.secondary_colors.length > 0 && (
                <span className="text-[#666666] font-normal text-[11px] block">
                  Also has: {fingerprint.secondary_colors.join(', ')}
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5">
              Material
            </span>
            <span className={fingerprint.material ? 'font-semibold text-[#171717]' : 'text-[#666666]'}>
              {fingerprint.material || 'Standard build'}
            </span>
          </div>
        </div>

        {/* Shape / Silhouette */}
        {fingerprint.shape_size && (
          <div className="pb-3 border-b border-[#F0F0F0]">
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5">
              Size & Shape
            </span>
            <span className="font-medium text-[#171717]">
              {fingerprint.shape_size}
            </span>
          </div>
        )}

        {/* Distinctive Marks */}
        <div className="pb-3 border-b border-[#F0F0F0]">
          <span className="text-[11px] font-semibold text-[#C62828] block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#E53935]" /> Notable Features / Stickers
          </span>
          {fingerprint.distinctive_marks && fingerprint.distinctive_marks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {fingerprint.distinctive_marks.map((mark, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#FFF0F0] border border-[#FFCDD2] text-[#C62828] font-medium text-[11px]"
                >
                  {mark}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[#666666] italic text-[11px]">No unique marks noted yet</span>
          )}
        </div>

        {/* Location & Time */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#666666]" /> Campus Zone
            </span>
            <span className="text-[#171717] font-semibold">{fingerprint.location || 'Campus'}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#666666] block mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#666666]" /> Date / Time
            </span>
            <span className="text-[#171717] font-semibold">{fingerprint.event_time || 'Recent'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
