import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Trash2,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Coins,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { MonthlyInfak } from '../../types';
import { calculateTotalInfak, formatDateIndonesian, formatRupiah } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const MONTH_NAMES = [
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
];

export const AdminInfak: React.FC = () => {
  const { db, addMonthlyInfak, deleteMonthlyInfak } = useDatabase();

  const [deleteInfakTarget, setDeleteInfakTarget] = useState<{ id: string; desc: string } | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infStudentId, setInfStudentId] = useState('');
  const [infMonth, setInfMonth] = useState('September');
  const [infYear, setInfYear] = useState<number>(2024);
  const [infDate, setInfDate] = useState(new Date().toISOString().slice(0, 10));
  const [infAmount, setInfAmount] = useState<number>(25000);
  const [infNotes, setInfNotes] = useState('Infak rutin madrasah');

  // Print Modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const activeStudents = db.students.filter(
    (s) => s.status === 'aktif' && (selectedClass === 'all' || s.className === selectedClass)
  );

  const totalInfakSum = calculateTotalInfak(db.infak);

  const filteredInfak = db.infak.filter((inf) => {
    const student = db.students.find((s) => s.id === inf.studentId);
    if (!student) return false;
    const matchClass = selectedClass === 'all' || student.className === selectedClass;
    const matchStudent = selectedStudentId === 'all' || inf.studentId === selectedStudentId;
    const matchMonth = selectedMonth === 'all' || inf.month === selectedMonth;
    const matchSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inf.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStudent && matchMonth && matchSearch;
  });

  const openAddModal = () => {
    setInfStudentId(activeStudents[0]?.id || db.students[0]?.id || '');
    setInfMonth('September');
    setInfYear(2024);
    setInfDate(new Date().toISOString().slice(0, 10));
    setInfAmount(25000);
    setInfNotes('Infak rutin madrasah');
    setIsModalOpen(true);
  };

  const handleSaveInfak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infStudentId || infAmount <= 0) {
      alert('Mohon pilih siswa dan masukkan nominal infak valid.');
      return;
    }

    addMonthlyInfak({
      studentId: infStudentId,
      month: infMonth,
      year: Number(infYear),
      paymentDate: infDate,
      amount: Number(infAmount),
      notes: infNotes,
      recordedBy: 'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Infak Bulanan Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan dana infak bulanan dan sedekah pengembangan kegiatan dakwah & sarana MI Nurul Falah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan Infak</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pembayaran Infak</span>
          </button>
        </div>
      </div>

      {/* Banner Total Infak */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-emerald-700">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/40 text-amber-100 text-xs font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Dana Keberkahan Madrasah</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            {formatRupiah(totalInfakSum)}
          </h3>
          <p className="text-xs text-amber-100 mt-0.5">
            Akumulasi seluruh infak bulanan siswa yang telah dibayarkan
          </p>
        </div>
        <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-400/40 text-xs space-y-1">
          <div>
            <span className="text-amber-200">Total Transaksi Infak:</span>{' '}
            <strong className="text-white">{db.infak.length} kali</strong>
          </div>
          <div>
            <span className="text-amber-200">Rata-rata per Siswa:</span>{' '}
            <strong className="text-white">
              {formatRupiah(db.students.length > 0 ? totalInfakSum / db.students.length : 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau keterangan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Bulan</option>
            {MONTH_NAMES.map((m) => (
              <option key={m} value={m}>
                Bulan {m}
              </option>
            ))}
          </select>

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 max-w-xs truncate"
          >
            <option value="all">Semua Siswa</option>
            {activeStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.className})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Infak Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Riwayat Pembayaran Infak Siswa</h3>
          <span className="text-xs text-slate-500 font-medium">
            {filteredInfak.length} Pembayaran Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-2.5 px-4">Tanggal Bayar</th>
                <th className="py-2.5 px-4">Nama Siswa</th>
                <th className="py-2.5 px-4">Kelas</th>
                <th className="py-2.5 px-4">Periode Bulan</th>
                <th className="py-2.5 px-4 text-right">Nominal Infak</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInfak.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data pembayaran infak untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredInfak.map((inf) => {
                  const student = db.students.find((s) => s.id === inf.studentId);

                  return (
                    <tr key={inf.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-600">{inf.paymentDate}</td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student?.fullName || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {student?.nis}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {student?.className || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          {inf.month} {inf.year}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-sm text-emerald-800">
                        {formatRupiah(inf.amount)}
                      </td>

                      <td className="py-3 px-4 text-slate-600">{inf.notes || '-'}</td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setDeleteInfakTarget({
                              id: inf.id,
                              desc: `Infak ${inf.month} ${inf.year} (${formatRupiah(inf.amount)}) untuk ${student?.fullName || 'siswa'}`,
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Catatan Infak"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INPUT INFAK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">Catat Pembayaran Infak Bulanan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInfak} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={infStudentId}
                  onChange={(e) => setInfStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis}) — Kelas {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bulan Infak *</label>
                  <select
                    value={infMonth}
                    onChange={(e) => setInfMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun *</label>
                  <input
                    type="number"
                    required
                    value={infYear}
                    onChange={(e) => setInfYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Infak (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={infAmount}
                    onChange={(e) => setInfAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={infDate}
                    onChange={(e) => setInfDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Alokasi Infak</label>
                <input
                  type="text"
                  value={infNotes}
                  onChange={(e) => setInfNotes(e.target.value)}
                  placeholder="Misal: Infak rutin bulanan / sedekah pembangunan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Simpan Pembayaran Infak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: LAPORAN INFAK */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="LAPORAN REKAPITULASI INFAK SISWA"
        subtitle={`Filter: ${selectedClass === 'all' ? 'Seluruh Kelas' : 'Kelas ' + selectedClass} | Total Terkumpul: ${formatRupiah(totalInfakSum)}`}
        className={selectedClass === 'all' ? 'Semua Kelas' : selectedClass}
      >
        <div className="space-y-4 text-xs">
          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Tanggal</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Kelas</th>
                <th className="border border-slate-800 py-1.5 px-2">Bulan Infak</th>
                <th className="border border-slate-800 py-1.5 px-2 text-right">Nominal</th>
                <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredInfak.map((inf, idx) => {
                const s = db.students.find((st) => st.id === inf.studentId);
                return (
                  <tr key={inf.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">{inf.paymentDate}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">{s?.fullName || '-'}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{s?.className || '-'}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-medium">
                      {inf.month} {inf.year}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-bold text-emerald-800">
                      {formatRupiah(inf.amount)}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{inf.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteInfakTarget}
        title="Hapus Catatan Infak"
        message={`Apakah Anda yakin ingin menghapus catatan infak:\n"${deleteInfakTarget?.desc}"?\n\nTotal infak santri akan diperbarui otomatis.`}
        confirmLabel="Ya, Hapus Infak"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteInfakTarget) {
            deleteMonthlyInfak(deleteInfakTarget.id);
            setDeleteInfakTarget(null);
          }
        }}
        onCancel={() => setDeleteInfakTarget(null)}
      />
    </div>
  );
};
