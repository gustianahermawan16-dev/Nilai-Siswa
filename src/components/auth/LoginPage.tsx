import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, KeyRound, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const LoginPage: React.FC = () => {
  const { login, forgotPasswordRecover } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim() || !password) {
      setErrorMessage('Silakan isi nama pengguna dan kata sandi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login gagal.');
      }
      setLoading(false);
    }, 300);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
    setLoading(true);
    setTimeout(() => {
      login(u, p);
      setLoading(false);
    }, 200);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);
    if (!recoveryUser || !recoveryCode || !newPassword) {
      setRecoveryMessage({ type: 'error', text: 'Semua kolom pemulihan wajib diisi.' });
      return;
    }
    const res = forgotPasswordRecover(recoveryUser, recoveryCode, newPassword);
    if (res.success) {
      setRecoveryMessage({ type: 'success', text: res.message || 'Berhasil!' });
      setTimeout(() => {
        setShowForgotModal(false);
        setUsername(recoveryUser);
        setPassword(newPassword);
        setRecoveryMessage(null);
      }, 1800);
    } else {
      setRecoveryMessage({ type: 'error', text: res.message || 'Gagal memulihkan akun.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Islamic geometric background accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"></div>

      {/* Top Header Bar for PWA */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-1.5 text-xs text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Sistem Resmi MI Nurul Falah</span>
        </div>
        <PWAInstallButton compact />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-400/80 overflow-hidden relative z-10 transition-all">
        {/* Banner with Logo */}
        <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 pt-6 pb-5 px-6 text-center text-white relative border-b-4 border-amber-400">
          <div className="relative inline-block mx-auto mb-3">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-amber-400 bg-white mx-auto transform hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Logo MI Nurul Falah"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              PORTAL
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-amber-300 drop-shadow-md">
            NILAI SISWA
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-100 uppercase">
            MI NURUL FALAH
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-200 text-xs border border-emerald-700/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Akademik • Tabungan • Infak • Absensi</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau wali.ahmad"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? 'Memproses Masuk...' : 'Masuk ke Portal'}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Akses Cepat Pengujian:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition flex items-center gap-2 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                  ADM
                </div>
                <div>
                  <div className="font-bold text-emerald-950">Guru / Admin</div>
                  <div className="text-[10px] text-emerald-700">admin / admin123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('wali.ahmad', 'wali123')}
                className="w-full text-left p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition flex items-center gap-2 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
                  WLI
                </div>
                <div>
                  <div className="font-bold text-amber-950">Wali Ahmad Fauzi</div>
                  <div className="text-[10px] text-amber-700">wali.ahmad / wali123</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 text-center text-xs text-emerald-200/80">
        <p className="font-medium">MI Nurul Falah — Madrasah Mandiri Berprestasi</p>
        <p className="text-[10px] mt-0.5 text-emerald-300/60">Aman • Terintegrasi • Responsif Multi-Perangkat</p>
      </div>

      {/* Modal Lupa Password / Pemulihan Akun Aman */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-2 border-emerald-600 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-emerald-800 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">Pemulihan Kata Sandi</h3>
            </div>

            {recoveryMessage && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  recoveryMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {recoveryMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                )}
                <span>{recoveryMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  value={recoveryUser}
                  onChange={(e) => setRecoveryUser(e.target.value)}
                  placeholder="Contoh: wali.ahmad atau admin"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Verifikasi / Email / No. HP
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Kode Madrasah: FALAH2024 atau Email terdaftar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-500">
                  Tip Madrasah: gunakan kode resmi <strong>FALAH2024</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
