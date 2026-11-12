import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Send,
  Mail,
  MessageSquare,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { StatusPill } from '../components/StatusPill';
import { api } from '../lib/api';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, activityRes] = await Promise.all([
          api.get('/analytics/metrics'),
          api.get('/analytics/activity'),
        ]);
        setMetrics(metricsRes.data.metrics);
        setActivity(activityRes.data.feed || []);
        setRecentApps(activityRes.data.recentApplications || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/40 border border-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold border border-blue-500/20 uppercase tracking-wider">
            Autonomous Pipeline Running
          </span>
          <h2 className="text-2xl font-black text-white mt-3 tracking-tight">
            Find Jobs. Apply Automatically. <span className="text-blue-400">Get Hired.</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            AutoApply AI continuously ingests worldwide job boards, calculates weighted vector match scores, generates tailored truthful application documents, and submits applications autonomously through authorized integrations.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => navigate('/recommendations')}
              className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review AI Matches</span>
            </button>
            <button
              onClick={() => navigate('/applications')}
              className="btn btn-sm btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg text-xs"
            >
              <span>View Application Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 10 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Jobs Discovered"
          value={metrics?.jobsDiscovered ?? 0}
          icon={Search}
          subtext="Worldwide boards"
          color="blue"
        />
        <MetricCard
          label="Eligible Jobs"
          value={metrics?.eligibleJobs ?? 0}
          icon={CheckCircle2}
          subtext="Authorization match"
          color="indigo"
        />
        <MetricCard
          label="Strong Matches"
          value={metrics?.strongMatches ?? 0}
          icon={Sparkles}
          subtext="Score ≥ 85%"
          color="purple"
        />
        <MetricCard
          label="Submitted Apps"
          value={metrics?.applicationsSubmitted ?? 0}
          icon={Send}
          subtext="Via official ATS/APIs"
          color="emerald"
        />
        <MetricCard
          label="Failed Submissions"
          value={metrics?.failedSubmissions ?? 0}
          icon={XCircle}
          subtext="Flagged for handoff"
          color="rose"
        />
        <MetricCard
          label="Recruiter Emails"
          value={metrics?.recruiterEmailsSent ?? 0}
          icon={Mail}
          subtext="Personalized outreach"
          color="blue"
        />
        <MetricCard
          label="WhatsApp Alerts"
          value={metrics?.whatsAppMessagesSent ?? 0}
          icon={MessageSquare}
          subtext="Cloud API notifications"
          color="emerald"
        />
        <MetricCard
          label="Replies Received"
          value={metrics?.repliesReceived ?? 0}
          icon={TrendingUp}
          subtext="Classified by AI"
          color="amber"
        />
        <MetricCard
          label="Interviews Scheduled"
          value={metrics?.interviewsScheduled ?? 0}
          icon={CalendarCheck}
          subtext="Calendar invites detected"
          color="purple"
        />
        <MetricCard
          label="Offers Received"
          value={metrics?.offersReceived ?? 0}
          icon={Trophy}
          subtext="Final offers"
          color="emerald"
        />
      </div>

      {/* Live Pipeline Feed & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Autonomous Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Recent Application Activity</span>
            </h3>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View all
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            {recentApps.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No applications submitted yet. Ready to submit qualified jobs automatically.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Company & Role</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentApps.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{app.jobId?.title || 'Engineer'}</div>
                        <div className="text-[11px] text-slate-500">{app.jobId?.company || 'Company'}</div>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {app.submissionMethod}
                      </td>
                      <td className="p-3.5">
                        <StatusPill status={app.status} />
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Live Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live System Activity Feed
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold animate-pulse">● LIVE</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <ActivityFeed items={activity} />
          </div>
        </div>
      </div>
    </div>
  );
};

