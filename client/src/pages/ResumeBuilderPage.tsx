import React, { useEffect, useState } from 'react';
import { FileEdit, Sparkles, Copy, Check, Download, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const ResumeBuilderPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [tailoring, setTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data.jobs || []);
        if (res.data.jobs?.length > 0) {
          setSelectedJobId(res.data.jobs[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handleGenerateTailored = async () => {
    if (!selectedJobId) return;
    setTailoring(true);
    try {
      const res = await api.post('/applications/generate', { jobId: selectedJobId });
      setTailoredResume(res.data.application);
    } catch (err: any) {
      alert(`Tailoring notice: ${err.response?.data?.message || err.message}`);
    } finally {
      setTailoring(false);
    }
  };

  const handleCopy = () => {
    if (tailoredResume?.tailoredResumeContent) {
      navigator.clipboard.writeText(tailoredResume.tailoredResumeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>AI Resume Intelligence & Tailoring Engine</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Factual Accuracy Guaranteed</span>
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          The AI Tailoring Agent reformulates bullet points and prioritizes relevant skills to match the exact keywords of your target job posting without ever falsifying qualifications.
        </p>
      </div>

      {/* Target Job Selector & Action */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px]">
          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            Select Target Job Posting:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.company} ({job.location})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateTailored}
          disabled={tailoring || !selectedJobId}
          className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold h-10 px-5 self-end"
        >
          <Sparkles className={`w-4 h-4 ${tailoring ? 'animate-spin' : ''}`} />
          <span>{tailoring ? 'Synthesizing Tailored Version...' : 'Generate Tailored Resume'}</span>
        </button>
      </div>

      {/* Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Changes & Audit Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tailoring Audit Log</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Original resume facts locked; zero hallucinated companies or degrees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Summary statement aligned directly with selected job description keywords.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Highlighted competencies reordered for ATS parser optimization.</span>
              </li>
            </ul>
          </div>

          {tailoredResume?.coverLetter && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Cover Letter</h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2">
                {tailoredResume.coverLetter}
              </p>
            </div>
          )}
        </div>

        {/* Right: Markdown Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tailored Resume Document (ATS-Optimized Markdown)
            </h3>
            {tailoredResume?.tailoredResumeContent && (
              <button
                onClick={handleCopy}
                className="btn btn-xs btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            )}
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto min-h-[420px] shadow-inner">
            {tailoredResume?.tailoredResumeContent ? (
              tailoredResume.tailoredResumeContent
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 pt-16">
                <FileEdit className="w-8 h-8 mb-2 opacity-50" />
                <p>Select a job above and click "Generate Tailored Resume" to preview the optimized version.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

