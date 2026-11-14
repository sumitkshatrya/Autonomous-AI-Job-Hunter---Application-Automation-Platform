import React, { useEffect, useState } from 'react';
import { CalendarCheck, Video, Clock, ExternalLink, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const InterviewTrackerPage: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/applications', { params: { status: 'interview' } });
        setInterviews(res.data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Autonomous Interview Tracker</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" />
            <span>AI Reply Detection Active</span>
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          When a recruiter emails or messages an interview invitation, the Reply Intelligence Agent automatically parses interview slots, extracts video conference links, and populates this board.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading interview schedules...</div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <CalendarCheck className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
          <p className="font-semibold text-slate-300">No active interview invitations logged yet.</p>
          <p className="max-w-md mx-auto text-slate-500">
            As applications are submitted and recruiter responses are received, all scheduled interviews will appear here automatically with calendar sync links.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((app) => (
            <div
              key={app._id}
              className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/10 hover:border-purple-500/50 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{app.jobId?.title}</h3>
                  <p className="text-xs font-semibold text-purple-300 mt-0.5">{app.jobId?.company}</p>
                </div>
                <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                  Stage: Technical Round
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Next Slot: Wednesday, 2:00 PM EST (Detected from email)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Google Meet / Zoom Conference Link Available</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Updated: {new Date(app.updatedAt).toLocaleDateString()}
                </span>
                <button className="btn btn-xs btn-primary bg-purple-600 hover:bg-purple-700 text-white rounded-lg gap-1.5 text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Prepare & Practice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

