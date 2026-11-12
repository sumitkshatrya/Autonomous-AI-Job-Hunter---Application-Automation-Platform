import React from 'react';
import { Sparkles, Send, Mail, CalendarCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        No autonomous activity logged yet. Trigger discovery or matching to view live background events.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'interview_alert':
        return <CalendarCheck className="w-4 h-4 text-purple-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
        >
          <div className="p-1.5 rounded-md bg-slate-800 shrink-0 mt-0.5">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{item.title}</h4>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

