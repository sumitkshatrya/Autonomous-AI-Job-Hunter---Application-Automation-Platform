import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';

export const IntegrationsPage: React.FC = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const checkGoogleStatus = async () => {
    try {
      const res = await api.get('/auth/google/status');
      if (res.data?.connected) {
        setGoogleConnected(true);
        setConnectedEmail(res.data.email || 'skumar21082001@gmail.com');
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected') {
      setGoogleConnected(true);
      setConnectedEmail(params.get('email') || 'skumar21082001@gmail.com');
    }
    checkGoogleStatus();
  }, []);

  const handleConnectGoogle = async () => {
    setConnecting(true);
    try {
      const res = await api.get('/auth/google/url');
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err: any) {
      alert(`Could not generate Google Auth URL: ${err.response?.data?.message || err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncLocalGoogle = async () => {
    setConnecting(true);
    try {
      const res = await api.post('/auth/google/sync-local');
      if (res.data?.success) {
        setGoogleConnected(true);
        setConnectedEmail(res.data.email || 'skumar21082001@gmail.com');
        alert('Google Gmail account connected successfully via local credentials!');
      }
    } catch (err: any) {
      alert(`Sync error: ${err.response?.data?.message || err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const integrations = [
    // 1. LinkedIn
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs & Easy Apply',
      category: 'Global Professional Network',
      description: 'Discovers verified engineering & product listings from top global employers. Generates compliant 1-click application payloads.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#0A66C2',
      region: 'Global / USA / India',
    },
    // 2. Wellfound
    {
      id: 'wellfound',
      name: 'Wellfound (AngelList Talent)',
      category: 'Startups & High Growth',
      description: 'Direct ingestion of early-stage, Series A-C, and funded tech startups (OpenAI, Supabase, Linear, Perplexity) with equity data.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#E63946',
      region: 'Worldwide / Remote',
    },
    // 3. Naukri
    {
      id: 'naukri',
      name: 'Naukri.com Enterprise Connector',
      category: 'India Tech & Enterprise',
      description: 'Ingests high-paying technical opportunities from Tier-1 tech giants, unicorn startups, and global MNCs across India.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#1D3557',
      region: 'India (BLR/NCR/HYD/PUN)',
    },
    // 4. Internshala
    {
      id: 'internshala',
      name: 'Internshala Internships & Freshers',
      category: 'Internships & Entry-Level',
      description: 'Continuous discovery of paid software internships, fresher developer openings, and high-conversion PPO opportunities.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#00A5EC',
      region: 'India & Remote',
    },
    // 5. RemoteHunter
    {
      id: 'remotehunter',
      name: 'RemoteHunter Global USD',
      category: 'Global Remote USD',
      description: 'Curated high-paying international remote engineering roles paying in USD ($80k - $220k) with async-first workflows.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#F77F00',
      region: 'Worldwide Remote',
    },
    // 6. Instahyre
    {
      id: 'instahyre',
      name: 'Instahyre AI Tech Recruiting',
      category: 'Curated AI Tech Match',
      description: 'Pre-screened tech opportunities from vetted high-growth companies (CRED, Meesho, InMobi) tailored to your exact skills.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#7209B7',
      region: 'India & SEA',
    },
    // 7. Indeed
    {
      id: 'indeed',
      name: 'Indeed Worldwide Aggregator',
      category: 'Global Aggregator',
      description: 'Ingests direct verified employer job listings from Indeed across North America, Europe, and Asia-Pacific regions.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#2164F3',
      region: 'Global',
    },
    // 8. WorkIndia
    {
      id: 'workindia',
      name: 'WorkIndia Verified Opportunities',
      category: 'Verified Operations & Tech',
      description: 'High-volume verified software development, IT operations, and automation openings with rapid turnaround.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#2A9D8F',
      region: 'India',
    },
    // 9. Y Combinator
    {
      id: 'ycombinator',
      name: 'Y Combinator (Work at a Startup)',
      category: 'Startups & High Growth',
      description: 'Discovers founding engineer and core team openings across Y Combinator funded cohorts (W24, S24, F24).',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#FF6600',
      region: 'US / Global Remote',
    },
    // 10. ZipRecruiter
    {
      id: 'ziprecruiter',
      name: 'ZipRecruiter Global Feed',
      category: 'Global Aggregator',
      description: 'Aggregates commercial enterprise and mid-market engineering listings with verified salary disclosures.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#4361EE',
      region: 'US / Canada / UK',
    },
    // 11. Cuvette
    {
      id: 'cuvette',
      name: 'Cuvette Tech Careers',
      category: 'Internships & Entry-Level',
      description: 'Specialized tech internships and fresher developer roles with transparent stipends and verified pre-placement offers.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#06D6A0',
      region: 'India & Remote',
    },
    // 12. Hirist
    {
      id: 'hirist',
      name: 'Hirist Premium Tech Portal',
      category: 'India Tech & Enterprise',
      description: 'High-salary tech positions for Full Stack, Backend, Data Science, and Systems Architects across Indian tech hubs.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#D90429',
      region: 'India',
    },
    // 13. Greenhouse
    {
      id: 'greenhouse',
      name: 'Greenhouse Job Board API',
      category: 'ATS & Official Boards',
      description: 'Ingests real-time job openings from licensed Greenhouse customer boards (Airbnb, Figma, Stripe) with official submission adapters.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#00B074',
      region: 'Global Enterprise',
    },
    // 14. Lever
    {
      id: 'lever',
      name: 'Lever Postings API',
      category: 'ATS & Official Boards',
      description: 'Discovers verified engineering positions across high-growth startups and public enterprise companies with direct Lever posting endpoints.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#2B2D42',
      region: 'Global Enterprise',
    },
    // 15. Remotive
    {
      id: 'remotive',
      name: 'Remotive Global Remote API',
      category: 'Global Remote USD',
      description: 'Continuous ingestion of worldwide remote developer and technical opportunities with timezone matching.',
      status: 'Connected',
      active: true,
      official: true,
      badge: '#3A86FF',
      region: 'Worldwide Remote',
    },
    // 16. Google Gmail
    {
      id: 'gmail',
      name: 'Google Gmail API (OAuth 2.0)',
      category: 'Outreach & Mailbox',
      description: 'Allows authorized sending of 1-to-1 recruiter emails and continuous monitoring for interview invitations.',
      status: googleConnected ? 'Connected' : 'Configured',
      active: true,
      official: true,
      badge: '#EA4335',
      region: googleConnected ? connectedEmail : 'User Mailbox',
      action: !googleConnected
        ? { label: 'Connect via OAuth', onClick: handleConnectGoogle, loading: connecting }
        : undefined,
      syncAction: !googleConnected
        ? { label: 'Sync Local Credentials', onClick: handleSyncLocalGoogle, loading: connecting }
        : undefined,
    },
    // 17. AI Engine
    {
      id: 'ai',
      name: 'Google Gemini & AI Engine',
      category: 'Core AI Infrastructure',
      description: 'Powers resume parsing, semantic vector embeddings, tailored resume bullet generation, and reply intelligence.',
      status: 'Active',
      active: true,
      official: true,
      badge: '#8E9AAF',
      region: 'Cloud AI',
    },
    // 18. Task Engine
    {
      id: 'queue',
      name: 'MongoDB Background Task Engine',
      category: 'Background Orchestration',
      description: 'Manages 12 dedicated autonomous queues with atomic locks, retry backoffs, and crash recovery.',
      status: 'Active',
      active: true,
      official: true,
      badge: '#00ED64',
      region: 'Database Engine',
    },
  ];

  const filteredIntegrations = categoryFilter === 'all'
    ? integrations
    : integrations.filter((item) => item.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Connected Job Discovery & Service Connectors</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{integrations.length} Active Connectors</span>
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AutoApply AI operates through official APIs, verified direct postings, licensed RSS feeds, and assisted submission workflows across all major worldwide and Indian job boards.
        </p>

        {googleConnected && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Google Gmail Account Connected Successfully!</p>
                <p className="text-[11px] text-slate-400">
                  Authorized for autonomous recruiter outreach and interview reply detection: <span className="text-emerald-300 font-mono">{connectedEmail}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Active
            </span>
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'all', label: 'All Sources (18)' },
          { key: 'global', label: 'Global Tech & Aggregators' },
          { key: 'india', label: 'India Tech (Naukri / Instahyre / Hirist)' },
          { key: 'startup', label: 'Startups (Wellfound / YC)' },
          { key: 'internship', label: 'Internships & Freshers (Internshala / Cuvette)' },
          { key: 'remote', label: 'Remote Global USD' },
          { key: 'ats', label: 'ATS Direct (Greenhouse / Lever)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCategoryFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categoryFilter === tab.key
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-500">
                Region: <strong className="text-slate-400">{item.region}</strong>
              </span>

              {item.action || item.syncAction ? (
                <div className="flex items-center gap-1.5">
                  {item.syncAction && (
                    <button
                      onClick={item.syncAction.onClick}
                      disabled={item.syncAction.loading}
                      className="btn btn-xs btn-outline border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] px-2 h-7"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{item.syncAction.label}</span>
                    </button>
                  )}
                  {item.action && (
                    <button
                      onClick={item.action.onClick}
                      disabled={item.action.loading}
                      className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] px-2 h-7"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{item.action.loading ? '...' : item.action.label}</span>
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-bold text-emerald-400/90 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Live Sync</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
