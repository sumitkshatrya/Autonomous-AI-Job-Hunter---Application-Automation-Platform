import React, { useEffect, useState } from 'react';
import { Sliders, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export const AutomationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    enabled: true,
    discoveryFrequencyHours: 1,
    autoApplyThreshold: 75,
    dailyApplicationLimit: 50,
    dailyEmailOutreachLimit: 25,
    dailyWhatsAppLimit: 10,
    scoringWeights: {
      skills: 35,
      experience: 25,
      jobTitle: 15,
      location: 10,
      seniority: 10,
      keywords: 5,
    },
    allowedWorkplaceTypes: ['remote', 'hybrid'],
    sendRecruiterOutreach: true,
    sendWhatsAppAlerts: true,
    sendEmailAlerts: true,
    notificationEmail: 'skumar21082001@gmail.com',
    requireApprovalBeforeSubmit: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.put('/settings', settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Autonomous Engine Configuration</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Fully Autonomous by Default
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tune the autonomous execution thresholds, daily safety limits, and custom scoring weights for match evaluations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automation configuration saved and applied to background queues!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Autonomous Toggle */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Autonomous Operation Master Switch</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              When enabled, discovered opportunities matching your threshold are automatically prepared and submitted without requiring per-application approval.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="toggle toggle-primary toggle-lg"
          />
        </div>

        {/* Sliders: Threshold & Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Autonomous Apply Threshold
              </label>
              <span className="text-base font-black text-blue-400 font-mono">
                {settings.autoApplyThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={settings.autoApplyThreshold}
              onChange={(e) => setSettings({ ...settings, autoApplyThreshold: parseInt(e.target.value, 10) })}
              className="range range-primary range-sm"
            />
            <p className="text-[11px] text-slate-500">
              Only jobs with an AI match score greater than or equal to this threshold will be submitted autonomously.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daily Application Limit
              </label>
              <span className="text-base font-black text-emerald-400 font-mono">
                {settings.dailyApplicationLimit} apps / day
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={settings.dailyApplicationLimit}
              onChange={(e) => setSettings({ ...settings, dailyApplicationLimit: parseInt(e.target.value, 10) })}
              className="range range-success range-sm"
            />
            <p className="text-[11px] text-slate-500">
              Maximum autonomous applications dispatched per 24 hours to prevent spam flagging.
            </p>
          </div>
        </div>

        {/* Configurable Weighted Scoring Matrix */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Configurable AI Match Scoring Weights</span>
            <span className="text-xs text-blue-400 font-mono">
              Total Weight: {Object.values(settings.scoringWeights || {}).reduce((a: any, b: any) => a + b, 0)}%
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Skills Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.skills}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.scoringWeights?.skills || 35}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, skills: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Experience Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.experience}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={settings.scoringWeights?.experience || 25}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, experience: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Job Title Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.jobTitle}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={settings.scoringWeights?.jobTitle || 15}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, jobTitle: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Location Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.location}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={settings.scoringWeights?.location || 10}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, location: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Seniority Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.seniority}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={settings.scoringWeights?.seniority || 10}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, seniority: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Keywords Weight</span>
                <span className="font-bold text-white">{settings.scoringWeights?.keywords}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.scoringWeights?.keywords || 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: { ...settings.scoringWeights, keywords: parseInt(e.target.value, 10) },
                  })
                }
                className="range range-xs range-primary"
              />
            </div>
          </div>
        </div>

        {/* Instant Email Notifications Switch */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Instant Gmail Application Notifications</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Real-Time Alert
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically dispatch an email receipt to your Gmail inbox every time an autonomous job application is submitted.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.sendEmailAlerts !== false}
              onChange={(e) => setSettings({ ...settings, sendEmailAlerts: e.target.checked })}
              className="toggle toggle-primary toggle-md"
            />
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Destination Notification Email:
            </label>
            <input
              type="email"
              value={settings.notificationEmail || 'skumar21082001@gmail.com'}
              onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
              className="input input-sm input-bordered bg-slate-950 border-slate-800 text-white rounded-lg w-full max-w-md font-mono text-xs"
              placeholder="skumar21082001@gmail.com"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold px-6"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Automation Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

