import React, { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  Filter,
  RefreshCw,
  Briefcase,
  Globe,
  Layers,
  CheckCircle2,
  Building,
  Zap,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { api } from '../lib/api';

export const DiscoverJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [workplaceType, setWorkplaceType] = useState('any');
  const [source, setSource] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Autopilot Zero-Click State
  const [autopilot, setAutopilot] = useState<any>({
    isRunning: true,
    lastRunAt: null,
    nextRunAt: null,
    totalCyclesExecuted: 0,
    totalAutonomousApplicationsSubmitted: 0,
  });
  const [togglingAutopilot, setTogglingAutopilot] = useState(false);
  const [cycleTriggered, setCycleTriggered] = useState(false);

  const fetchAutopilotStatus = async () => {
    try {
      const res = await api.get('/jobs/autopilot/status');
      if (res.data?.autopilot) {
        setAutopilot(res.data.autopilot);
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleAutopilot = async () => {
    setTogglingAutopilot(true);
    try {
      const nextState = !autopilot.isRunning;
      const res = await api.post('/jobs/autopilot/toggle', { enabled: nextState });
      if (res.data?.autopilot) {
        setAutopilot(res.data.autopilot);
      } else {
        setAutopilot((prev: any) => ({ ...prev, isRunning: nextState }));
      }
    } catch (err: any) {
      alert(`Toggle notice: ${err.message}`);
    } finally {
      setTogglingAutopilot(false);
    }
  };

  const handleTriggerAutopilotNow = async () => {
    setCycleTriggered(true);
    try {
      await api.post('/jobs/autopilot/trigger');
      setTimeout(async () => {
        await fetchAutopilotStatus();
        await fetchJobs();
        setCycleTriggered(false);
      }, 3000);
    } catch {
      setCycleTriggered(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs', {
        params: {
          query: query || undefined,
          workplaceType: workplaceType !== 'any' ? workplaceType : undefined,
          source: source || undefined,
        },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAutopilotStatus();
    const interval = setInterval(fetchAutopilotStatus, 10000);
    return () => clearInterval(interval);
  }, [workplaceType, source]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleTriggerDiscovery = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/discover');
      await fetchJobs();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyAutonomous = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      const genRes = await api.post('/applications/generate', { jobId });
      const appId = genRes.data.application._id;
      await api.post(`/applications/${appId}/submit`);
      alert('Application generated, factually verified, and submitted autonomously!');
    } catch (err: any) {
      alert(`Submission notice: ${err.response?.data?.message || err.message}`);
    } finally {
      setApplyingJobId(null);
    }
  };

  const getSourceBadge = (src: string) => {
    switch (src) {
      case 'linkedin':
        return { label: 'LinkedIn Jobs', className: 'bg-[#0A66C2]/15 text-[#3b93eb] border-[#0A66C2]/30' };
      case 'wellfound':
        return { label: 'Wellfound (AngelList)', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'naukri':
        return { label: 'Naukri.com', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'internshala':
        return { label: 'Internshala', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'remotehunter':
        return { label: 'RemoteHunter USD', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      case 'instahyre':
        return { label: 'Instahyre AI', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'indeed':
        return { label: 'Indeed Global', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'workindia':
        return { label: 'WorkIndia', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'ycombinator':
        return { label: 'Y Combinator', className: 'bg-orange-600/15 text-orange-400 border-orange-500/30' };
      case 'ziprecruiter':
        return { label: 'ZipRecruiter', className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'cuvette':
        return { label: 'Cuvette Careers', className: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
      case 'hirist':
        return { label: 'Hirist Tech', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'greenhouse':
        return { label: 'Greenhouse API', className: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30' };
      case 'lever':
        return { label: 'Lever API', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
      case 'remotive':
        return { label: 'Remotive Remote', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      default:
        return { label: src, className: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const formatSalary = (job: any) => {
    if (!job.salaryMin) return null;
    const isINR = job.salaryCurrency === 'INR';
    if (isINR) {
      if (job.salaryMin >= 100000) {
        const minLPA = (job.salaryMin / 100000).toFixed(0);
        const maxLPA = job.salaryMax ? (job.salaryMax / 100000).toFixed(0) : null;
        return maxLPA ? `₹${minLPA} - ₹${maxLPA} LPA` : `₹${minLPA} LPA`;
      }
      return `₹${job.salaryMin.toLocaleString('en-IN')}`;
    }
    const minUSD = (job.salaryMin / 1000).toFixed(0);
    const maxUSD = job.salaryMax ? (job.salaryMax / 1000).toFixed(0) : null;
    return maxUSD ? `$${minUSD}k - $${maxUSD}k` : `$${minUSD}k`;
  };

  const popularSources = [
    { key: '', label: 'All Sources' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'wellfound', label: 'Wellfound' },
    { key: 'naukri', label: 'Naukri' },
    { key: 'internshala', label: 'Internshala' },
    { key: 'remotehunter', label: 'RemoteHunter' },
    { key: 'instahyre', label: 'Instahyre' },
    { key: 'indeed', label: 'Indeed' },
    { key: 'workindia', label: 'WorkIndia' },
    { key: 'ycombinator', label: 'Y Combinator' },
    { key: 'greenhouse', label: 'Greenhouse' },
    { key: 'lever', label: 'Lever' },
    { key: 'remotive', label: 'Remotive' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Worldwide Job Discovery</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              18+ Sources Connected
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated continuously from LinkedIn, Wellfound, Naukri, Internshala, RemoteHunter, Instahyre, Indeed, WorkIndia, YC, Greenhouse, and Lever.
          </p>
        </div>

        <button
          onClick={handleTriggerDiscovery}
          disabled={isSyncing}
          className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold self-start sm:self-auto h-10 px-4 shadow-lg shadow-blue-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Ingesting Worldwide Boards...' : 'Discover New Jobs'}</span>
        </button>
      </div>

      {/* 24/7 Zero-Click Autonomous Autopilot Card */}
      <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-blue-950/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">24/7 Zero-Click Autonomous Job Hunter & Auto-Apply Engine</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{autopilot.isRunning ? 'Autopilot Active' : 'Autopilot Paused'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Single click ki zaroorat nahi hai. System background me automatically har 10 minute me worldwide platforms (LinkedIn, Naukri, Wellfound, Internshala, Indeed, WorkIndia, RemoteHunter, Greenhouse, Lever) se naye jobs dhoondhta hai, candidate profile se match karta hai, tailored application package banata hai, aur employer ATS me automatically submit kar deta hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerAutopilotNow}
              disabled={cycleTriggered}
              className="btn btn-sm btn-outline border-emerald-500/40 hover:bg-emerald-950/80 text-emerald-300 rounded-lg text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cycleTriggered ? 'animate-spin' : ''}`} />
              <span>{cycleTriggered ? 'Hunting & Applying...' : 'Run Cycle Now'}</span>
            </button>
            <button
              onClick={handleToggleAutopilot}
              disabled={togglingAutopilot}
              className={`btn btn-sm rounded-lg text-xs font-bold gap-1.5 ${
                autopilot.isRunning
                  ? 'btn-outline border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'btn-success bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {autopilot.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Autopilot</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Autopilot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Total Cycles Run</span>
            <span className="text-base font-black text-white">{autopilot.totalCyclesExecuted || 0}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-emerald-400 block font-semibold">Autonomously Submitted</span>
            <span className="text-base font-black text-emerald-400">{autopilot.totalAutonomousApplicationsSubmitted || 0} Apps</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Last Active Cycle</span>
            <span className="text-xs font-medium text-slate-300">
              {autopilot.lastRunAt ? new Date(autopilot.lastRunAt).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Next Scheduled Run</span>
            <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{autopilot.nextRunAt ? new Date(autopilot.nextRunAt).toLocaleTimeString() : 'In ~10 mins'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Source Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {popularSources.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSource(s.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              source === s.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role, skills, keywords, or company..."
            className="input input-sm input-bordered w-full pl-9 bg-slate-950 text-white text-xs rounded-lg border-slate-700"
          />
        </div>

        <div>
          <select
            value={workplaceType}
            onChange={(e) => setWorkplaceType(e.target.value)}
            className="select select-sm select-bordered w-full bg-slate-950 text-white text-xs rounded-lg border-slate-700"
          >
            <option value="any">Any Workplace</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>
        </div>

        <div>
          <button type="submit" className="btn btn-sm btn-outline border-slate-700 hover:bg-slate-800 text-white w-full rounded-lg text-xs font-semibold">
            Filter Jobs
          </button>
        </div>
      </form>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading verified opportunities...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/20 rounded-xl border border-slate-800">
          No job postings found matching your active filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const badge = getSourceBadge(job.source);
            const salaryText = formatSalary(job);

            return (
              <div
                key={job._id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors mt-2">
                        {job.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{job.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{job.location || job.country}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 capitalize ml-1">
                        {job.workplaceType}
                      </span>
                    </div>

                    {salaryText && (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>{salaryText}</span>
                      </div>
                    )}
                  </div>

                  {job.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.skillsRequired.slice(0, 4).map((skill: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500">
                          +{job.skillsRequired.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-ghost text-slate-400 hover:text-white rounded-lg gap-1 flex-1 text-[11px]"
                  >
                    <span>View Posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleApplyAutonomous(job._id)}
                    disabled={applyingJobId === job._id}
                    className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1 flex-1 text-[11px] font-bold shadow-md shadow-blue-600/20"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{applyingJobId === job._id ? 'Submitting...' : 'Apply Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
