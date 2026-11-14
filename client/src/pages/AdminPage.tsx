import React, { useEffect, useState } from 'react';
import { ShieldAlert, Server, Activity, Users, Database, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

export const AdminPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const res = await api.get('/admin/overview');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>SaaS System Administration & Queue Health</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Admin Clearance</span>
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor background worker health, queue throughput, connector status, and multi-tenant isolation.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading administrative telemetry...</div>
      ) : (
        <>
          {/* Top System Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-xs text-slate-400 font-medium">Registered Users</span>
              <p className="text-2xl font-black text-white mt-1">{data?.stats?.totalUsers || 1}</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-xs text-slate-400 font-medium">Discovered Jobs</span>
              <p className="text-2xl font-black text-white mt-1">{data?.stats?.totalJobs || 0}</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-xs text-slate-400 font-medium">Submissions Handled</span>
              <p className="text-2xl font-black text-white mt-1">{data?.stats?.totalApplications || 0}</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-xs text-slate-400 font-medium">Audit Events Logged</span>
              <p className="text-2xl font-black text-white mt-1">{data?.stats?.totalAuditLogs || 0}</p>
            </div>
          </div>

          {/* 12 Background Queues Health Matrix */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Autonomous Background Queues (12 Clusters)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">● OPERATIONAL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {Object.entries(data?.queueMetrics || {}).map(([queueName, metric]: any) => (
                <div key={queueName} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{queueName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>Active: {metric.active ?? 0}</span>
                    <span className="text-slate-400">Completed: {metric.completed ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connectors Health */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Job Aggregator Connectors & Health</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.connectors?.map((conn: any) => (
                <div key={conn.source} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{conn.displayName}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {conn.lastSyncStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Limit: {conn.rateLimitPerMinute} req/min
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Discovered: {conn.jobsFetchedTotal} jobs
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

