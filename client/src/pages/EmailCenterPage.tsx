import React, { useEffect, useState } from 'react';
import { Mail, Plus, ShieldCheck, CheckCircle2, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const EmailCenterPage: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    emailAddress: '',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
  });
  const [simulating, setSimulating] = useState(false);
  const [simReplyType, setSimReplyType] = useState('interview');
  const [testingNotification, setTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const res = await api.post('/email/test-notification', { email: 'skumar21082001@gmail.com' });
      alert(res.data?.message || 'Notification dispatched to skumar21082001@gmail.com successfully!');
    } catch (err: any) {
      alert(`Error sending test notification: ${err.response?.data?.message || err.message}`);
    } finally {
      setTestingNotification(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/email/accounts');
      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/email/connect-smtp', smtpForm);
      alert('Email account connected successfully!');
      setShowConnectModal(false);
      await fetchAccounts();
    } catch (err: any) {
      alert(`Error connecting email: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSimulateReply = async () => {
    setSimulating(true);
    let subject = 'Invitation to Interview - Technical Round';
    let body = 'Hi, We reviewed your application and would love to schedule a 45-minute video interview. Let us know your availability for this coming Tuesday: https://calendly.com/techcorp/interview';

    if (simReplyType === 'rejection') {
      subject = 'Update on your application with CloudFlow';
      body = 'Thank you for your interest. Unfortunately, we have decided to pursue other applicants whose qualifications more closely align with the role.';
    } else if (simReplyType === 'assessment') {
      subject = 'Next Steps: Technical Coding Assessment';
      body = 'Please complete the following Hackerrank assessment link within 48 hours to proceed to the engineering team review.';
    }

    try {
      await api.post('/email/simulate-reply', {
        senderEmail: 'recruiter@techcorp.io',
        subject,
        body,
      });
      alert('Inbound email simulated! The Email Intelligence Agent has classified the reply and updated your application status.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Email Center & Reply Intelligence</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>OAuth 2.0 & SMTP Integration</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect your mailbox for authorized 1-to-1 recruiter sending and autonomous reply intelligence (detecting interview dates, rejections, and next steps).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTestNotification}
            disabled={testingNotification}
            className="btn btn-sm btn-outline border-blue-500/40 text-blue-400 hover:bg-blue-950/40 hover:text-white rounded-lg gap-1.5 text-xs font-semibold"
            title="Dispatch a test job application notification to your Gmail"
          >
            <Mail className={`w-3.5 h-3.5 ${testingNotification ? 'animate-spin' : ''}`} />
            <span>{testingNotification ? 'Sending Alert...' : 'Test Gmail Alert'}</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Email Account</span>
          </button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Active Connected Mailboxes</h3>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading email configuration...</div>
        ) : accounts.length === 0 ? (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-200">No external mailbox connected yet.</p>
            <p>
              When no account is attached, the system operates in verified sandbox mode, logging simulated outreach safely without sending unapproved emails.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="btn btn-xs btn-outline border-slate-700 text-blue-400 hover:bg-slate-800 rounded-lg mt-2"
            >
              Configure SMTP or Gmail
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc._id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{acc.emailAddress}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    {acc.provider}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Daily Quota: {acc.emailsSentToday} / {acc.dailyQuota} sent today
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Intelligence Test Bench */}
      <div className="p-6 rounded-2xl border border-blue-900/30 bg-blue-950/10 space-y-4">
        <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Test AI Email Monitoring & Reply Classification</span>
        </h3>
        <p className="text-xs text-slate-400">
          Simulate an inbound recruiter response to verify that the Email Monitoring Agent automatically classifies intent, extracts interview calendar invites, and alerts you.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={simReplyType}
            onChange={(e) => setSimReplyType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            <option value="interview">Simulate Interview Invitation Email</option>
            <option value="assessment">Simulate Technical Assessment Link</option>
            <option value="rejection">Simulate Polite Rejection Notice</option>
          </select>

          <button
            onClick={handleSimulateReply}
            disabled={simulating}
            className="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Processing Response...' : 'Simulate Inbound Message'}</span>
          </button>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Connect SMTP Email Account</h3>
              <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectSmtp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={smtpForm.emailAddress}
                  onChange={(e) => setSmtpForm({ ...smtpForm, emailAddress: e.target.value })}
                  placeholder="your.name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={smtpForm.user}
                  onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password or App Password</label>
                <input
                  type="password"
                  required
                  value={smtpForm.pass}
                  onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                  placeholder="App-specific password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn btn-sm btn-ghost text-slate-400 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

