import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  FileText,
  FileEdit,
  Send,
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  BarChart3,
  Sliders,
  Cpu,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Zap,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Discover Jobs', path: '/jobs', icon: Search, badge: 'Live' },
  { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
  { label: 'My Resume', path: '/resume', icon: FileText },
  { label: 'AI Resume Builder', path: '/resume-builder', icon: FileEdit },
  { label: 'Applications', path: '/applications', icon: Send },
  { label: 'Recruiter Outreach', path: '/outreach', icon: Users },
  { label: 'Email Center', path: '/email', icon: Mail },
  { label: 'WhatsApp Center', path: '/whatsapp', icon: MessageSquare },
  { label: 'Interview Tracker', path: '/interviews', icon: CalendarCheck, badge: 'New' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Automation Settings', path: '/settings', icon: Sliders },
  { label: 'Integrations', path: '/integrations', icon: Cpu },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Profile', path: '/profile', icon: UserCheck },
  { label: 'Admin Panel', path: '/admin', icon: ShieldAlert, adminOnly: true },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d121f] border-r border-slate-800 flex flex-col h-screen select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                AutoApply <span className="text-blue-500">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">AUTONOMOUS JOB HUNTER</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autonomous System Status Banner */}
        <div className="mx-3 sm:mx-4 my-2.5 sm:my-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="text-xs min-w-0">
            <p className="text-emerald-400 font-semibold leading-none truncate">Autonomous Engine Active</p>
            <p className="text-[10px] text-emerald-600 mt-0.5 truncate">Monitoring worldwide boards</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-2 space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-[#0a0d14]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'Candidate'}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {user?.subscriptionTier || 'Starter'} Tier
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

