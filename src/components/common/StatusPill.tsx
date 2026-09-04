import React from 'react';
import { AccessibilityStatus } from '../../types';

interface StatusPillProps {
  status: AccessibilityStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const styles = {
    ACCESSIBLE: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
    RESTRICTED: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
    BLOCKED: 'bg-rose-950/70 text-rose-300 border-rose-500/60 font-bold animate-pulse',
  }[status];

  const dot = {
    ACCESSIBLE: 'bg-emerald-400',
    RESTRICTED: 'bg-amber-400',
    BLOCKED: 'bg-rose-400',
  }[status];

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-mono ${styles} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
