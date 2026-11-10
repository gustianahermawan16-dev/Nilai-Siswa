import React from 'react';
import { Printer, X, Download, FileText } from 'lucide-react';
import { SchoolHeaderPrint, SchoolFooterPrint } from './SchoolHeaderPrint';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  studentName?: string;
  className?: string;
  nisn?: string;
  homeroomTeacher?: string;
  children: React.ReactNode;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  studentName,
  className,
  nisn,
  homeroomTeacher,
  children,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top bar (Hidden when printing via @media print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Pratinjau Cetak & Unduh Dokumen Resmi</h3>
              <p className="text-[11px] text-emerald-200">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout styling) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="printable-area w-full max-w-3xl bg-white p-6 sm:p-10 shadow-lg rounded-xl border border-slate-200 text-slate-900 min-h-[600px] flex flex-col justify-between">
            <div>
              <SchoolHeaderPrint
                title={title}
                subtitle={subtitle}
                studentName={studentName}
                className={className}
                nisn={nisn}
              />
              <div className="mt-4">{children}</div>
              <SchoolFooterPrint homeroomTeacher={homeroomTeacher} />
            </div>
          </div>
        </div>

        {/* Bottom bar advice */}
        <div className="no-print px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            💡 Tips: Untuk menyimpan sebagai <strong>file PDF</strong>, pilih tujuan printer <strong>"Save as PDF" / "Simpan sebagai PDF"</strong> pada dialog cetak.
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
