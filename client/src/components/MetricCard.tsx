import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: React.ElementType;
  trend?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  const colorStyles = {
    blue: 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    amber: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-600/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    indigo: 'from-indigo-600/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorStyles[color]} border backdrop-blur-sm transition-all hover:border-slate-600`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black text-white tracking-tight">{value}</span>
        {trend && <span className="text-[11px] font-semibold text-emerald-400">{trend}</span>}
      </div>
      {subtext && <p className="mt-1 text-[11px] text-slate-500">{subtext}</p>}
    </div>
  );
};

