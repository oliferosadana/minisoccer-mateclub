import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

// Auth Modal
import { AuthModal } from './components/auth/AuthModal';

// Public Components
import { ScheduleView } from './components/public/ScheduleView';
import { TrackerView } from './components/public/TrackerView';
import { ProfileView } from './components/public/ProfileView';
import { CommunityView } from './components/public/CommunityView';
import { VenueListView } from './components/public/VenueListView';
import { BookingModal } from './components/public/BookingModal';
import { ETicketModal } from './components/public/ETicketModal';
import { TopUpModal } from './components/public/TopUpModal';

// Admin Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { OverviewSection } from './components/admin/OverviewSection';
import { BookingsSection } from './components/admin/BookingsSection';
import { MatchesSection } from './components/admin/MatchesSection';
import { VenuesSection } from './components/admin/VenuesSection';
import { OfficialsSection } from './components/admin/OfficialsSection';
import { FacilitiesSection } from './components/admin/FacilitiesSection';
import { SponsorsSection } from './components/admin/SponsorsSection';
import { ToolsSection } from './components/admin/ToolsSection';
import { ContentManagementSection } from './components/admin/ContentManagementSection';
import { BankManagementSection } from './components/admin/BankManagementSection';

// Superadmin Components
import { PaymentGatewaySection } from './components/admin/PaymentGatewaySection';
import { UsersSection } from './components/admin/UsersSection';
import { WhatsAppGatewaySection } from './components/admin/WhatsAppGatewaySection';

// Admin Modals
import { MatchModal } from './components/admin/modals/MatchModal';
import { VenueModal } from './components/admin/modals/VenueModal';
import { RefereeModal } from './components/admin/modals/RefereeModal';
import { PhotographerModal } from './components/admin/modals/PhotographerModal';
import { FacilityModal } from './components/admin/modals/FacilityModal';
import { ScoreModal } from './components/admin/modals/ScoreModal';
import { PaymentProofModal } from './components/admin/modals/PaymentProofModal';
import { GatewayModal } from './components/admin/modals/GatewayModal';
import { BankEditModal } from './components/admin/modals/BankEditModal';
import { UserModal } from './components/admin/modals/UserModal';
import { MatchRosterModal } from './components/admin/modals/MatchRosterModal';
import { CommunityContentModal } from './components/admin/modals/CommunityContentModal';
import { ClubStandingModal } from './components/admin/modals/ClubStandingModal';
import { TopPerformerModal } from './components/admin/modals/TopPerformerModal';
import { SponsorModal } from './components/admin/modals/SponsorModal';

const MainLayout = () => {
  const { role, setRole, publicTab, adminSection } = useApp();
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();

  // Proteksi rute Admin: Jika bukan Admin/Superadmin, paksa kembali ke mode publik
  React.useEffect(() => {
    if (role === 'admin' && !isAdmin) {
      setRole('public');
    }
  }, [role, isAdmin, setRole]);

  return (
    <div className="min-h-screen flex flex-col bg-palette-bg font-sans selection:bg-palette-subtle selection:text-palette-dark">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'public' ? (
          <div>
            {publicTab === 'schedule' && <ScheduleView />}
            {publicTab === 'tracker' && <TrackerView />}
            {publicTab === 'venues' && <VenueListView />}
            {publicTab === 'community' && <CommunityView />}
            {publicTab === 'profile' && <ProfileView />}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <AdminSidebar />
            <div className="flex-1 w-full overflow-hidden">
              {adminSection === 'overview' && <OverviewSection />}
              {adminSection === 'bookings' && <BookingsSection />}
              {adminSection === 'bank_accounts' && <BankManagementSection />}
              {adminSection === 'matches' && <MatchesSection />}
              {adminSection === 'content_management' && <ContentManagementSection />}
              {adminSection === 'venues' && <VenuesSection />}
              {adminSection === 'officials' && <OfficialsSection />}
              {adminSection === 'facilities' && <FacilitiesSection />}
              {adminSection === 'sponsors' && <SponsorsSection />}
              {adminSection === 'tools' && <ToolsSection />}
              {/* Superadmin Sections */}
              {adminSection === 'payment_gateways' && <PaymentGatewaySection />}
              {adminSection === 'users' && <UsersSection />}
              {adminSection === 'whatsapp_gateway' && <WhatsAppGatewaySection />}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <BookingModal />
      <ETicketModal />
      <TopUpModal />
      <MatchModal />
      <MatchRosterModal />
      <VenueModal />
      <RefereeModal />
      <PhotographerModal />
      <FacilityModal />
      <ScoreModal />
      <PaymentProofModal />
      <GatewayModal />
      <BankEditModal />
      <UserModal />
      <CommunityContentModal />
      <ClubStandingModal />
      <TopPerformerModal />
      <SponsorModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
