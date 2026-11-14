import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { DiscoverJobsPage } from './pages/DiscoverJobsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { MyResumePage } from './pages/MyResumePage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { RecruiterOutreachPage } from './pages/RecruiterOutreachPage';
import { EmailCenterPage } from './pages/EmailCenterPage';
import { WhatsAppCenterPage } from './pages/WhatsAppCenterPage';
import { InterviewTrackerPage } from './pages/InterviewTrackerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AutomationSettingsPage } from './pages/AutomationSettingsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { BillingPage } from './pages/BillingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingWizardPage } from './pages/OnboardingWizardPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile sidebar on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Autonomous Pipeline Overview', subtitle: 'Live system metrics and background activity feed' };
      case '/jobs':
        return { title: 'Discover Jobs', subtitle: 'Worldwide engineering listings across connected platforms' };
      case '/recommendations':
        return { title: 'AI Recommendations', subtitle: 'Ranked by vector semantic fit and configurable scoring' };
      case '/resume':
        return { title: 'My Resume & Profile', subtitle: 'Immutable original documents & verified facts anchor' };
      case '/resume-builder':
        return { title: 'AI Resume Builder', subtitle: 'Tailored resume versions customized per target posting' };
      case '/applications':
        return { title: 'Applications Tracker', subtitle: 'Autonomous submission states and official confirmation receipts' };
      case '/outreach':
        return { title: 'Recruiter Outreach Agent', subtitle: 'Public contact discovery with 1-to-1 personalized emails' };
      case '/email':
        return { title: 'Email Center', subtitle: 'Authorized mailbox access and reply classification' };
      case '/whatsapp':
        return { title: 'WhatsApp Center', subtitle: 'Meta Business Cloud API messaging and interview alerts' };
      case '/interviews':
        return { title: 'Interview Tracker', subtitle: 'Scheduled interviews detected automatically from replies' };
      case '/analytics':
        return { title: 'Analytics & Reporting', subtitle: 'Quantitative funnel metrics and daily performance reports' };
      case '/settings':
        return { title: 'Automation Settings', subtitle: 'Thresholds, daily limits, and weighted scoring matrix' };
      case '/integrations':
        return { title: 'Integrations & Connectors', subtitle: 'Status of official APIs and job aggregators' };
      case '/billing':
        return { title: 'Billing & Quotas', subtitle: 'Subscription limits and background worker capacity' };
      case '/profile':
        return { title: 'Candidate Profile Facts', subtitle: 'Candidate preferences and work authorization' };
      case '/admin':
        return { title: 'System Administration', subtitle: '12-queue health monitor and multi-tenant audit logs' };
      default:
        return { title: 'AutoApply AI', subtitle: 'Autonomous AI Job Hunter' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex min-h-screen bg-[#0a0d14] relative overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <Navbar
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-500 text-xs">
        Initializing workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingWizardPage />} />

        {/* Dashboard Pages */}
        <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><DiscoverJobsPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><MyResumePage /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/outreach" element={<ProtectedRoute><RecruiterOutreachPage /></ProtectedRoute>} />
        <Route path="/email" element={<ProtectedRoute><EmailCenterPage /></ProtectedRoute>} />
        <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppCenterPage /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><InterviewTrackerPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AutomationSettingsPage /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

