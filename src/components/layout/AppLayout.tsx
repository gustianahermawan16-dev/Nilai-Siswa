import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PiggyBank,
  HeartHandshake,
  CalendarCheck,
  FileCheck2,
  Coins,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  User,
  GraduationCap,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AppLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentView, onNavigate, children }) => {
  const { currentUser, logout, activeStudent } = useAuth();
  const { db } = useDatabase();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const pendingPermits = db.permits.filter((p) => p.status === 'pending').length;

  const adminNavItems = [
    { id: 'dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
    { id: 'students', label: 'Data Siswa & Kelas', icon: Users },
    { id: 'grades', label: 'Nilai Akademik (KKM)', icon: BookOpen },
    { id: 'schedule', label: 'Jadwal Pelajaran', icon: Calendar },
    { id: 'savings', label: 'Tabungan Siswa', icon: PiggyBank },
    { id: 'infak', label: 'Infak Bulanan', icon: HeartHandshake },
    { id: 'attendance', label: 'Daftar Hadir / Presensi', icon: CalendarCheck },
    { id: 'permits', label: 'Persetujuan Izin', icon: FileCheck2, badge: pendingPermits },
    { id: 'fees', label: 'Iuran Tambahan', icon: Coins },
    { id: 'announcements', label: 'Pengumuman', icon: Bell },
    { id: 'settings', label: 'Pengaturan & Backup', icon: Settings },
  ];

  const parentNavItems = [
    { id: 'parent-portal', label: 'Portal Wali Murid', icon: GraduationCap },
  ];

  const navItems = isAdmin ? adminNavItems : parentNavItems;

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      <OfflineIndicator />

      {/* TOP NAVBAR (Desktop & Mobile Header) */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div
              onClick={() => handleNavClick(isAdmin ? 'dashboard' : 'parent-portal')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 bg-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                <img src="/logo.png" alt="Logo MI Nurul Falah" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm sm:text-base tracking-wide text-amber-300 drop-shadow-xs">
                    NILAI SISWA
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                    MI
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-100 tracking-wider">
                  MI NURUL FALAH
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: PWA Install & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton compact />

            {/* User Profile Pill - Clean Role Badge (No Ustadz name on bar) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {isAdmin ? 'A' : 'W'}
              </div>
              <div className="text-left">
                <div className="font-bold text-white truncate max-w-[150px]">
                  {isAdmin ? 'Portal Admin' : 'Wali Murid'}
                </div>
                <div className="text-[10px] text-amber-300">
                  {isAdmin ? 'MI Nurul Falah' : (activeStudent?.fullName || 'Santri')}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-950/80 hover:bg-rose-900/80 text-emerald-200 hover:text-white border border-emerald-700/60 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR (DESKTOP) AND CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* SIDEBAR FOR ADMIN (DESKTOP) */}
        {isAdmin && (
          <aside className="no-print hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0 shadow-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Menu Utama Madrasah
              </p>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>MI Nurul Falah</span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Tahun Ajaran: {db.settings.academicYear} • Semester {db.settings.semester}
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* MOBILE MENU DRAWER (FOR ADMIN) */}
        {isAdmin && isMobileMenuOpen && (
          <div className="no-print lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col p-4 z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-xs" />
                  <div>
                    <h3 className="font-black text-sm text-slate-900">NILAI SISWA</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold">MI NURUL FALAH</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1 overflow-y-auto flex-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Aplikasi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR ADMIN (Quick Touch Access) */}
      {isAdmin && (
        <nav className="no-print lg:hidden sticky bottom-0 z-30 bg-white border-t border-slate-200 px-2 py-1 shadow-lg flex justify-around items-center">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              currentView === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dasbor</span>
          </button>
          <button
            onClick={() => handleNavClick('students')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              currentView === 'students' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Siswa</span>
          </button>
          <button
            onClick={() => handleNavClick('grades')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              currentView === 'grades' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Nilai</span>
          </button>
          <button
            onClick={() => handleNavClick('permits')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold relative transition ${
              currentView === 'permits' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Izin</span>
            {pendingPermits > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              currentView === 'settings' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Atur</span>
          </button>
        </nav>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi NILAI SISWA MI Nurul Falah?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        isDanger={false}
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};
