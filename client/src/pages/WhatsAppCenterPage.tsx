import React, { useEffect, useState } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, Send, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const WhatsAppCenterPage: React.FC = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState('+919528865099');

  const fetchAccount = async () => {
    try {
      const [accRes, profileRes] = await Promise.allSettled([
        api.get('/whatsapp/account'),
        api.get('/profile')
      ]);
      if (accRes.status === 'fulfilled') {
        setAccount(accRes.value.data.account);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.data?.profile?.phone) {
        setTestPhone(profileRes.value.data.profile.phone);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await api.post('/whatsapp/send-test', {
        recipientPhone: testPhone,
        templateName: 'interview_invitation_urgent',
      });
      alert(res.data.message || 'WhatsApp alert dispatched!');
    } catch (err: any) {
      alert(`Error sending WhatsApp notification: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>WhatsApp Business Cloud API Automation</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Official Cloud API & Template Rules</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compliant, official Meta WhatsApp Business Cloud API integration. Delivers real-time interview invitation alerts, daily digests, and permitted recruiter outreach without unauthorized web automation.
          </p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Cloud Account</span>
            <h3 className="text-base font-bold text-white mt-1">
              {account?.businessPhoneNumber || '+1 (800) AUTOAPPLY'}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
            Connected (Active)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500">Phone Number ID</span>
            <p className="font-mono text-slate-300 mt-0.5 truncate">{account?.phoneNumberId || '104928374928172'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500">Daily Utility Limit</span>
            <p className="font-bold text-white mt-0.5">{account?.dailyQuota || 25} messages / day</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500">Opt-Out Compliance</span>
            <p className="font-bold text-emerald-400 mt-0.5">Webhook Auto STOP active</p>
          </div>
        </div>
      </div>

      {/* Approved Templates */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Approved Meta Message Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">interview_invitation_urgent</h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                APPROVED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              &quot;🚨 New Interview Invitation! Hi &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; has scheduled an interview for &#123;&#123;3&#125;&#125;. Click link to confirm.&quot;
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">application_submitted_alert</h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                APPROVED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              &quot;✅ Application Submitted! AutoApply AI successfully submitted your tailored application for &#123;&#123;1&#125;&#125; at &#123;&#123;2&#125;&#125;.&quot;
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">daily_job_hunter_digest</h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                APPROVED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              &quot;📊 Daily AutoApply Digest: &#123;&#123;1&#125;&#125; jobs discovered, &#123;&#123;2&#125;&#125; applications submitted today. You have &#123;&#123;3&#125;&#125; pending replies.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Dispatch Test Box */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Dispatch Test Template Message</span>
        </h3>
        <p className="text-xs text-slate-400">
          Verify end-to-end webhook delivery by dispatching a sample interview notification to your verified recipient number.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+919528865099"
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200"
          />
          <button
            onClick={handleSendTest}
            disabled={sendingTest}
            className="btn btn-sm btn-primary bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 text-xs font-semibold justify-center"
          >
            <Send className={`w-3.5 h-3.5 ${sendingTest ? 'animate-spin' : ''}`} />
            <span>{sendingTest ? 'Dispatching...' : 'Send WhatsApp Alert'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
