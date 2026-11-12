import React, { useEffect, useState } from 'react';
import { Users, Mail, Send, ShieldCheck, ExternalLink, RefreshCw, CheckCircle2, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

export const RecruiterOutreachPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoverCompany, setDiscoverCompany] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [sendingContactId, setSendingContactId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, messagesRes] = await Promise.all([
        api.get('/recruiter/contacts'),
        api.get('/recruiter/messages'),
      ]);
      setContacts(contactsRes.data.contacts || []);
      setMessages(messagesRes.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDiscoverRecruiters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoverCompany) return;
    setIsDiscovering(true);
    try {
      await api.post('/recruiter/discover', { company: discoverCompany });
      setDiscoverCompany('');
      await fetchData();
    } catch (err: any) {
      alert(`Discovery notice: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSendOutreach = async (recruiterId: string) => {
    setSendingContactId(recruiterId);
    try {
      await api.post('/recruiter/send', { recruiterId });
      alert('Personalized 1-to-1 outreach dispatched successfully!');
      await fetchData();
    } catch (err: any) {
      alert(`Outreach note: ${err.response?.data?.message || err.message}`);
    } finally {
      setSendingContactId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Recruiter Discovery & Outreach Agent</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Anti-Spam & Opt-Out Enforced</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Finds publicly available professional recruiter contacts. Dispatches respectful, company-tailored 1-to-1 emails with mandatory opt-out compliance.
          </p>
        </div>
      </div>

      {/* Discover Recruiter Bar */}
      <form onSubmit={handleDiscoverRecruiters} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={discoverCompany}
          onChange={(e) => setDiscoverCompany(e.target.value)}
          placeholder="Enter target company name (e.g. Stripe, Cloudflare, Figma, Netflix)..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isDiscovering || !discoverCompany}
          className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2 text-xs font-semibold h-9 px-4"
        >
          <UserPlus className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
          <span>{isDiscovering ? 'Searching Public Directories...' : 'Find Recruiters'}</span>
        </button>
      </form>

      {/* Discovered Recruiters List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Verified Talent Partners ({contacts.length})</h3>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Loading recruiter directory...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs rounded-xl border border-slate-800 bg-slate-900/30">
            No contacts saved yet. Type a company name above to discover verified talent acquisition partners.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                      <p className="text-xs font-medium text-slate-400">{contact.role}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {contact.verificationStatus}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-blue-400 mt-2">{contact.company}</p>
                  <p className="text-xs font-mono text-slate-400 mt-1">{contact.email}</p>

                  {contact.optOut && (
                    <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      Opted Out / Do Not Contact
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  {contact.publicProfileUrl ? (
                    <a
                      href={contact.publicProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Public Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span></span>
                  )}

                  <button
                    onClick={() => handleSendOutreach(contact._id)}
                    disabled={sendingContactId === contact._id || contact.optOut}
                    className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5 text-xs font-semibold h-8 px-3"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{sendingContactId === contact._id ? 'Dispatching...' : 'Send Outreach'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Outreach Log */}
      {messages.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Outreach Messages</h3>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Recruiter</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-200">{msg.recruiterId?.name || 'Recruiter'}</td>
                    <td className="p-3.5 text-slate-400 truncate max-w-xs">{msg.subject}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                        {msg.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(msg.sentAt || msg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

