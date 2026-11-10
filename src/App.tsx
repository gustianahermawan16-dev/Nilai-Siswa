import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminGrades } from './components/admin/AdminGrades';
import { AdminSavings } from './components/admin/AdminSavings';
import { AdminInfak } from './components/admin/AdminInfak';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminPermits } from './components/admin/AdminPermits';
import { AdminFees } from './components/admin/AdminFees';
import { AdminAnnouncements } from './components/admin/AdminAnnouncements';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminSchedule } from './components/admin/AdminSchedule';
import { ParentPortal } from './components/parent/ParentPortal';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {isAdmin ? (
        <>
          {currentView === 'dashboard' && <AdminDashboard onNavigate={setCurrentView} />}
          {currentView === 'students' && <AdminStudents />}
          {currentView === 'grades' && <AdminGrades />}
          {currentView === 'schedule' && <AdminSchedule />}
          {currentView === 'savings' && <AdminSavings />}
          {currentView === 'infak' && <AdminInfak />}
          {currentView === 'attendance' && <AdminAttendance />}
          {currentView === 'permits' && <AdminPermits />}
          {currentView === 'fees' && <AdminFees />}
          {currentView === 'announcements' && <AdminAnnouncements />}
          {currentView === 'settings' && <AdminSettings />}
        </>
      ) : (
        <ParentPortal />
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DatabaseProvider>
  );
}
