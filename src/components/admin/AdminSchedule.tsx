import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  BookOpen,
  User,
  MapPin,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  X,
  Filter,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { DayOfWeek, ScheduleItem } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const AdminSchedule: React.FC = () => {
  const { db, addScheduleItem, updateScheduleItem, deleteScheduleItem } = useDatabase();

  const [selectedClass, setSelectedClass] = useState<string>('4A');
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Senin');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form Fields
  const [formClass, setFormClass] = useState('4A');
  const [formDay, setFormDay] = useState<DayOfWeek>('Senin');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('08:15');
  const [formSubjectId, setFormSubjectId] = useState(db.subjects[0]?.id || '');
  const [formTeacher, setFormTeacher] = useState('Ustadz Gustiana Hermawan, S.Pd.');
  const [formRoom, setFormRoom] = useState('Ruang 4A');

  // Print & Delete Dialog States
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const schedules = db.schedules || [];

  // Filtered schedules by selected class
  const classSchedules = schedules.filter((s) => s.className === selectedClass);
  // Filtered by selected day and sorted by period
  const daySchedules = classSchedules
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.period - b.period);

  const openAddModal = () => {
    setEditingItem(null);
    setFormClass(selectedClass);
    setFormDay(activeDay);
    // Auto increment period
    const existingForDay = classSchedules.filter((s) => s.day === activeDay);
    const nextPeriod = existingForDay.length > 0 ? Math.max(...existingForDay.map((s) => s.period)) + 1 : 1;
    setFormPeriod(nextPeriod);
    setFormStartTime('07:30');
    setFormEndTime('08:15');
    setFormSubjectId(db.subjects[0]?.id || '');
    setFormTeacher('Ustadz Gustiana Hermawan, S.Pd.');
    setFormRoom(`Ruang ${selectedClass}`);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormClass(item.className);
    setFormDay(item.day);
    setFormPeriod(item.period);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormSubjectId(item.subjectId);
    setFormTeacher(item.teacherName);
    setFormRoom(item.room || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedSubject = db.subjects.find((s) => s.id === formSubjectId);
    const subjectName = matchedSubject ? matchedSubject.name : 'Mata Pelajaran';

    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        className: formClass,
        day: formDay,
        period: Number(formPeriod),
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: formSubjectId,
        subjectName,
        teacherName: formTeacher,
        room: formRoom,
      });
      setNotice(`Jadwal jam ke-${formPeriod} (${subjectName}) berhasil diperbarui.`);
    } else {
      addScheduleItem({
        className: formClass,
        day: formDay,
        period: Number(formPeriod),
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: formSubjectId,
        subjectName,
        teacherName: formTeacher,
        room: formRoom,
      });
      setNotice(`Jadwal jam ke-${formPeriod} (${subjectName}) berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Jadwal Pelajaran Madrasah
              </h1>
              <p className="text-xs text-slate-500">
                Kelola jadwal mata pelajaran, jam pelajaran, dan guru pengampu per kelas
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Jadwal</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* CLASS SELECTION & DAY TABS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Pilih Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-emerald-600 cursor-pointer"
            >
              {db.settings.classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">
              ({classSchedules.length} sesi per minggu)
            </span>
          </div>

          {/* Quick info */}
          <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            Tahun Ajaran {db.settings.academicYear} • Semester {db.settings.semester}
          </div>
        </div>

        {/* Day of Week Tabs */}
        <div className="flex overflow-x-auto gap-1.5 border-b border-slate-200 pb-2">
          {DAYS.map((day) => {
            const isActive = activeDay === day;
            const count = classSchedules.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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

        {/* SCHEDULE LIST FOR ACTIVE DAY */}
        {daySchedules.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              Belum ada jadwal untuk hari {activeDay} di Kelas {selectedClass}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Silakan klik tombol "Tambah Jadwal" untuk memasukkan mata pelajaran dan jam pelajaran.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              + Tambah Jadwal {activeDay}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {daySchedules.map((item) => {
              const matchedSub = db.subjects.find((s) => s.id === item.subjectId);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Period & Time */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[11px]">
                        Jam Ke-{item.period}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {matchedSub?.category || 'Madrasah'}
                        </span>
                        {matchedSub?.code && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {matchedSub.code}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {item.subjectName}
                      </h4>
                    </div>

                    {/* Teacher & Room */}
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.teacherName}</span>
                      </div>
                      {item.room && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{item.room}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL WEEK PREVIEW TABLE */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Matriks Mingguan Kelas {selectedClass}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3 w-24">Hari</th>
                <th className="py-2.5 px-3">Daftar Mata Pelajaran & Jam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS.map((day) => {
                const itemsForDay = classSchedules
                  .filter((s) => s.day === day)
                  .sort((a, b) => a.period - b.period);

                return (
                  <tr key={day} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-emerald-900 align-top">
                      {day}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {itemsForDay.length} Sesi
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {itemsForDay.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">- Tidak ada sesi -</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {itemsForDay.map((item) => (
                            <div
                              key={item.id}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] flex items-center gap-1.5"
                            >
                              <span className="font-bold text-emerald-800">Jam {item.period}:</span>
                              <span className="font-semibold text-slate-800">{item.subjectName}</span>
                              <span className="text-slate-400 text-[10px] font-mono">
                                ({item.startTime}-{item.endTime})
                              </span>
                            </div>
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

      {/* MODAL ADD / EDIT SCHEDULE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingItem ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {/* Kelas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                    required
                  >
                    {db.settings.classes.map((c) => (
                      <option key={c} value={c}>
                        Kelas {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hari */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                    required
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jam Ke- */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke-</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-emerald-600"
                  required
                >
                  {db.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) - {sub.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru Pengampu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Guru Pengampu
                </label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Guru"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                  required
                />
              </div>

              {/* Ruang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruang / Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="Contoh: Ruang 4A, Musholla, Lab Komputer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title={`JADWAL PELAJARAN KELAS ${selectedClass}`}
        subtitle={`MI Nurul Falah | TA: ${db.settings.academicYear} (${db.settings.semester})`}
        className={selectedClass}
      >
        <div className="space-y-4">
          <div className="text-center font-bold text-sm text-slate-900 uppercase">
            JADWAL PELAJARAN KELAS {selectedClass} • TAHUN AJARAN {db.settings.academicYear}
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
              {DAYS.map((day) => {
                const items = classSchedules
                  .filter((s) => s.day === day)
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
                        Tidak ada jam pelajaran
                      </td>
                    </tr>
                  );
                }

                return items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50">
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
      </PrintModal>

      {/* CONFIRMATION DIALOG FOR DELETE */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Jadwal Pelajaran"
        message={`Apakah Anda yakin ingin menghapus jadwal:\n"${deleteTarget?.subjectName}" (Hari ${deleteTarget?.day}, Jam Ke-${deleteTarget?.period})?`}
        confirmLabel="Ya, Hapus Jadwal"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteScheduleItem(deleteTarget.id);
            setNotice(`Jadwal ${deleteTarget.subjectName} berhasil dihapus.`);
            setDeleteTarget(null);
            setTimeout(() => setNotice(null), 3000);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
