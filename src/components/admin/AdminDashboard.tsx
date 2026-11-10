import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  PiggyBank,
  HeartHandshake,
  CalendarCheck,
  FileCheck2,
  Bell,
  Coins,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { calculateSavingsBalance, calculateTotalInfak, formatRupiah } from '../../utils/academic';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { db } = useDatabase();

  const totalStudents = db.students.length;
  const activeStudents = db.students.filter((s) => s.status === 'aktif').length;
  const totalWali = db.users.filter((u) => u.role === 'wali_murid').length;
  const totalClasses = db.settings.classes.length;
  const totalSubjects = db.subjects.length;

  const pendingPermits = db.permits.filter((p) => p.status === 'pending');
  const savingsSummary = calculateSavingsBalance(db.savings);
  const totalInfakSum = calculateTotalInfak(db.infak);
  const activeFees = db.fees.filter((f) => f.isActive);

  // Today's attendance calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = db.attendance.filter((a) => a.date === todayStr);
  const hadirToday = todayRecords.filter((a) => a.status === 'Hadir').length;
  const sakitToday = todayRecords.filter((a) => a.status === 'Sakit').length;
  const izinToday = todayRecords.filter((a) => a.status === 'Izin').length;
  const alfaToday = todayRecords.filter((a) => a.status === 'Alfa').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl border-b-4 border-amber-400">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 text-amber-300 text-xs font-semibold mb-3 border border-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dasbor Utama Pengelola & Guru</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Selamat Datang di Portal Nilai Siswa
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Madrasah Ibtidaiyah Nurul Falah — Tahun Ajaran {db.settings.academicYear} (Semester {db.settings.semester}).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('grades')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Input & Rilis Nilai</span>
            </button>
            <button
              onClick={() => onNavigate('schedule')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-950 text-white font-semibold text-xs sm:text-sm border border-emerald-500/50 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Jadwal Pelajaran</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-950 text-white font-semibold text-xs sm:text-sm border border-emerald-500/50 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Alert if Pending Leave Permits Exist */}
      {pendingPermits.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-950">
                Ada {pendingPermits.length} Pengajuan Surat Izin / Sakit Menunggu Persetujuan!
              </h3>
              <p className="text-xs text-amber-900">
                Wali murid telah mengirim permohonan izin baru. Segera tinjau agar absensi tersinkron otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('permits')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span>Tinjau Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Stat Cards (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Siswa */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {activeStudents} Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total Siswa
            </div>
          </div>
        </div>

        {/* Wali Murid */}
        <div
          onClick={() => onNavigate('settings')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Akun Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalWali}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Wali Murid
            </div>
          </div>
        </div>

        {/* Kelas */}
        <div
          onClick={() => onNavigate('settings')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              MI
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalClasses}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Rombel / Kelas
            </div>
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div
          onClick={() => onNavigate('grades')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              Kurikulum Kemenag
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalSubjects}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Mata Pelajaran
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Financials & Attendance Recap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ringkasan Tabungan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Ringkasan Tabungan</h3>
              </div>
              <button
                onClick={() => onNavigate('savings')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                Lihat Detail →
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Total Saldo Kas Tabungan Siswa
              </p>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {formatRupiah(savingsSummary.balance)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Total Uang Masuk:</span>
                <strong className="text-emerald-700 font-bold text-sm">
                  {formatRupiah(savingsSummary.totalIn)}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Total Uang Keluar:</span>
                <strong className="text-rose-700 font-bold text-sm">
                  {formatRupiah(savingsSummary.totalOut)}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('savings')}
            className="mt-4 w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Kelola Tabungan Siswa
          </button>
        </div>

        {/* Ringkasan Infak & Iuran Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Infak & Iuran</h3>
              </div>
              <button
                onClick={() => onNavigate('infak')}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
              >
                Lihat Infak →
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-100">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                Total Infak Bulanan Terkumpul
              </p>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {formatRupiah(totalInfakSum)}
              </p>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Iuran Tambahan Aktif:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeFees.length} Kegiatan
                </span>
              </div>
              {activeFees.slice(0, 2).map((fee) => (
                <div key={fee.id} className="text-xs py-1 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-600 truncate max-w-[160px]">{fee.title}</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(fee.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onNavigate('infak')}
              className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Kelola Infak
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Kelola Iuran
            </button>
          </div>
        </div>

        {/* Rekap Kehadiran Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Presensi Hari Ini</h3>
              </div>
              <span className="text-xs text-slate-500">{todayStr}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xl font-black text-emerald-800">{hadirToday}</span>
                <span className="text-[11px] block font-semibold text-emerald-700 uppercase mt-0.5">
                  Hadir
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-xl font-black text-amber-800">{sakitToday}</span>
                <span className="text-[11px] block font-semibold text-amber-700 uppercase mt-0.5">
                  Sakit
                </span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xl font-black text-blue-800">{izinToday}</span>
                <span className="text-[11px] block font-semibold text-blue-700 uppercase mt-0.5">
                  Izin
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-xl font-black text-rose-800">{alfaToday}</span>
                <span className="text-[11px] block font-semibold text-rose-700 uppercase mt-0.5">
                  Alfa
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              {todayRecords.length > 0
                ? `${todayRecords.length} siswa sudah diabsen hari ini`
                : 'Belum ada absensi yang diinput untuk hari ini'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Buka Form Absensi Harian
          </button>
        </div>
      </div>

      {/* Bottom Row: Pengumuman Terbaru */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Pengumuman Terbaru Madrasah
            </h3>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Kelola Pengumuman →
          </button>
        </div>

        <div className="space-y-3">
          {db.announcements.slice(0, 3).map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-900">{ann.title}</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex-shrink-0">
                  {ann.targetType === 'all' ? 'Semua Siswa' : `Kelas ${ann.targetClass}`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                <span>Tanggal: {ann.date}</span>
                <span>•</span>
                <span>Oleh: {ann.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
