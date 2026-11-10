import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  XCircle,
  Printer,
  Calendar,
  Filter,
  Users,
  Check,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { calculateAttendanceSummary } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';

export const AdminAttendance: React.FC = () => {
  const { db, recordAttendance } = useDatabase();

  const [selectedClass, setSelectedClass] = useState<string>('4A');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Temporary local state for quick daily marking
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const currentClassStudents = db.students.filter(
    (s) => s.status === 'aktif' && (selectedClass === 'all' || s.className === selectedClass)
  );

  // Load existing records for selectedDate into dailyStatusMap
  React.useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
    for (const student of currentClassStudents) {
      const existing = db.attendance.find(
        (a) => a.studentId === student.id && a.date === selectedDate
      );
      if (existing) {
        map[student.id] = { status: existing.status, notes: existing.notes || '' };
      } else {
        // Default Hadir
        map[student.id] = { status: 'Hadir', notes: '' };
      }
    }
    setDailyStatusMap(map);
    setSaveFeedback('');
  }, [selectedClass, selectedDate, db.attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDailyStatusMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { notes: '' }), status },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setDailyStatusMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { status: 'Hadir' }), notes },
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    for (const s of currentClassStudents) {
      updated[s.id] = { status: 'Hadir', notes: '' };
    }
    setDailyStatusMap(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: Array<Omit<AttendanceRecord, 'id' | 'updatedAt'>> = currentClassStudents.map(
      (student) => {
        const item = dailyStatusMap[student.id] || { status: 'Hadir', notes: '' };
        return {
          studentId: student.id,
          date: selectedDate,
          status: item.status,
          notes: item.notes,
          recordedBy: 'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
        };
      }
    );

    recordAttendance(recordsToSave);
    setSaveFeedback('Daftar kehadiran berhasil disimpan secara permanen ke database!');
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Hadir & Presensi Harian Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kehadiran harian (Hadir, Sakit, Izin, Alfa) per kelas dan otomatis tersinkron dengan surat izin wali.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Presensi</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Absensi Hari Ini</span>
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Date & Class Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Tanggal:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold ml-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Kelas:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {db.settings.classes.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleMarkAllHadir}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
        >
          Setel Semua "Hadir"
        </button>
      </div>

      {/* Attendance Form Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Absensi Siswa Kelas {selectedClass} — Tanggal {selectedDate}
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih opsi status kehadiran untuk setiap siswa, lalu klik "Simpan Absensi Hari Ini".
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
            {currentClassStudents.length} Siswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Nama Siswa</th>
                <th className="py-2.5 px-4">NIS</th>
                <th className="py-2.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-2.5 px-4">Catatan Khusus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClassStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada siswa aktif di kelas {selectedClass}.
                  </td>
                </tr>
              ) : (
                currentClassStudents.map((student, idx) => {
                  const state = dailyStatusMap[student.id] || { status: 'Hadir', notes: '' };

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[10px] text-slate-400">
                          {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">{student.nis}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['Hadir', 'Sakit', 'Izin', 'Alfa'] as AttendanceStatus[]).map((status) => {
                            const isSelected = state.status === status;
                            let colorClasses = '';
                            if (status === 'Hadir') {
                              colorClasses = isSelected
                                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50';
                            } else if (status === 'Sakit') {
                              colorClasses = isSelected
                                ? 'bg-amber-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50';
                            } else if (status === 'Izin') {
                              colorClasses = isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-50';
                            } else if (status === 'Alfa') {
                              colorClasses = isSelected
                                ? 'bg-rose-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50';
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(student.id, status)}
                                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${colorClasses}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={state.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Catatan surat / keterangan..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Attendance Recap Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Rekapitulasi Kehadiran Siswa Kelas {selectedClass}
            </h3>
            <p className="text-[11px] text-slate-500">
              Kompilasi total hadir, sakit, izin, dan alfa beserta persentase kehadiran siswa.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 text-center text-emerald-800">Hadir (H)</th>
                <th className="py-2.5 px-3 text-center text-amber-800">Sakit (S)</th>
                <th className="py-2.5 px-3 text-center text-blue-800">Izin (I)</th>
                <th className="py-2.5 px-3 text-center text-rose-800">Alfa (A)</th>
                <th className="py-2.5 px-3 text-center">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClassStudents.map((student) => {
                const studentRecords = db.attendance.filter((a) => a.studentId === student.id);
                const summary = calculateAttendanceSummary(studentRecords);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{summary.hadir}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-700">{summary.sakit}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700">{summary.izin}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">{summary.alfa}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px]">
                        {summary.percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT MODAL: LAPORAN ABSENSI */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="REKAPITULASI DAFTAR HADIR SISWA"
        subtitle={`Kelas: ${selectedClass} | Tahun Pelajaran: ${db.settings.academicYear} | Semester: ${db.settings.semester}`}
        className={selectedClass}
      >
        <div className="space-y-4 text-xs">
          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center font-mono">NIS</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Hadir</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Sakit</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Izin</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Alfa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {currentClassStudents.map((s, idx) => {
                const records = db.attendance.filter((a) => a.studentId === s.id);
                const sum = calculateAttendanceSummary(records);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">{s.fullName}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-mono">{s.nis}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{sum.hadir}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{sum.sakit}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{sum.izin}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{sum.alfa}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                      {sum.percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrintModal>
    </div>
  );
};
