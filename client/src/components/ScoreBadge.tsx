import React from 'react';

export const ScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({
  score,
  size = 'md',
}) => {
  let badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  if (score >= 85) {
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10';
  } else if (score >= 75) {
    badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (score >= 60) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold rounded-full border ${badgeColor} ${sizeClasses[size]}`}>
      <span>{score}%</span>
      <span className="text-[9px] uppercase font-sans tracking-wide">Match</span>
    </span>
  );
};

