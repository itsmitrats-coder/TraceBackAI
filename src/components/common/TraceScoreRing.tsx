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

  const dims = {
    sm: { size: 44, stroke: 4, text: 'text-xs font-bold', subtext: 'text-[9px]' },
    md: { size: 68, stroke: 5, text: 'text-sm font-extrabold', subtext: 'text-[10px]' },
    lg: { size: 88, stroke: 6, text: 'text-xl font-black', subtext: 'text-xs font-semibold' },
    xl: { size: 110, stroke: 7, text: 'text-2xl font-black', subtext: 'text-xs font-bold' },
  }[size];

  const radius = (dims.size - dims.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Student-friendly match label
  let strokeColor = '#E53935'; // Brand Red
  let labelText = 'Match';
  let badgeClasses = 'text-[#E53935] bg-[#FFF0F0] border-[#FFCDD2]';

  if (clampedScore >= 85) {
    strokeColor = '#E53935';
    labelText = 'Great Match';
    badgeClasses = 'text-[#C62828] bg-[#FFF0F0] border-[#FFCDD2]';
  } else if (clampedScore >= 70) {
    strokeColor = '#E53935';
    labelText = 'Possible Match';
    badgeClasses = 'text-[#E53935] bg-[#FFF7F7] border-[#FFE4E6]';
  } else if (clampedScore >= 50) {
    strokeColor = '#F59E0B'; // Restrained amber
    labelText = 'Maybe?';
    badgeClasses = 'text-amber-800 bg-amber-50 border-amber-200';
  } else {
    strokeColor = '#9CA3AF'; // Gray
    labelText = 'Unlikely';
    badgeClasses = 'text-gray-600 bg-gray-50 border-gray-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: dims.size, height: dims.size }}>
        <svg className="transform -rotate-90" width={dims.size} height={dims.size}>
          {/* Subtle light track */}
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={radius}
            stroke="#F5F5F5"
            strokeWidth={dims.stroke}
            fill="transparent"
          />
          {/* Active red arc */}
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
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dims.text} text-[#171717] font-sans tracking-tight`}>
            {clampedScore}%
          </span>
          {size !== 'sm' && (
            <span className={`${dims.subtext} font-medium text-[#666666] leading-none`}>
              match
            </span>
          )}
        </div>
      </div>

      {showLabel && size !== 'sm' && (
        <span className={`mt-2 text-xs px-2.5 py-0.5 rounded-full border ${badgeClasses} font-semibold`}>
          {labelText}
        </span>
      )}
    </div>
  );
};
