import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';

interface SchoolHeaderPrintProps {
  title: string;
  subtitle?: string;
  studentName?: string;
  className?: string;
  nisn?: string;
}

export const SchoolHeaderPrint: React.FC<SchoolHeaderPrintProps> = ({
  title,
  subtitle,
  studentName,
  className,
  nisn,
}) => {
  const { db } = useDatabase();
  const settings = db.settings;

  return (
    <div className="w-full text-slate-900">
      {/* KOP SURAT MADRASAH IBTIDAIYAH */}
      <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900 mb-4">
        <img
          src="/logo.png"
          alt="Logo MI Nurul Falah"
          className="w-20 h-20 object-contain rounded-full border border-emerald-600 p-0.5"
        />
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-700">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA
          </p>
          <p className="text-xs font-semibold text-slate-700 uppercase">
            KANTOR KEMENTERIAN AGAMA KABUPATEN / KOTA
          </p>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-emerald-800">
            MADRASAH IBTIDAIYAH NURUL FALAH
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            NSM: 111232010045 | NPSN: {settings.npsn} | Akreditasi: A
          </p>
          <p className="text-[11px] text-slate-600">
            {settings.address} | Telp: {settings.phone} | Email: {settings.email}
          </p>
        </div>
      </div>
      <div className="border-b border-slate-900 -mt-3.5 mb-5"></div>

      {/* JUDUL LAPORAN */}
      <div className="text-center mb-5">
        <h2 className="text-base font-bold uppercase tracking-wider underline text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        <p className="text-xs font-medium text-slate-700 mt-0.5">
          Tahun Pelajaran: {settings.academicYear} | Semester: {settings.semester}
        </p>
      </div>

      {/* IDENTITAS SISWA JIKA TERSEDIA */}
      {(studentName || className || nisn) && (
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div>
            <span className="text-slate-500">Nama Siswa:</span>{' '}
            <strong className="text-slate-900">{studentName || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Kelas:</span>{' '}
            <strong className="text-slate-900">{className || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500">NISN / NIS:</span>{' '}
            <strong className="text-slate-900">{nisn || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Batas Nilai Tuntas (KKM):</span>{' '}
            <strong className="text-emerald-700">{settings.passingGrade}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export const SchoolFooterPrint: React.FC<{
  homeroomTeacher?: string;
  signatureDate?: string;
}> = ({ homeroomTeacher, signatureDate }) => {
  const { db } = useDatabase();
  const settings = db.settings;
  const todayStr =
    signatureDate ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="mt-8 pt-4 grid grid-cols-2 text-xs text-center break-inside-avoid">
      <div>
        <p className="text-slate-600">Mengetahui,</p>
        <p className="font-semibold text-slate-800">Kepala Madrasah</p>
        <div className="h-16"></div>
        <p className="font-bold underline text-slate-900">{settings.headmaster}</p>
        <p className="text-[10px] text-slate-600">NIP. {settings.headmasterNip}</p>
      </div>
      <div>
        <p className="text-slate-600">Jawa Barat, {todayStr}</p>
        <p className="font-semibold text-slate-800">Wali Kelas</p>
        <div className="h-16"></div>
        <p className="font-bold underline text-slate-900">
          {homeroomTeacher || 'Ustadz Gustiana Hermawan, S.Pd.'}
        </p>
        <p className="text-[10px] text-slate-600">NIP. - / Guru Kelas MI Nurul Falah</p>
      </div>
    </div>
  );
};
