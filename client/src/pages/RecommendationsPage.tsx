import React, { useEffect, useState } from 'react';
import { Sparkles, Check, X, Send, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { ScoreBadge } from '../components/ScoreBadge';
import { api } from '../lib/api';

export const RecommendationsPage: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [submittingMatchId, setSubmittingMatchId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matching/recommendations');
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRunEvaluation = async () => {
    setIsMatching(true);
    try {
      await api.post('/matching/evaluate');
      await fetchMatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error running matching engine');
    } finally {
      setIsMatching(false);
    }
  };

  const handleApply = async (match: any) => {
    setSubmittingMatchId(match._id);
    try {
      const genRes = await api.post('/applications/generate', { jobId: match.jobId._id });
      const appId = genRes.data.application._id;
      await api.post(`/applications/${appId}/submit`);
      alert(`Autonomous submission dispatched to ${match.jobId.company}!`);
    } catch (err: any) {
      alert(`Submission note: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingMatchId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Job Recommendations</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Vector & Weighted Scoring
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Jobs ranked according to Skills (35%), Experience (25%), Title (15%), Location (10%), Seniority (10%), and Keywords (5%).
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={isMatching}
          className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
          <span>{isMatching ? 'Calculating Vector Fits...' : 'Re-Evaluate Matches'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          Loading personalized AI recommendations...
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-xl border border-slate-800 bg-slate-900/30">
          No matches found yet. Make sure you have uploaded your resume in "My Resume", then click "Re-Evaluate Matches".
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match._id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Top row: Job details & Score Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{match.jobId?.title}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {match.jobId?.company}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {match.jobId?.location} • <span className="capitalize">{match.jobId?.workplaceType}</span> • {match.jobId?.employmentType}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreBadge score={match.matchScore} size="lg" />
                  <button
                    onClick={() => handleApply(match)}
                    disabled={submittingMatchId === match._id}
                    className="btn btn-sm btn-primary bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingMatchId === match._id ? 'Submitting...' : 'Submit Autonomous Application'}</span>
                  </button>
                </div>
              </div>

              {/* AI Reasoning Quote */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-blue-300/90 leading-relaxed">
                <span className="font-bold text-blue-400">AI Analysis: </span>
                {match.reasoning}
              </div>

              {/* Score Breakdown Bars */}
              {match.breakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Skills ({match.breakdown.skillsScore}/35)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${(match.breakdown.skillsScore / 35) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Experience ({match.breakdown.experienceScore}/25)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(match.breakdown.experienceScore / 25) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Title Match ({match.breakdown.jobTitleScore}/15)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${(match.breakdown.jobTitleScore / 15) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Location ({match.breakdown.locationScore}/10)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${(match.breakdown.locationScore / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Seniority ({match.breakdown.seniorityScore}/10)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${(match.breakdown.seniorityScore / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500">Keywords ({match.breakdown.keywordsScore}/5)</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${(match.breakdown.keywordsScore / 5) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Overlap Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400">Matched Skills:</span>
                {match.matchedSkills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                  >
                    <Check className="w-3 h-3" />
                    <span>{skill}</span>
                  </span>
                ))}

                {match.missingSkills?.length > 0 && (
                  <>
                    <span className="text-[11px] font-bold text-slate-400 ml-2">Unmatched:</span>
                    {match.missingSkills?.slice(0, 4).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium"
                      >
                        <X className="w-3 h-3" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

