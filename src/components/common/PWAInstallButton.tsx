import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Android / Desktop Chromium
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg shadow-sm transition active:scale-95 ${
          compact
            ? 'px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold'
            : 'px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold'
        }`}
        title="Pasang Aplikasi ke Layar Utama HP"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install Aplikasi</span>
      </button>
    );
  }

  // iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-800 text-amber-200 hover:bg-emerald-700 transition"
          title="Pasang Aplikasi di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 border-2 border-emerald-500">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-xs" />
                  <h3 className="font-bold text-slate-900 text-sm">Pasang ke Layar Utama iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <p>
                    Buka peramban <strong>Safari</strong> di iPhone/iPad Anda, lalu ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah layar.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <p>
                    Gulir menu ke bawah lalu pilih opsi <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <p>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon MI Nurul Falah akan muncul di layar HP Anda seperti aplikasi native.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
