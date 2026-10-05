import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'high' | 'medium' | 'low';
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  color,
  className = '',
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    if (color) {
      return {
        backgroundColor: `${color}1a`, // ~10% opacity
        color: color,
        border: `1px solid ${color}33`,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--brand-primary)',
        };
      case 'success':
      case 'low':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--color-success)',
        };
      case 'warning':
      case 'medium':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.14)',
          color: 'var(--color-warning)',
        };
      case 'danger':
      case 'high':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--color-danger)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          color: 'var(--color-info)',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--bg-card-subtle)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        };
    }
  };

  return (
    <span
      className={`badge ${className}`}
      style={getVariantStyles()}
    >
      {children}
    </span>
  );
};
