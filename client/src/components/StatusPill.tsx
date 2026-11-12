import React from 'react';
import { ApplicationStatus } from '@autoapply/shared';

export const StatusPill: React.FC<{ status: ApplicationStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    draft: 'bg-slate-800 text-slate-400 border-slate-700',
    ready: 'bg-indigo-950 text-indigo-400 border-indigo-800',
    submitting: 'bg-blue-950 text-blue-400 border-blue-800 animate-pulse',
    applied: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    failed: 'bg-rose-950 text-rose-400 border-rose-800',
    under_review: 'bg-amber-950 text-amber-400 border-amber-800',
    interview: 'bg-purple-950 text-purple-300 border-purple-800 font-bold shadow-sm shadow-purple-500/20',
    rejected: 'bg-slate-900 text-slate-500 border-slate-800',
    offer: 'bg-emerald-900 text-emerald-200 border-emerald-500 font-extrabold shadow-sm shadow-emerald-500/40',
    withdrawn: 'bg-slate-900 text-slate-500 border-slate-800',
  };

  const currentStyle = styles[status] || 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${currentStyle}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

