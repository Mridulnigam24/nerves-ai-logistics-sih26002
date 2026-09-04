import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  score: number;
  level?: RiskLevel;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showPercent = true, size = 'md' }) => {
  const computedLevel =
    level || (score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : score <= 80 ? 'HIGH' : 'CRITICAL');

  const colorStyles = {
    LOW: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    HIGH: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse',
  }[computedLevel];

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${colorStyles} ${sizeStyles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          computedLevel === 'LOW'
            ? 'bg-emerald-400'
            : computedLevel === 'MEDIUM'
            ? 'bg-amber-400'
            : computedLevel === 'HIGH'
            ? 'bg-orange-400'
            : 'bg-rose-400'
        }`}
      />
      {computedLevel} {showPercent && <span className="font-mono opacity-90">({score}%)</span>}
    </span>
  );
};
