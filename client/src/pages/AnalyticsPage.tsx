import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Download, Copy, Check, Sparkles, Trophy, Target } from 'lucide-react';
import { api } from '../lib/api';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/analytics/metrics');
        setMetrics(res.data.metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const generateReportMarkdown = () => {
    const today = new Date().toLocaleDateString();
    return `# 📊 AutoApply AI - Daily Autonomous Performance Report (${today})

### Key Highlights
- **Jobs Discovered Worldwide:** ${metrics?.jobsDiscovered || 0}
- **Candidate Eligible Jobs:** ${metrics?.eligibleJobs || 0}
- **Strong AI Matches (≥85%):** ${metrics?.strongMatches || 0}
- **Autonomous Applications Submitted:** ${metrics?.applicationsSubmitted || 0}
- **Recruiter 1-to-1 Outreach Emails Sent:** ${metrics?.recruiterEmailsSent || 0}
- **WhatsApp Cloud Alerts Dispatched:** ${metrics?.whatsAppMessagesSent || 0}
- **Recruiter Responses Received:** ${metrics?.repliesReceived || 0}
- **Interviews Scheduled:** ${metrics?.interviewsScheduled || 0}
- **Offers Received:** ${metrics?.offersReceived || 0}

---
*Report synthesized automatically by AutoApply AI Background Analytics Worker.*
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportMarkdown());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Analytics & Performance Intelligence</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Persisted DB Metrics
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real quantitative tracking across the entire job hunting and application funnel.
          </p>
        </div>

        <button
          onClick={handleCopyReport}
          className="btn btn-sm btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedReport ? 'Report Copied!' : 'Copy Daily Report (Markdown)'}</span>
        </button>
      </div>

      {/* Conversion Funnel */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span>Autonomous Conversion Funnel</span>
        </h3>

        <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">1. Jobs Discovered</span>
              <span className="text-white font-mono font-bold">{metrics?.jobsDiscovered || 0}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-full"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">2. Strong Matches (≥85%)</span>
              <span className="text-white font-mono font-bold">{metrics?.strongMatches || 0}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full"
                style={{
                  width: `${metrics?.jobsDiscovered ? Math.min(100, ((metrics?.strongMatches || 0) / metrics.jobsDiscovered) * 100) : 40}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">3. Applications Submitted</span>
              <span className="text-white font-mono font-bold">{metrics?.applicationsSubmitted || 0}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{
                  width: `${metrics?.jobsDiscovered ? Math.min(100, ((metrics?.applicationsSubmitted || 0) / metrics.jobsDiscovered) * 100) : 25}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">4. Recruiter Replies Received</span>
              <span className="text-white font-mono font-bold">{metrics?.repliesReceived || 0}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full"
                style={{
                  width: `${metrics?.applicationsSubmitted ? Math.min(100, ((metrics?.repliesReceived || 0) / metrics.applicationsSubmitted) * 100) : 15}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">5. Interviews Scheduled</span>
              <span className="text-white font-mono font-bold">{metrics?.interviewsScheduled || 0}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full"
                style={{
                  width: `${metrics?.applicationsSubmitted ? Math.min(100, ((metrics?.interviewsScheduled || 0) / metrics.applicationsSubmitted) * 100) : 10}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Performance Report Preview */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Daily Performance Digest Preview</span>
        </h3>
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
          {generateReportMarkdown()}
        </pre>
      </div>
    </div>
  );
};

