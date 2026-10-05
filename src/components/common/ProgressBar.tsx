import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'var(--brand-primary)',
  height = 8,
  showLabel = false,
  label,
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`progress-bar-wrapper ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            marginBottom: '0.35rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          <span>{label || 'Progress'}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
      )}
      <div
        className="progress-bar-container"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: color.startsWith('linear') ? color : color,
          }}
        />
      </div>
    </div>
  );
};
