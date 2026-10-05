import React from 'react';

interface TraceScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const TraceScoreRing: React.FC<TraceScoreRingProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Dimensions
  const dims = {
    sm: { size: 48, stroke: 4, text: 'text-xs', subtext: 'text-[9px]' },
    md: { size: 76, stroke: 6, text: 'text-base font-bold', subtext: 'text-[10px]' },
    lg: { size: 104, stroke: 8, text: 'text-2xl font-black', subtext: 'text-xs font-semibold' },
    xl: { size: 140, stroke: 10, text: 'text-3xl font-black', subtext: 'text-xs font-bold' },
  }[size];

  const radius = (dims.size - dims.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color scheme based on confidence
  let strokeColor = '#3B82F6'; // Blue
  let glowColor = 'rgba(59, 130, 246, 0.4)';
  let labelText = 'Match';
  let badgeColor = 'text-blue-400 bg-blue-950/60 border-blue-800';

  if (clampedScore >= 85) {
    strokeColor = '#10B981'; // Mint / Emerald
    glowColor = 'rgba(16, 185, 129, 0.4)';
    labelText = 'High Match';
    badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
  } else if (clampedScore >= 70) {
    strokeColor = '#38BDF8'; // Sky Blue
    glowColor = 'rgba(56, 189, 248, 0.4)';
    labelText = 'Strong Match';
    badgeColor = 'text-sky-400 bg-sky-950/60 border-sky-800';
  } else if (clampedScore >= 50) {
    strokeColor = '#F59E0B'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    labelText = 'Ambiguous';
    badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
  } else {
    strokeColor = '#64748B'; // Slate
    glowColor = 'rgba(100, 116, 139, 0.2)';
    labelText = 'Low Match';
    badgeColor = 'text-slate-400 bg-slate-900 border-slate-700';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: dims.size, height: dims.size }}>
        <svg className="transform -rotate-90" width={dims.size} height={dims.size}>
          {/* Background Track */}
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={dims.stroke}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dims.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dims.text} text-slate-100 font-mono tracking-tight`}>
            {clampedScore}%
          </span>
          {size !== 'sm' && (
            <span className={`${dims.subtext} uppercase tracking-wider text-slate-400 font-medium`}>
              Match
            </span>
          )}
        </div>
      </div>

      {showLabel && size !== 'sm' && (
        <span className={`mt-2 text-xs px-2.5 py-0.5 rounded-full border ${badgeColor} font-medium tracking-wide`}>
          {labelText}
        </span>
      )}
    </div>
  );
};
