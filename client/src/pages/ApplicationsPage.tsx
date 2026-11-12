import React, { useEffect, useState } from 'react';
import { Send, Eye, RefreshCw, CheckCircle2, Clock, AlertTriangle, FileText, Check } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { api } from '../lib/api';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications', {
        params: { status: statusFilter || undefined },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  const handleSubmitApp = async (appId: string) => {
    setIsSubmitting(true);
    try {
      await api.post(`/applications/${appId}/submit`);
      await fetchApps();
      if (selectedApp?._id === appId) {
        const updated = await api.get(`/applications/${appId}`);
        setSelectedApp(updated.data.application);
      }
    } catch (err: any) {
      alert(`Error submitting: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Applications Tracking Board</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of all autonomous submissions, official ATS confirmation receipts, and recruiter reviews.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 self-start sm:self-auto"
        >
          <option value="">Status: All Applications</option>
          <option value="ready">Ready for Submission</option>
          <option value="submitting">Submitting in Background</option>
          <option value="applied">Applied (Confirmed)</option>
          <option value="under_review">Under Review</option>
          <option value="interview">Interview Scheduled</option>
          <option value="offer">Offer Received</option>
          <option value="failed">Failed / Manual Handoff</option>
        </select>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-xl border border-slate-800 bg-slate-900/30">
          No applications recorded yet. Head over to "AI Recommendations" or "Discover Jobs" to queue autonomous submissions!
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Target Role & Company</th>
                <th className="p-4">Submission Adapter</th>
                <th className="p-4">Status</th>
                <th className="p-4">Confirmation ID</th>
                <th className="p-4">Timeline / Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{app.jobId?.title || 'Engineer'}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{app.jobId?.company}</div>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {app.submissionMethod}
                  </td>
                  <td className="p-4">
                    <StatusPill status={app.status} />
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {app.submissionResult?.confirmationId || '—'}
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="btn btn-xs btn-ghost text-slate-300 hover:text-white rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    {app.status === 'ready' && (
                      <button
                        onClick={() => handleSubmitApp(app._id)}
                        disabled={isSubmitting}
                        className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedApp.jobId?.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedApp.jobId?.company}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="btn btn-xs btn-circle btn-ghost text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Submission Receipt */}
            {selectedApp.submissionResult?.confirmationId && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified ATS Submission Receipt</span>
                </span>
                <p className="text-slate-300 font-mono text-[11px]">
                  Ref: {selectedApp.submissionResult.confirmationId}
                </p>
                <p className="text-slate-400 text-[11px]">{selectedApp.submissionResult.details}</p>
              </div>
            )}

            {/* Factual Answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Submitted Screening Answers
              </h4>
              <div className="space-y-2">
                {selectedApp.answers?.map((ans: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <p className="font-semibold text-slate-300">{ans.question}</p>
                    <p className="text-slate-400 text-[11px]">{ans.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Generated Cover Letter
              </h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedApp.coverLetter}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

