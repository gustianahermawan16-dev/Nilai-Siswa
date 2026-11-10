import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  Download,
  Upload,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  School,
  Lock,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { UserAccount } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminSettings: React.FC = () => {
  const {
    db,
    updateSettings,
    updateUserAccount,
    resetUserPassword,
    exportBackup,
    importBackup,
    resetDefault,
  } = useDatabase();

  const { currentUser, changePassword } = useAuth();

  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  } | null>(null);

  // Settings State
  const [passingGrade, setPassingGrade] = useState<number>(db.settings.passingGrade);
  const [academicYear, setAcademicYear] = useState<string>(db.settings.academicYear);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(db.settings.semester);
  const [headmaster, setHeadmaster] = useState<string>(db.settings.headmaster);
  const [headmasterNip, setHeadmasterNip] = useState<string>(db.settings.headmasterNip);
  const [address, setAddress] = useState<string>(db.settings.address);
  const [phone, setPhone] = useState<string>(db.settings.phone);
  const [settingsNotice, setSettingsNotice] = useState<string>('');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Wali Account Edit State
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserAccount | null>(null);
  const [newWaliPassword, setNewWaliPassword] = useState('');
  const [newWaliUsername, setNewWaliUsername] = useState('');
  const [userNotice, setUserNotice] = useState<string>('');

  // New Class input
  const [newClassName, setNewClassName] = useState('');

  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      passingGrade: Number(passingGrade),
      academicYear,
      semester,
      headmaster,
      headmasterNip,
      address,
      phone,
    });
    setSettingsNotice('Konfigurasi sekolah dan KKM berhasil diperbarui!');
    setTimeout(() => setSettingsNotice(''), 3000);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);
    if (!newPassword || newPassword.length < 5) {
      setPasswordNotice({ type: 'error', text: 'Kata sandi minimal 5 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }
    const res = changePassword(newPassword);
    if (res.success) {
      setPasswordNotice({ type: 'success', text: 'Kata sandi akun admin berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordNotice({ type: 'error', text: res.message || 'Gagal mengubah kata sandi.' });
    }
  };

  const handleAddClass = () => {
    const trimmed = newClassName.trim().toUpperCase();
    if (!trimmed) return;
    if (db.settings.classes.includes(trimmed)) {
      setSettingsNotice('Kelas sudah ada dalam daftar.');
      return;
    }
    updateSettings({
      classes: [...db.settings.classes, trimmed],
    });
    setNewClassName('');
    setSettingsNotice(`Kelas ${trimmed} berhasil ditambahkan.`);
  };

  const handleDeleteClass = (className: string) => {
    if (db.settings.classes.length <= 1) {
      setSettingsNotice('Minimal harus ada 1 kelas di madrasah.');
      return;
    }
    setConfirmAction({
      title: 'Hapus Kelas',
      message: `Apakah Anda yakin ingin menghapus kelas "${className}"?`,
      isDanger: true,
      onConfirm: () => {
        updateSettings({
          classes: db.settings.classes.filter((c) => c !== className),
        });
        setSettingsNotice(`Kelas ${className} berhasil dihapus.`);
      },
    });
  };

  const handleResetWaliPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newWaliPassword) return;

    if (newWaliUsername && newWaliUsername !== selectedUserForReset.username) {
      updateUserAccount(selectedUserForReset.id, { username: newWaliUsername.trim().toLowerCase() });
    }

    resetUserPassword(selectedUserForReset.username, newWaliPassword);
    setUserNotice(`Kata sandi akun ${selectedUserForReset.username} berhasil direset.`);
    setTimeout(() => {
      setSelectedUserForReset(null);
      setUserNotice('');
      setNewWaliPassword('');
    }, 1500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importBackup(text);
          if (success) {
            alert('Database berhasil diimpor dan dipulihkan sepenuhnya!');
            window.location.reload();
          } else {
            alert('File backup JSON tidak valid atau rusak.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Manajemen Akun</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur KKM batas remedial, tahun ajaran, semester, akun wali murid, kredensial login, dan backup database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Pengaturan Akademik & KKM */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Konfigurasi Madrasah & Batas Minimal (KKM)
            </h3>
          </div>

          {settingsNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsNotice}</span>
            </div>
          )}

          <form onSubmit={handleSaveSchoolSettings} className="space-y-3.5 text-xs">
            {/* KKM Passing Grade Threshold */}
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300">
              <label className="block font-bold text-amber-950 mb-1">
                Batas Nilai Minimal / KKM (Kriteria Ketuntasan Minimal) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white border border-amber-400 rounded-lg text-amber-950 font-black text-base focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                />
                <p className="text-[11px] text-amber-800 leading-tight">
                  Nilai &ge; {passingGrade} otomatis bertanda <strong>TUNTAS</strong>. Di bawah {passingGrade} otomatis bertanda <strong>REMEDIAL</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024/2025"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Aktif *</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepala Madrasah *</label>
                <input
                  type="text"
                  required
                  value={headmaster}
                  onChange={(e) => setHeadmaster(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  value={headmasterNip}
                  onChange={(e) => setHeadmasterNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Resmi Madrasah</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon Madrasah</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Simpan Pengaturan Madrasah & KKM
            </button>
          </form>

          {/* Manage Classes Section */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700 text-xs">
              Daftar Rombel / Kelas Aktif:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {db.settings.classes.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200"
                >
                  <span>Kelas {cls}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(cls)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                    title="Hapus Kelas"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Contoh: 1C atau 6C"
                className="w-36 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kelas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Keamanan Akun Admin & Backup Database */}
        <div className="space-y-6">
          {/* Ubah Password Admin */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Keamanan Akun Pengelola ({currentUser?.username})
              </h3>
            </div>

            {passwordNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passwordNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-red-50 text-red-700 border border-red-300'
                }`}
              >
                {passwordNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{passwordNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 5 karakter..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Perbarui Kata Sandi Admin
              </button>
            </form>
          </div>

          {/* Backup & Restore Database */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Pencadangan & Pemulihan Database (Backup)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh data siswa, nilai harian, nilai PTS/PAS, tabungan, infak, absensi, dan iuran tersimpan secara persisten. Anda dapat mengunduh salinan cadangan JSON kapan saja untuk keamanan data.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={exportBackup}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Ekspor File Backup (.json)</span>
              </button>

              <label className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 cursor-pointer active:scale-95 transition text-center">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Pulihkan dari File (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Reset ke data contoh awal MI Nurul Falah
              </span>
              <button
                type="button"
                onClick={() => {
                  setConfirmAction({
                    title: 'Reset ke Setelan Awal',
                    message:
                      'PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke kondisi awal MI Nurul Falah?\n\nSemua data baru yang belum dibackup akan diganti dengan data bawaan.',
                    isDanger: true,
                    onConfirm: () => {
                      resetDefault();
                      window.location.reload();
                    },
                  });
                }}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Setelan Awal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Manajemen Akun Wali Murid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Daftar Akun Akses Wali Murid ({db.users.filter((u) => u.role === 'wali_murid').length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Admin dapat mereset kata sandi atau mengubah username wali murid jika lupa sandi.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Nama Wali</th>
                <th className="py-2.5 px-3">Username Login</th>
                <th className="py-2.5 px-3">Anak Terhubung</th>
                <th className="py-2.5 px-3">Kontak HP</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.users
                .filter((u) => u.role === 'wali_murid')
                .map((wali) => {
                  const student = db.students.find((s) => s.id === wali.studentId);
                  return (
                    <tr key={wali.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{wali.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                        {wali.username}
                      </td>
                      <td className="py-2.5 px-3">
                        {student ? (
                          <span>
                            {student.fullName} (Kelas {student.className})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum terhubung</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{wali.phone || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedUserForReset(wali);
                            setNewWaliUsername(wali.username);
                            setNewWaliPassword('wali123');
                            setUserNotice('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-[11px] cursor-pointer"
                        >
                          Reset Sandi
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RESET SANDI WALI MURID */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">Kelola Akun Wali Murid</h3>
              <button
                onClick={() => setSelectedUserForReset(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResetWaliPasswordSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Wali Murid:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedUserForReset.fullName}
                </div>
              </div>

              {userNotice && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold">
                  {userNotice}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={newWaliUsername}
                  onChange={(e) => setNewWaliUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                <input
                  type="text"
                  required
                  value={newWaliPassword}
                  onChange={(e) => setNewWaliPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title || 'Konfirmasi'}
        message={confirmAction?.message || ''}
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
        isDanger={confirmAction?.isDanger ?? true}
        onConfirm={() => {
          if (confirmAction?.onConfirm) {
            confirmAction.onConfirm();
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
