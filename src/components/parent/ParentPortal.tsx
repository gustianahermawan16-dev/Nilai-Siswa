import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  PiggyBank,
  HeartHandshake,
  CalendarCheck,
  FileCheck2,
  Bell,
  Coins,
  Send,
  Camera,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ChevronRight,
  Eye,
  Award,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import {
  calculateAttendanceSummary,
  calculateGradeStatus,
  calculateSavingsBalance,
  calculateTotalInfak,
  formatDateIndonesian,
  formatRupiah,
} from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';

export const ParentPortal: React.FC = () => {
  const { currentUser, activeStudent } = useAuth();
  const { db, submitPermit } = useDatabase();

  const [activeTab, setActiveTab] = useState<
    'dasbor' | 'nilai' | 'jadwal' | 'tabungan' | 'infak' | 'absensi' | 'izin' | 'iuran'
  >('dasbor');
  const [parentSelectedDay, setParentSelectedDay] = useState<string>('Senin');

  // Leave permit form state
  const [permitType, setPermitType] = useState<'Sakit' | 'Izin'>('Sakit');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [permitFeedback, setPermitFeedback] = useState<string>('');

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<string>('rapor');

  // Fallback student if not assigned
  const student = activeStudent || db.students[0];

  // Released academic grades only
  const releasedDailyGrades = db.dailyGrades.filter(
    (dg) => dg.studentId === student.id && dg.isReleased
  );
  const releasedPTS = db.examGrades.filter(
    (eg) => eg.studentId === student.id && eg.type === 'PTS' && eg.isReleased
  );
  const releasedPAS = db.examGrades.filter(
    (eg) => eg.studentId === student.id && eg.type === 'PAS' && eg.isReleased
  );

  // Savings
  const studentSavings = db.savings.filter((s) => s.studentId === student.id);
  const savingsBalance = calculateSavingsBalance(studentSavings);

  // Infak
  const studentInfak = db.infak.filter((i) => i.studentId === student.id);
  const totalInfakPaid = calculateTotalInfak(studentInfak);

  // Attendance
  const studentAttendance = db.attendance.filter((a) => a.studentId === student.id);
  const attendanceSummary = calculateAttendanceSummary(studentAttendance);

  // Permits submitted by this student
  const studentPermits = db.permits.filter((p) => p.studentId === student.id);

  // Fees applicable to this child
  const applicableFees = db.fees.filter((f) => {
    if (f.targetType === 'all') return true;
    if (f.targetType === 'class' && f.targetClass === student.className) return true;
    if (f.targetType === 'students' && f.targetStudentIds?.includes(student.id)) return true;
    return false;
  });

  // Photo upload for doctor's note
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran foto maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachmentUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Alasan izin/sakit wajib diisi.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }

    submitPermit({
      studentId: student.id,
      type: permitType,
      startDate,
      endDate,
      reason,
      notes: notes || undefined,
      attachmentUrl: attachmentUrl || undefined,
    });

    setPermitFeedback(
      'Surat permohonan berhasil dikirim ke pengelola madrasah. Anda dapat melihat status persetujuannya di riwayat bawah.'
    );
    setReason('');
    setNotes('');
    setAttachmentUrl('');
    setTimeout(() => setPermitFeedback(''), 5000);
  };

  const passingGrade = db.settings.passingGrade || 75;

  return (
    <div className="space-y-6">
      {/* Profil Anak Card Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl border-b-4 border-amber-400">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Child Photo */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-amber-400 bg-white shadow-xl flex-shrink-0">
              <img
                src={student.photoUrl || '/logo.png'}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md">
              SANTRI
            </span>
          </div>

          {/* Child Bio */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-amber-300 text-xs font-semibold mb-2 border border-emerald-600/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Wali Murid • MI Nurul Falah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{student.fullName}</h1>
            <div className="mt-1 flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-emerald-100">
              <span className="font-bold text-amber-200">Kelas {student.className}</span>
              <span>•</span>
              <span className="font-mono">NIS: {student.nis}</span>
              <span>•</span>
              <span className="font-mono">NISN: {student.nisn}</span>
            </div>
            <div className="mt-2 text-xs text-emerald-200">
              <span>Wali Kelas: <strong>{student.homeroomTeacher}</strong></span>
              <span className="mx-2">•</span>
              <span>TA: <strong>{db.settings.academicYear}</strong> ({db.settings.semester})</span>
            </div>
          </div>

          {/* Print Rapor Button */}
          <button
            onClick={() => {
              setPrintDocType('rapor');
              setIsPrintOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor Anak</span>
          </button>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('dasbor')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dasbor'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Dasbor & Pengumuman</span>
        </button>

        <button
          onClick={() => setActiveTab('nilai')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'nilai'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Nilai Akademik</span>
        </button>

        <button
          onClick={() => setActiveTab('jadwal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'jadwal'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Pelajaran</span>
        </button>

        <button
          onClick={() => setActiveTab('tabungan')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tabungan'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Tabungan Anak</span>
        </button>

        <button
          onClick={() => setActiveTab('infak')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'infak'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Infak Bulanan</span>
        </button>

        <button
          onClick={() => setActiveTab('absensi')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'absensi'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Kehadiran</span>
        </button>

        <button
          onClick={() => setActiveTab('izin')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'izin'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Kirim Surat Izin / Sakit</span>
        </button>

        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'iuran'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Iuran Kegiatan ({applicableFees.length})</span>
        </button>
      </div>

      {/* TAB 1: DASBOR & PENGUMUMAN */}
      {activeTab === 'dasbor' && (
        <div className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Saldo Tabungan */}
            <div
              onClick={() => setActiveTab('tabungan')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs transition cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Saldo Tabungan
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                {formatRupiah(savingsBalance.balance)}
              </div>
            </div>

            {/* Total Infak */}
            <div
              onClick={() => setActiveTab('infak')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs transition cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Infak Terbayar
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                {formatRupiah(totalInfakPaid)}
              </div>
            </div>

            {/* Kehadiran */}
            <div
              onClick={() => setActiveTab('absensi')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs transition cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Persentase Hadir
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">
                {attendanceSummary.percentage}%
              </div>
            </div>

            {/* Nilai Rilis */}
            <div
              onClick={() => setActiveTab('nilai')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs transition cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Nilai Dirilis Guru
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">
                {releasedDailyGrades.length + releasedPTS.length + releasedPAS.length} Nilai
              </div>
            </div>
          </div>

          {/* Pengumuman Sekolah */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base text-slate-900">Pengumuman Resmi Madrasah</h3>
            </div>

            <div className="space-y-3">
              {db.announcements
                .filter(
                  (a) => a.targetType === 'all' || a.targetClass === student.className
                )
                .map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{ann.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {ann.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                      {ann.content}
                    </p>
                    {ann.attachmentUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 max-h-48">
                        <img
                          src={ann.attachmentUrl}
                          alt={ann.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-slate-400">Penerbit: {ann.author}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NILAI AKADEMIK (ONLY RELEASED GRADES) */}
      {activeTab === 'nilai' && (
        <div className="space-y-6">
          {/* Header & KKM notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Laporan Hasil Belajar Siswa (Nilai yang Telah Dirilis)
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Batas Minimal Ketuntasan (KKM): <strong>{passingGrade}</strong>. Nilai &ge; {passingGrade} = TUNTAS, &lt; {passingGrade} = REMEDIAL.
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocType('rapor');
                setIsPrintOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Raport PDF</span>
            </button>
          </div>

          {/* Nilai PTS & PAS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Nilai Ujian Semester (PTS & PAS)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 text-center">Nilai PTS</th>
                    <th className="py-2.5 px-3 text-center">Status PTS</th>
                    <th className="py-2.5 px-3 text-center">Nilai PAS</th>
                    <th className="py-2.5 px-3 text-center">Status PAS</th>
                    <th className="py-2.5 px-3">Catatan Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.subjects
                    .filter((sub) => sub.classes.includes(student.className))
                    .map((sub) => {
                      const pts = releasedPTS.find((e) => e.subjectId === sub.id);
                      const pas = releasedPAS.find((e) => e.subjectId === sub.id);
                      const statusPts = pts ? calculateGradeStatus(pts.score, passingGrade) : null;
                      const statusPas = pas ? calculateGradeStatus(pas.score, passingGrade) : null;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{sub.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">[{sub.code}]</div>
                          </td>

                          <td className="py-3 px-3 text-center font-black text-sm">
                            {pts ? (
                              <span
                                className={statusPts === 'TUNTAS' ? 'text-emerald-700' : 'text-rose-600'}
                              >
                                {pts.score}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic text-[11px]">Belum dirilis</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {statusPts ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  statusPts === 'TUNTAS'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {statusPts}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center font-black text-sm">
                            {pas ? (
                              <span
                                className={statusPas === 'TUNTAS' ? 'text-emerald-700' : 'text-rose-600'}
                              >
                                {pas.score}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic text-[11px]">Belum dirilis</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {statusPas ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  statusPas === 'TUNTAS'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {statusPas}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            {pas?.notes || pts?.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nilai Harian / Nilai Bab yang sudah dirilis */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Nilai Harian & Nilai Bab / Materi</span>
            </h4>

            {releasedDailyGrades.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">
                Belum ada nilai harian yang dirilis oleh wali kelas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {releasedDailyGrades.map((dg) => {
                  const sub = db.subjects.find((s) => s.id === dg.subjectId);
                  const isTuntas = dg.score >= passingGrade;

                  return (
                    <div
                      key={dg.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-emerald-800 font-bold uppercase">
                          {sub?.name || '-'}
                        </div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">{dg.chapter}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Tanggal: {dg.date}</div>
                        {dg.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{dg.notes}</div>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-xl font-black ${
                            isTuntas ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {dg.score}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isTuntas
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isTuntas ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: JADWAL PELAJARAN ANAK */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Jadwal Pelajaran Kelas {student.className}
              </h3>
              <p className="text-xs text-slate-500">
                Mata pelajaran mingguan, jam pelajaran, dan guru pengampu kelas {student.className}
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocType('jadwal');
                setIsPrintOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Jadwal Pelajaran</span>
            </button>
          </div>

          {/* Day selection */}
          <div className="flex overflow-x-auto gap-2 pb-1">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
              const isActive = parentSelectedDay === day;
              const count = (db.schedules || []).filter(
                (s) => s.className === student.className && s.day === day
              ).length;
              return (
                <button
                  key={day}
                  onClick={() => setParentSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Schedule Cards */}
          {(() => {
            const dayItems = (db.schedules || [])
              .filter((s) => s.className === student.className && s.day === parentSelectedDay)
              .sort((a, b) => a.period - b.period);

            if (dayItems.length === 0) {
              return (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-xs text-slate-600">
                    Tidak ada jadwal pelajaran untuk hari {parentSelectedDay}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dayItems.map((item) => {
                  const sub = db.subjects.find((s) => s.id === item.subjectId);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/20 hover:border-emerald-400 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Jam Ke-{item.period}
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                            {sub?.category || 'Madrasah'}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            {item.subjectName}
                          </h4>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          <p className="truncate">Guru: <strong>{item.teacherName}</strong></p>
                          {item.room && (
                            <p className="text-slate-400 text-[11px] mt-0.5">Ruang: {item.room}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Weekly Summary Table */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
              Ringkasan Jadwal Satu Pekan:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="py-2 px-3 w-24">Hari</th>
                    <th className="py-2 px-3">Mata Pelajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                    const items = (db.schedules || [])
                      .filter((s) => s.className === student.className && s.day === day)
                      .sort((a, b) => a.period - b.period);
                    return (
                      <tr key={day}>
                        <td className="py-2 px-3 font-bold text-emerald-900">{day}</td>
                        <td className="py-2 px-3">
                          {items.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">- Libur / Tidak ada -</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((it) => (
                                <span
                                  key={it.id}
                                  className="px-2 py-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px]"
                                >
                                  <strong>Jam {it.period}:</strong> {it.subjectName}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUKU TABUNGAN ANAK */}
      {activeTab === 'tabungan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Buku Tabungan Siswa</h3>
              <p className="text-xs text-slate-500">
                Riwayat setoran dan penarikan tabungan {student.fullName}.
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocType('tabungan');
                setIsPrintOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Buku Tabungan</span>
            </button>
          </div>

          {/* Saldo summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Saldo Tabungan Saat Ini
              </span>
              <div className="text-3xl font-black mt-1">
                {formatRupiah(savingsBalance.balance)}
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600">
                <span className="text-emerald-200 block">Total Uang Masuk:</span>
                <strong className="text-white text-sm font-bold">
                  {formatRupiah(savingsBalance.totalIn)}
                </strong>
              </div>
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600">
                <span className="text-emerald-200 block">Total Uang Keluar:</span>
                <strong className="text-rose-300 text-sm font-bold">
                  {formatRupiah(savingsBalance.totalOut)}
                </strong>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3 text-center">Jenis Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3">Penerima/Pencatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentSavings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada transaksi tabungan.
                    </td>
                  </tr>
                ) : (
                  studentSavings.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{tx.date}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type === 'in' ? 'Setoran Masuk' : 'Penarikan'}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'in' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{tx.notes}</td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-400">{tx.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INFAK BULANAN */}
      {activeTab === 'infak' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Catatan Infak Bulanan Siswa</h3>
              <p className="text-xs text-slate-500">
                Riwayat pembayaran infak {student.fullName} di MI Nurul Falah.
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocType('infak');
                setIsPrintOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Bukti Infak</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Total Infak yang Telah Disalurkan
              </span>
              <div className="text-3xl font-black mt-1">
                {formatRupiah(totalInfakPaid)}
              </div>
            </div>
            <HeartHandshake className="w-10 h-10 text-amber-200 opacity-80" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal Bayar</th>
                  <th className="py-2.5 px-3">Bulan & Tahun</th>
                  <th className="py-2.5 px-3 text-right">Nominal Infak</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentInfak.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada data pembayaran infak.
                    </td>
                  </tr>
                ) : (
                  studentInfak.map((inf) => (
                    <tr key={inf.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inf.paymentDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {inf.month} {inf.year}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800">
                        {formatRupiah(inf.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{inf.notes || '-'}</td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-400">{inf.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ABSENSI & KEHADIRAN */}
      {activeTab === 'absensi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Rekapitulasi Kehadiran Anak</h3>
              <p className="text-xs text-slate-500">
                Catatan absensi harian {student.fullName} di sekolah.
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocType('absensi');
                setIsPrintOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Rekap Presensi</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-2xl font-black text-emerald-800">{attendanceSummary.hadir}</span>
              <span className="text-xs block font-bold text-emerald-700 uppercase mt-0.5">Hadir</span>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <span className="text-2xl font-black text-amber-800">{attendanceSummary.sakit}</span>
              <span className="text-xs block font-bold text-amber-700 uppercase mt-0.5">Sakit</span>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <span className="text-2xl font-black text-blue-800">{attendanceSummary.izin}</span>
              <span className="text-xs block font-bold text-blue-700 uppercase mt-0.5">Izin</span>
            </div>
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-center">
              <span className="text-2xl font-black text-rose-800">{attendanceSummary.alfa}</span>
              <span className="text-xs block font-bold text-rose-700 uppercase mt-0.5">Alfa</span>
            </div>
          </div>

          {/* Daily logs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      Belum ada catatan kehadiran.
                    </td>
                  </tr>
                ) : (
                  studentAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-700">{a.date}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'Sakit'
                              ? 'bg-amber-100 text-amber-800'
                              : a.status === 'Izin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{a.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SURAT IZIN / SAKIT (SUBMISSION FORM & STATUS) */}
      {activeTab === 'izin' && (
        <div className="space-y-6">
          {/* Submission Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Formulir Pengajuan Surat Izin / Surat Sakit
                </h3>
                <p className="text-xs text-slate-500">
                  Data nama siswa dan kelas otomatis terisi. Setelah dikirim, pengajuan tidak dapat diedit atau dihapus.
                </p>
              </div>
            </div>

            {permitFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{permitFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPermit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Nama Siswa (Otomatis):
                  </span>
                  <strong className="text-slate-900 text-sm">{student.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Kelas & NIS (Otomatis):
                  </span>
                  <strong className="text-slate-900 text-sm">
                    Kelas {student.className} • NIS: {student.nis}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Jenis Permohonan Izin *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPermitType('Sakit')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      permitType === 'Sakit'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Surat Sakit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermitType('Izin')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      permitType === 'Izin'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Surat Izin Keperluan</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Izin / Sakit *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Demam flu tinggi rawat jalan / Menghadiri pernikahan keluarga"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan dari wali murid untuk bapak/ibu guru..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              {/* Photo upload for doctor's note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lampiran Foto Surat Dokter / Keterangan Tertulis (Dari Galeri HP / Kamera)
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                  <Camera className="w-5 h-5 text-emerald-700" />
                  <span className="text-slate-600 text-xs">Pilih foto dokumen dari perangkat...</span>
                  <input type="file" accept="image/*" onChange={handleAttachmentUpload} className="hidden" />
                </label>
                {attachmentUrl && (
                  <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500">
                    <img src={attachmentUrl} alt="Pratinjau Surat Dokter" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Kirim Surat Permohonan Izin ke Madrasah</span>
              </button>
            </form>
          </div>

          {/* Previous Submissions List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900">
              Riwayat Pengajuan Surat Izin Saya ({studentPermits.length})
            </h4>

            <div className="space-y-3">
              {studentPermits.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-6">
                  Belum ada riwayat pengajuan surat izin.
                </p>
              ) : (
                studentPermits.map((p) => {
                  const isPending = p.status === 'pending';
                  const isApproved = p.status === 'approved';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border-2 transition ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/30'
                          : isApproved
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-rose-300 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.type === 'Sakit'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Surat {p.type}
                          </span>
                          <span className="text-xs text-slate-500 font-medium ml-2">
                            Periode: {p.startDate} s.d. {p.endDate}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isPending
                            ? 'Menunggu Persetujuan'
                            : isApproved
                            ? 'Disetujui'
                            : 'Ditolak'}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-800">
                        <strong>Alasan:</strong> {p.reason}
                      </div>

                      {p.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          Keterangan wali: {p.notes}
                        </div>
                      )}

                      {p.adminNote && (
                        <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                          <span className="font-bold text-slate-700 block text-[10px]">
                            Tanggapan Madrasah:
                          </span>
                          <span className="text-slate-800">{p.adminNote}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: IURAN TAMBAHAN YANG BERLAKU */}
      {activeTab === 'iuran' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Iuran Kegiatan & Perlengkapan Sekolah
            </h3>
            <p className="text-xs text-slate-500">
              Daftar tagihan iuran yang berlaku untuk {student.fullName} (Kelas {student.className}).
            </p>
          </div>

          <div className="space-y-3">
            {applicableFees.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">
                Tidak ada tagihan iuran aktif untuk saat ini.
              </p>
            ) : (
              applicableFees.map((fee) => {
                const payment = db.feePayments.find(
                  (fp) => fp.feeId === fee.id && fp.studentId === student.id
                );
                const isLunas = payment?.status === 'Lunas';

                return (
                  <div
                    key={fee.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{fee.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLunas
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {payment?.status || 'Belum Lunas'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{fee.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Batas Waktu: <strong className="text-slate-600">{fee.dueDate}</strong>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        Besar Iuran:
                      </span>
                      <span className="text-base font-black text-emerald-800">
                        {formatRupiah(fee.amount)}
                      </span>
                      {payment && payment.paidAmount > 0 && (
                        <div className="text-[11px] text-slate-600 font-semibold">
                          Terbayar: {formatRupiah(payment.paidAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PRINT MODAL: RAPOR & DOKUMEN ANAK */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title={
          printDocType === 'rapor'
            ? 'LEMBAR HASIL BELAJAR SISWA (RAPOR SEMENTARA)'
            : printDocType === 'tabungan'
            ? 'BUKU TABUNGAN SISWA'
            : printDocType === 'infak'
            ? 'BUKTI PEMBAYARAN INFAK SISWA'
            : printDocType === 'jadwal'
            ? `JADWAL PELAJARAN KELAS ${student.className}`
            : 'REKAPITULASI PRESENSI SISWA'
        }
        subtitle={`MI Nurul Falah | TA: ${db.settings.academicYear} (${db.settings.semester})`}
        studentName={student.fullName}
        className={student.className}
        nisn={student.nisn}
        homeroomTeacher={student.homeroomTeacher}
      >
        {printDocType === 'rapor' && (
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-800 py-1.5 px-2">Mata Pelajaran</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">KKM</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Nilai PTS</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Nilai PAS</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Rerata</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {db.subjects
                  .filter((sub) => sub.classes.includes(student.className))
                  .map((sub, idx) => {
                    const pts = releasedPTS.find((e) => e.subjectId === sub.id);
                    const pas = releasedPAS.find((e) => e.subjectId === sub.id);
                    const scores = [pts?.score, pas?.score].filter((v): v is number => typeof v === 'number');
                    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                    const isTuntas = avg !== null ? avg >= passingGrade : null;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-800 py-1.5 px-2 font-semibold">{sub.name}</td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                          {passingGrade}
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                          {pts?.score || '-'}
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                          {pas?.score || '-'}
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-black">
                          {avg !== null ? avg : '-'}
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                          {isTuntas !== null ? (isTuntas ? 'TUNTAS' : 'REMEDIAL') : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {printDocType === 'tabungan' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center">
              <div>
                <span className="font-bold">Total Tabungan Disimpan:</span>
              </div>
              <div className="text-base font-black text-emerald-800">
                {formatRupiah(savingsBalance.balance)}
              </div>
            </div>
            <table className="w-full border-collapse border border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-800 py-1.5 px-2">Tanggal</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Jenis</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-right">Uang Masuk</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-right">Uang Keluar</th>
                  <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {studentSavings.map((tx, idx) => (
                  <tr key={tx.id}>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">{tx.date}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">
                      {tx.type === 'in' ? 'Setor' : 'Tarik'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-semibold">
                      {tx.type === 'in' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-semibold text-rose-700">
                      {tx.type === 'out' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {printDocType === 'infak' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center">
              <div>
                <span className="font-bold">Total Infak Disalurkan:</span>
              </div>
              <div className="text-base font-black text-amber-800">
                {formatRupiah(totalInfakPaid)}
              </div>
            </div>
            <table className="w-full border-collapse border border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-800 py-1.5 px-2">Tanggal Bayar</th>
                  <th className="border border-slate-800 py-1.5 px-2">Bulan Infak</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-right">Nominal</th>
                  <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {studentInfak.map((inf, idx) => (
                  <tr key={inf.id}>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">{inf.paymentDate}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">
                      {inf.month} {inf.year}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-black text-emerald-800">
                      {formatRupiah(inf.amount)}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{inf.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {printDocType === 'absensi' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 grid grid-cols-4 text-center">
              <div>Hadir: <strong>{attendanceSummary.hadir}</strong></div>
              <div>Sakit: <strong>{attendanceSummary.sakit}</strong></div>
              <div>Izin: <strong>{attendanceSummary.izin}</strong></div>
              <div>Alfa: <strong>{attendanceSummary.alfa}</strong></div>
            </div>
            <table className="w-full border-collapse border border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-800 py-1.5 px-2">Tanggal</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Status</th>
                  <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {studentAttendance.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">{a.date}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                      {a.status}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{a.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {printDocType === 'jadwal' && (
          <div className="space-y-4 text-xs">
            <div className="text-center font-bold text-sm text-slate-900 uppercase">
              JADWAL PELAJARAN KELAS {student.className} • TAHUN AJARAN {db.settings.academicYear}
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-16">Hari</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-14">Jam Ke-</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-24">Waktu</th>
                  <th className="border border-slate-800 py-1.5 px-2">Mata Pelajaran</th>
                  <th className="border border-slate-800 py-1.5 px-2">Guru Pengampu</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-24">Ruang</th>
                </tr>
              </thead>
              <tbody>
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                  const items = (db.schedules || [])
                    .filter((s) => s.className === student.className && s.day === day)
                    .sort((a, b) => a.period - b.period);

                  if (items.length === 0) {
                    return (
                      <tr key={day}>
                        <td className="border border-slate-800 py-1.5 px-2 font-bold text-center bg-slate-50">
                          {day}
                        </td>
                        <td
                          colSpan={5}
                          className="border border-slate-800 py-1.5 px-2 text-center text-slate-400 italic"
                        >
                          Libur / Tidak ada jam pelajaran
                        </td>
                      </tr>
                    );
                  }

                  return items.map((it, idx) => (
                    <tr key={it.id}>
                      {idx === 0 ? (
                        <td
                          rowSpan={items.length}
                          className="border border-slate-800 py-1.5 px-2 font-bold text-center bg-slate-50 align-top"
                        >
                          {day}
                        </td>
                      ) : null}
                      <td className="border border-slate-800 py-1.5 px-2 text-center font-semibold">
                        {it.period}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2 text-center font-mono">
                        {it.startTime} - {it.endTime}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2 font-bold">{it.subjectName}</td>
                      <td className="border border-slate-800 py-1.5 px-2">{it.teacherName}</td>
                      <td className="border border-slate-800 py-1.5 px-2 text-center">
                        {it.room || '-'}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </PrintModal>
    </div>
  );
};
