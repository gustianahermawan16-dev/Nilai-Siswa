import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Plus,
  Printer,
  History,
  Filter,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { DailyGrade, ExamGrade, Subject } from '../../types';
import { calculateGradeStatus } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminGrades: React.FC = () => {
  const {
    db,
    addDailyGrade,
    updateDailyGrade,
    deleteDailyGrade,
    releaseDailyGrades,
    upsertExamGrade,
    releaseExamGrades,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useDatabase();

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'harian' | 'pts' | 'pas' | 'rekap' | 'mapel'>('harian');
  const [selectedClass, setSelectedClass] = useState<string>('4A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(db.subjects[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Daily grade form modal
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<DailyGrade | null>(null);
  const [dgStudentId, setDgStudentId] = useState('');
  const [dgSubjectId, setDgSubjectId] = useState('');
  const [dgChapter, setDgChapter] = useState('');
  const [dgDate, setDgDate] = useState(new Date().toISOString().slice(0, 10));
  const [dgScore, setDgScore] = useState<number>(85);
  const [dgNotes, setDgNotes] = useState('');
  const [dgRelease, setDgRelease] = useState(true);

  // Exam grade edit modal (PTS/PAS with Change Reason)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examType, setExamType] = useState<'PTS' | 'PAS'>('PTS');
  const [examStudentId, setExamStudentId] = useState('');
  const [examSubjectId, setExamSubjectId] = useState('');
  const [examScore, setExamScore] = useState<number>(80);
  const [examNotes, setExamNotes] = useState('');
  const [examRelease, setExamRelease] = useState(true);
  const [examReason, setExamReason] = useState('');

  // History Change Log view modal
  const [viewHistoryLogs, setViewHistoryLogs] = useState<ExamGrade | null>(null);

  // Subject management modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCategory, setSubCategory] = useState<'PAI' | 'Umum' | 'Muatan Lokal'>('PAI');
  const [subClasses, setSubClasses] = useState<string[]>(['4A', '4B']);

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printDocumentType, setPrintDocumentType] = useState<string>('rekap');

  const currentClassStudents = db.students.filter(
    (s) => s.status === 'aktif' && (selectedClass === 'all' || s.className === selectedClass)
  );

  const passingGrade = db.settings.passingGrade || 75;

  // OPEN DAILY FORM
  const openAddDailyModal = () => {
    setEditingDaily(null);
    setDgStudentId(currentClassStudents[0]?.id || '');
    setDgSubjectId(selectedSubjectId || db.subjects[0]?.id || '');
    setDgChapter('Bab 1: ');
    setDgDate(new Date().toISOString().slice(0, 10));
    setDgScore(85);
    setDgNotes('');
    setDgRelease(true);
    setIsDailyModalOpen(true);
  };

  const openEditDailyModal = (dg: DailyGrade) => {
    setEditingDaily(dg);
    setDgStudentId(dg.studentId);
    setDgSubjectId(dg.subjectId);
    setDgChapter(dg.chapter);
    setDgDate(dg.date);
    setDgScore(dg.score);
    setDgNotes(dg.notes || '');
    setDgRelease(dg.isReleased);
    setIsDailyModalOpen(true);
  };

  const handleSaveDaily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dgStudentId || !dgSubjectId || !dgChapter.trim()) {
      alert('Mohon lengkapi siswa, mapel, dan materi/bab penilaian.');
      return;
    }

    if (editingDaily) {
      updateDailyGrade(editingDaily.id, {
        studentId: dgStudentId,
        subjectId: dgSubjectId,
        chapter: dgChapter,
        date: dgDate,
        score: Number(dgScore),
        notes: dgNotes,
        isReleased: dgRelease,
      });
    } else {
      addDailyGrade({
        studentId: dgStudentId,
        subjectId: dgSubjectId,
        chapter: dgChapter,
        date: dgDate,
        score: Number(dgScore),
        notes: dgNotes,
        isReleased: dgRelease,
        academicYear: db.settings.academicYear,
        semester: db.settings.semester,
      });
    }
    setIsDailyModalOpen(false);
  };

  // OPEN EXAM FORM (PTS / PAS)
  const openExamForm = (type: 'PTS' | 'PAS', studentId: string, subjectId: string) => {
    setExamType(type);
    setExamStudentId(studentId);
    setExamSubjectId(subjectId);

    const existing = db.examGrades.find(
      (e) =>
        e.studentId === studentId &&
        e.subjectId === subjectId &&
        e.type === type &&
        e.academicYear === db.settings.academicYear &&
        e.semester === db.settings.semester
    );

    if (existing) {
      setExamScore(existing.score);
      setExamNotes(existing.notes || '');
      setExamRelease(existing.isReleased);
      setExamReason('');
    } else {
      setExamScore(80);
      setExamNotes('');
      setExamRelease(true);
      setExamReason('Input nilai awal');
    }
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examStudentId || !examSubjectId) return;

    upsertExamGrade({
      studentId: examStudentId,
      subjectId: examSubjectId,
      type: examType,
      score: Number(examScore),
      academicYear: db.settings.academicYear,
      semester: db.settings.semester,
      notes: examNotes || (Number(examScore) >= passingGrade ? 'TUNTAS' : 'REMEDIAL'),
      isReleased: examRelease,
      reason: examReason || 'Pembaruan nilai ujian oleh Admin/Guru',
      changedBy: 'Admin/Guru Penguji',
    });

    setIsExamModalOpen(false);
  };

  // SUBJECT MODAL
  const openAddSubject = () => {
    setEditingSubject(null);
    setSubCode('');
    setSubName('');
    setSubCategory('PAI');
    setSubClasses([...db.settings.classes]);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubCode(sub.code);
    setSubName(sub.name);
    setSubCategory(sub.category);
    setSubClasses(sub.classes);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) {
      alert('Kode dan nama mata pelajaran wajib diisi.');
      return;
    }
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        code: subCode,
        name: subName,
        category: subCategory,
        classes: subClasses,
      });
    } else {
      addSubject({
        code: subCode,
        name: subName,
        category: subCategory,
        classes: subClasses,
      });
    }
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Manajemen Nilai Akademik</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              KKM: {passingGrade}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola Nilai Harian/Bab, Penilaian Tengah Semester (PTS), Penilaian Akhir Semester (PAS), dan Rilis Nilai ke Wali Murid.
          </p>
        </div>

        {/* Global Print button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPrintDocumentType(activeTab);
              setIsPrintOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Nilai</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('harian')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'harian'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Nilai Harian / Nilai Bab</span>
        </button>

        <button
          onClick={() => setActiveTab('pts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pts'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Nilai PTS (Tengah Semester)</span>
        </button>

        <button
          onClick={() => setActiveTab('pas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pas'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Nilai PAS (Akhir Semester)</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rekap Rapor Seluruh Mapel</span>
        </button>

        <button
          onClick={() => setActiveTab('mapel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'mapel'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kelola Mata Pelajaran ({db.subjects.length})</span>
        </button>
      </div>

      {/* FILTER BAR: KELAS & MAPEL (For Harian, PTS, PAS, Rekap) */}
      {activeTab !== 'mapel' && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Select Kelas */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Kelas</option>
              {db.settings.classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>

            {/* Select Mapel if not rekap */}
            {activeTab !== 'rekap' && (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 max-w-xs truncate"
              >
                {db.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    [{sub.code}] {sub.name}
                  </option>
                ))}
              </select>
            )}

            {/* Select Siswa */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Siswa ({currentClassStudents.length})</option>
              {currentClassStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.nis})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'harian' && (
            <button
              onClick={openAddDailyModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Nilai Harian</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 1: NILAI HARIAN / BAB */}
      {activeTab === 'harian' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daftar Nilai Harian & Nilai Bab</h3>
              <p className="text-[11px] text-slate-500">
                Nilai dengan status "Belum Dirilis" tersimpan di sistem guru dan TIDAK BISA dilihat oleh wali murid.
              </p>
            </div>
            {/* Batch release helper */}
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  const targetIds = db.dailyGrades
                    .filter((dg) => !dg.isReleased)
                    .map((dg) => dg.id);
                  if (targetIds.length > 0) {
                    releaseDailyGrades(targetIds, true);
                    alert(`Berhasil merilis ${targetIds.length} nilai harian ke portal wali murid.`);
                  } else {
                    alert('Semua nilai harian sudah dalam status dirilis.');
                  }
                }}
                className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Rilis Semua Nilai Harian</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Siswa</th>
                  <th className="py-2.5 px-4">Mata Pelajaran</th>
                  <th className="py-2.5 px-4">Bab / Materi Penilaian</th>
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4 text-center">Nilai</th>
                  <th className="py-2.5 px-4 text-center">Status KKM</th>
                  <th className="py-2.5 px-4 text-center">Visibilitas Wali</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const filteredDaily = db.dailyGrades.filter((dg) => {
                    const student = db.students.find((s) => s.id === dg.studentId);
                    if (!student) return false;
                    const matchClass = selectedClass === 'all' || student.className === selectedClass;
                    const matchSubject = !selectedSubjectId || dg.subjectId === selectedSubjectId;
                    const matchStudent = selectedStudentId === 'all' || dg.studentId === selectedStudentId;
                    return matchClass && matchSubject && matchStudent;
                  });

                  if (filteredDaily.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Belum ada nilai harian yang tercatat untuk filter ini. Klik "Input Nilai Harian" di atas.
                        </td>
                      </tr>
                    );
                  }

                  return filteredDaily.map((dg) => {
                    const student = db.students.find((s) => s.id === dg.studentId);
                    const subject = db.subjects.find((s) => s.id === dg.subjectId);
                    const status = calculateGradeStatus(dg.score, passingGrade);

                    return (
                      <tr key={dg.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{student?.fullName || '-'}</div>
                          <div className="text-[10px] text-slate-500">Kelas {student?.className}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{subject?.name || '-'}</span>
                          <div className="text-[10px] text-slate-400 font-mono">[{subject?.code}]</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{dg.chapter}</div>
                          {dg.notes && <div className="text-[10px] text-slate-500 italic">{dg.notes}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{dg.date}</td>
                        <td className="py-3 px-4 text-center font-bold text-sm">
                          <span
                            className={
                              status === 'TUNTAS' ? 'text-emerald-700' : 'text-rose-600'
                            }
                          >
                            {dg.score}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'TUNTAS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => releaseDailyGrades([dg.id], !dg.isReleased)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                              dg.isReleased
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Klik untuk ubah status rilis"
                          >
                            {dg.isReleased ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-700" />
                                <span>Dirilis</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-500" />
                                <span>Draft (Belum Rilis)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditDailyModal(dg)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              title="Edit Nilai"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  title: 'Hapus Nilai Harian',
                                  message: `Hapus penilaian "${dg.chapter}" untuk siswa ${student?.fullName || 'ini'}?`,
                                  onConfirm: () => deleteDailyGrade(dg.id),
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: NILAI PTS / PAS (SEPARATE INTERFACES WITH REASON & AUTO-REMEDIAL) */}
      {(activeTab === 'pts' || activeTab === 'pas') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                {activeTab === 'pts' ? 'Penilaian Tengah Semester (PTS)' : 'Penilaian Akhir Semester (PAS)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Nilai minimal tuntas: <strong>{passingGrade}</strong>. Sistem otomatis menandai TUNTAS atau REMEDIAL.
                Perubahan nilai tercatat secara transparan dengan alasan edit.
              </p>
            </div>
            <button
              onClick={() => {
                const targetType = activeTab === 'pts' ? 'PTS' : 'PAS';
                const ids = db.examGrades
                  .filter((e) => e.type === targetType && !e.isReleased)
                  .map((e) => e.id);
                if (ids.length > 0) {
                  releaseExamGrades(ids, true);
                  alert(`Berhasil merilis ${ids.length} nilai ${targetType} ke portal wali murid.`);
                } else {
                  alert(`Semua nilai ${targetType} sudah dalam status dirilis.`);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Rilis Semua Nilai {activeTab.toUpperCase()}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-4">Kelas</th>
                  <th className="py-2.5 px-4">Mata Pelajaran Terpilih</th>
                  <th className="py-2.5 px-4 text-center">Nilai {activeTab.toUpperCase()}</th>
                  <th className="py-2.5 px-4 text-center">Keterangan Otomatis</th>
                  <th className="py-2.5 px-4 text-center">Status Rilis ke Wali</th>
                  <th className="py-2.5 px-4 text-center">Log Riwayat</th>
                  <th className="py-2.5 px-4 text-center">Aksi / Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.map((student) => {
                  const targetSubject = db.subjects.find((s) => s.id === selectedSubjectId) || db.subjects[0];
                  const currentExamType = activeTab === 'pts' ? 'PTS' : 'PAS';

                  const exam = db.examGrades.find(
                    (e) =>
                      e.studentId === student.id &&
                      e.subjectId === targetSubject?.id &&
                      e.type === currentExamType &&
                      e.academicYear === db.settings.academicYear &&
                      e.semester === db.settings.semester
                  );

                  const status = exam ? calculateGradeStatus(exam.score, passingGrade) : null;
                  const logCount = exam?.changeLogs?.length || 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {student.nis}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">{student.className}</td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{targetSubject?.name}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {exam ? (
                          <span
                            className={`font-black text-base ${
                              status === 'TUNTAS' ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {exam.score}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum diinput</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {status ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'TUNTAS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {status === 'TUNTAS' ? 'TUNTAS (>= ' + passingGrade + ')' : 'REMEDIAL (< ' + passingGrade + ')'}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {exam ? (
                          <button
                            onClick={() => releaseExamGrades([exam.id], !exam.isReleased)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                              exam.isReleased
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {exam.isReleased ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-700" />
                                <span>Dirilis</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-500" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {logCount > 0 ? (
                          <button
                            onClick={() => setViewHistoryLogs(exam || null)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline cursor-pointer font-semibold"
                          >
                            <History className="w-3 h-3" />
                            <span>{logCount} Perubahan</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">Awal</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            openExamForm(
                              currentExamType,
                              student.id,
                              targetSubject?.id || db.subjects[0].id
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          {exam ? 'Edit Nilai' : 'Input Nilai'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REKAP NILAI RAPOR SELURUH MATA PELAJARAN */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Rekapitulasi Nilai Seluruh Mata Pelajaran — Kelas {selectedClass}
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan kompilasi rata-rata nilai harian, nilai PTS, dan nilai PAS setiap siswa.
              </p>
            </div>
            <button
              onClick={() => {
                setPrintDocumentType('rekap');
                setIsPrintOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh Rapor PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                  <th className="py-2 px-3 border border-slate-200">No</th>
                  <th className="py-2 px-3 border border-slate-200">Nama Siswa</th>
                  {db.subjects.map((sub) => (
                    <th key={sub.id} className="py-2 px-2 border border-slate-200 text-center font-mono">
                      {sub.code}
                    </th>
                  ))}
                  <th className="py-2 px-3 border border-slate-200 text-center bg-emerald-50 text-emerald-900">
                    Rata-rata
                  </th>
                  <th className="py-2 px-3 border border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.map((student, idx) => {
                  let totalScoreSum = 0;
                  let subjectCount = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 border border-slate-200 text-center font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900">
                        {student.fullName}
                      </td>

                      {db.subjects.map((sub) => {
                        const pts = db.examGrades.find(
                          (e) =>
                            e.studentId === student.id &&
                            e.subjectId === sub.id &&
                            e.type === 'PTS' &&
                            e.academicYear === db.settings.academicYear &&
                            e.semester === db.settings.semester
                        );
                        const pas = db.examGrades.find(
                          (e) =>
                            e.studentId === student.id &&
                            e.subjectId === sub.id &&
                            e.type === 'PAS' &&
                            e.academicYear === db.settings.academicYear &&
                            e.semester === db.settings.semester
                        );

                        // Average exam
                        const scores = [pts?.score, pas?.score].filter((v): v is number => typeof v === 'number');
                        const finalSubScore =
                          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

                        if (finalSubScore !== null) {
                          totalScoreSum += finalSubScore;
                          subjectCount++;
                        }

                        return (
                          <td
                            key={sub.id}
                            className={`py-2 px-2 border border-slate-200 text-center font-semibold ${
                              finalSubScore !== null
                                ? finalSubScore >= passingGrade
                                  ? 'text-emerald-800'
                                  : 'text-rose-600 bg-rose-50/50'
                                : 'text-slate-300'
                            }`}
                          >
                            {finalSubScore !== null ? finalSubScore : '-'}
                          </td>
                        );
                      })}

                      {/* Rata-rata */}
                      <td className="py-2.5 px-3 border border-slate-200 text-center font-black bg-emerald-50 text-emerald-950 text-sm">
                        {subjectCount > 0 ? (totalScoreSum / subjectCount).toFixed(1) : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 border border-slate-200 text-center">
                        {subjectCount > 0 ? (
                          totalScoreSum / subjectCount >= passingGrade ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              TUNTAS
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              REMEDIAL
                            </span>
                          )
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KELOLA MATA PELAJARAN */}
      {activeTab === 'mapel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Kurikulum & Daftar Mata Pelajaran</h3>
              <p className="text-xs text-slate-500">
                Mata pelajaran PAI (Kemenag), Umum, dan Muatan Lokal yang digunakan untuk penilaian.
              </p>
            </div>
            <button
              onClick={openAddSubject}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {db.subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/70 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {sub.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{sub.name}</h4>
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span>Kelas Aktif:</span>{' '}
                    <span className="text-slate-800 font-medium">
                      {sub.classes.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-1 mt-4 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => openEditSubject(sub)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    title="Edit Mapel"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm({
                        isOpen: true,
                        title: 'Hapus Mata Pelajaran',
                        message: `Apakah Anda yakin ingin menghapus mata pelajaran "${sub.name}" (${sub.code})? Data nilai terkait mata pelajaran ini mungkin terpengaruh.`,
                        onConfirm: () => deleteSubject(sub.id),
                      });
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus Mapel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT NILAI HARIAN */}
      {isDailyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">
                {editingDaily ? 'Edit Nilai Harian / Bab' : 'Input Nilai Harian Baru'}
              </h3>
              <button
                onClick={() => setIsDailyModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDaily} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={dgStudentId}
                  onChange={(e) => setDgStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {currentClassStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis}) — Kelas {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                <select
                  required
                  value={dgSubjectId}
                  onChange={(e) => setDgSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {db.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.code}] {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bab / Materi Penilaian *</label>
                <input
                  type="text"
                  required
                  value={dgChapter}
                  onChange={(e) => setDgChapter(e.target.value)}
                  placeholder="Contoh: Bab 2: Tajwid Hukum Nun Mati"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Penilaian</label>
                  <input
                    type="date"
                    required
                    value={dgDate}
                    onChange={(e) => setDgDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Angka (0 - 100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={dgScore}
                    onChange={(e) => setDgScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan Guru</label>
                <input
                  type="text"
                  value={dgNotes}
                  onChange={(e) => setDgNotes(e.target.value)}
                  placeholder="Catatan perkembangan pemahaman siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Rilis Nilai ke Portal Wali Murid</span>
                  <span className="text-[10px] text-slate-500">
                    Jika tidak dicentang, nilai hanya tersimpan di akun guru/admin.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={dgRelease}
                  onChange={(e) => setDgRelease(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDailyModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  {editingDaily ? 'Simpan Perubahan' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT EXAM GRADE (PTS / PAS) WITH AUDIT CHANGE LOG */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">
                Input / Edit Nilai {examType}
              </h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Identitas Siswa:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {db.students.find((s) => s.id === examStudentId)?.fullName}
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  Mata Pelajaran: {db.subjects.find((s) => s.id === examSubjectId)?.name}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nilai Angka (KKM: {passingGrade}) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={examScore}
                  onChange={(e) => setExamScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Status Otomatis:</span>
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                      examScore >= passingGrade
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {examScore >= passingGrade ? 'TUNTAS' : 'REMEDIAL'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan Perubahan / Catatan Audit
                </label>
                <input
                  type="text"
                  value={examReason}
                  onChange={(e) => setExamReason(e.target.value)}
                  placeholder="Misal: Perbaikan nilai remedial, koreksi lembar jawaban..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan Raport</label>
                <input
                  type="text"
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  placeholder="Deskripsi pencapaian kompetensi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Rilis ke Wali Murid</span>
                  <span className="text-[10px] text-slate-500">
                    Bila aktif, wali murid dapat melihat nilai ini di dashboard mereka.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={examRelease}
                  onChange={(e) => setExamRelease(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan & Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VIEW HISTORY CHANGE LOGS */}
      {viewHistoryLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-slate-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Riwayat Perubahan Nilai Ujian</h3>
              </div>
              <button
                onClick={() => setViewHistoryLogs(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3 text-xs">
              {viewHistoryLogs.changeLogs && viewHistoryLogs.changeLogs.length > 0 ? (
                viewHistoryLogs.changeLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Tanggal: {log.date.slice(0, 16).replace('T', ' ')}</span>
                      <span>Oleh: {log.changedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                      <span className="text-rose-600 line-through">{log.oldScore}</span>
                      <span>→</span>
                      <span className="text-emerald-700">{log.newScore}</span>
                    </div>
                    <p className="text-slate-600 italic text-[11px]">Alasan: {log.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">Belum ada riwayat perubahan.</p>
              )}
            </div>

            <div className="p-3 bg-slate-100 flex justify-end">
              <button
                onClick={() => setViewHistoryLogs(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MATA PELAJARAN */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Mapel *</label>
                <input
                  type="text"
                  required
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: PAI-QH, MTK, IPA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Contoh: Al-Qur'an Hadis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Kurikulum</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="PAI">Pendidikan Agama Islam (PAI Kemenag)</option>
                  <option value="Umum">Mata Pelajaran Umum (Kemendikbud)</option>
                  <option value="Muatan Lokal">Muatan Lokal (Mulok)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Kelas yang Mengikuti Mapel Ini:</label>
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {db.settings.classes.map((cls) => {
                    const checked = subClasses.includes(cls);
                    return (
                      <label key={cls} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSubClasses([...subClasses, cls]);
                            } else {
                              setSubClasses(subClasses.filter((c) => c !== cls));
                            }
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span>{cls}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: REKAP RAPOR */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title={
          printDocumentType === 'harian'
            ? 'LEMBAR PENILAIAN HARIAN SISWA'
            : printDocumentType === 'pts'
            ? 'REKAP PENILAIAN TENGAH SEMESTER (PTS)'
            : printDocumentType === 'pas'
            ? 'REKAP PENILAIAN AKHIR SEMESTER (PAS)'
            : 'REKAPITULASI RAPOR AKADEMIK SISWA'
        }
        subtitle={`Kelas: ${selectedClass === 'all' ? 'Seluruh Kelas' : selectedClass} | Batas KKM: ${passingGrade}`}
        className={selectedClass === 'all' ? 'Semua Kelas' : selectedClass}
      >
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">NIS</th>
                {db.subjects.map((s) => (
                  <th key={s.id} className="border border-slate-800 py-1.5 px-1.5 text-center font-mono text-[9px]">
                    {s.code}
                  </th>
                ))}
                <th className="border border-slate-800 py-1.5 px-2 text-center bg-slate-200">Rerata</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Hasil</th>
              </tr>
            </thead>
            <tbody>
              {currentClassStudents.map((st, i) => {
                let totalScore = 0;
                let count = 0;

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{i + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">{st.fullName}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-mono">{st.nis}</td>
                    {db.subjects.map((sub) => {
                      const pts = db.examGrades.find(
                        (e) => e.studentId === st.id && e.subjectId === sub.id && e.type === 'PTS'
                      );
                      const pas = db.examGrades.find(
                        (e) => e.studentId === st.id && e.subjectId === sub.id && e.type === 'PAS'
                      );
                      const arr = [pts?.score, pas?.score].filter((v): v is number => typeof v === 'number');
                      const val = arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
                      if (val !== null) {
                        totalScore += val;
                        count++;
                      }
                      return (
                        <td key={sub.id} className="border border-slate-800 py-1.5 px-1.5 text-center font-semibold">
                          {val !== null ? val : '-'}
                        </td>
                      );
                    })}
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold bg-slate-100">
                      {count > 0 ? (totalScore / count).toFixed(1) : '-'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                      {count > 0 ? (totalScore / count >= passingGrade ? 'TUNTAS' : 'REMEDIAL') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm?.isOpen}
        title={deleteConfirm?.title || 'Konfirmasi Hapus'}
        message={deleteConfirm?.message || ''}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteConfirm?.onConfirm) {
            deleteConfirm.onConfirm();
          }
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
