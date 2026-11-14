import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, RefreshCw, SlidersHorizontal, Menu } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';

export const Navbar: React.FC<{
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}> = ({ title, subtitle, onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/discover');
      await api.post('/matching/evaluate');
      window.location.reload();
    } catch {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d121f]/90 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-2">
        {/* Quick Sync Autonomous Engine Button */}
        <button
          onClick={handleGlobalSync}
          disabled={isSyncing}
          className="btn btn-xs btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 h-8 px-2 sm:px-3 rounded-lg"
          title="Discover and match active jobs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Discovering...' : 'Sync Jobs & Matches'}</span>
          <span className="sm:hidden text-[11px]">{isSyncing ? '...' : 'Sync'}</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="btn btn-xs btn-ghost text-slate-400 hover:text-slate-200 h-8 w-8 p-0 rounded-lg hidden sm:flex items-center justify-center"
          title="Automation Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/analytics')}
          className="btn btn-xs btn-ghost text-slate-400 hover:text-slate-200 h-8 w-8 p-0 rounded-lg relative flex items-center justify-center"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5"></span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-0.5 sm:mx-1"></div>

        <button
          onClick={logout}
          className="btn btn-xs btn-ghost text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 h-8 px-2 sm:px-2.5 rounded-lg flex items-center gap-1"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-xs hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

