import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ReportLostWizard } from './pages/ReportLostWizard';
import { ReportFoundWizard } from './pages/ReportFoundWizard';
import { MatchResultsPage } from './pages/MatchResultsPage';
import { FoundItemsExplorer } from './pages/FoundItemsExplorer';
import { ClaimsPage } from './pages/ClaimsPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLostItemId, setSelectedLostItemId] = useState<string>('lost_bottle_1');

  // Navigation handlers
  const handleStartLost = () => setCurrentTab('report-lost');
  const handleStartFound = () => setCurrentTab('report-found');
  const handleViewMatches = (lostItemId: string) => {
    setSelectedLostItemId(lostItemId);
    setCurrentTab('matches');
  };
  const handleInitiateClaim = (foundItemId: string, lostItemId: string) => {
    setCurrentTab('claims');
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage
            onStartLost={handleStartLost}
            onStartFound={handleStartFound}
            onExploreFound={() => setCurrentTab('found-items')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );

      case 'dashboard':
        return (
          <StudentDashboard
            onStartLost={handleStartLost}
            onStartFound={handleStartFound}
            onViewMatches={handleViewMatches}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );

      case 'report-lost':
        return (
          <ReportLostWizard
            onCompleted={(newId) => {
              setSelectedLostItemId(newId);
              setCurrentTab('matches');
            }}
            onCancel={() => setCurrentTab('dashboard')}
          />
        );

      case 'report-found':
        return (
          <ReportFoundWizard
            onCompleted={(newId) => {
              setCurrentTab('found-items');
            }}
            onCancel={() => setCurrentTab('dashboard')}
          />
        );

      case 'matches':
        return (
          <MatchResultsPage
            lostItemId={selectedLostItemId}
            onInitiateClaim={handleInitiateClaim}
            onBack={() => setCurrentTab('dashboard')}
          />
        );

      case 'found-items':
        return (
          <FoundItemsExplorer
            onClaimSuccess={() => setCurrentTab('claims')}
          />
        );

      case 'claims':
        return <ClaimsPage />;

      case 'staff-ops':
        return <StaffDashboard />;

      case 'analytics':
        return <AdminAnalyticsPage />;

      case 'my-reports':
        return (
          <MyReportsPage
            onNewReport={handleStartLost}
            onViewMatches={handleViewMatches}
          />
        );

      case 'heatmap':
        return <CampusMapPage />;

      case 'audit-trail':
        return <AuditTrailPage />;

      case 'profile':
        return <ProfilePage />;

      default:
        return (
          <StudentDashboard
            onStartLost={handleStartLost}
            onStartFound={handleStartFound}
            onViewMatches={handleViewMatches}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col font-sans selection:bg-[#E53935] selection:text-white">
      {/* Global Navigation */}
      <Navbar currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setCurrentTab(tab)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
