import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  Archive,
  CreditCard,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { AdditionalFee } from '../../types';
import { formatRupiah } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminFees: React.FC = () => {
  const { db, addFee, updateFee, deleteFee, recordFeePayment } = useDatabase();

  const [deleteFeeTarget, setDeleteFeeTarget] = useState<AdditionalFee | null>(null);
  const [selectedFeeId, setSelectedFeeId] = useState<string>(db.fees[0]?.id || '');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<AdditionalFee | null>(null);

  // Form state
  const [feeTitle, setFeeTitle] = useState('');
  const [feeDesc, setFeeDesc] = useState('');
  const [feeAmount, setFeeAmount] = useState<number>(50000);
  const [feeDueDate, setFeeDueDate] = useState('');
  const [feeTargetType, setFeeTargetType] = useState<'all' | 'class'>('all');
  const [feeTargetClass, setFeeTargetClass] = useState('4A');
  const [feeIsActive, setFeeIsActive] = useState(true);

  // Payment Recording Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payStatus, setPayStatus] = useState<'Lunas' | 'Sebagian' | 'Belum Lunas'>('Lunas');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('Diterima tunai oleh Wali Kelas');

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const activeFee = db.fees.find((f) => f.id === selectedFeeId) || db.fees[0];

  // Eligible students for the active fee
  const eligibleStudents = db.students.filter((s) => {
    if (!activeFee) return true;
    if (activeFee.targetType === 'all') return true;
    if (activeFee.targetType === 'class') return s.className === activeFee.targetClass;
    return true;
  });

  const openAddFee = () => {
    setEditingFee(null);
    setFeeTitle('');
    setFeeDesc('');
    setFeeAmount(50000);
    setFeeDueDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setFeeTargetType('all');
    setFeeTargetClass('4A');
    setFeeIsActive(true);
    setIsFeeModalOpen(true);
  };

  const openEditFee = (fee: AdditionalFee) => {
    setEditingFee(fee);
    setFeeTitle(fee.title);
    setFeeDesc(fee.description);
    setFeeAmount(fee.amount);
    setFeeDueDate(fee.dueDate);
    setFeeTargetType(fee.targetType === 'class' ? 'class' : 'all');
    setFeeTargetClass(fee.targetClass || '4A');
    setFeeIsActive(fee.isActive);
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeTitle.trim() || feeAmount <= 0) {
      alert('Judul dan nominal iuran wajib diisi.');
      return;
    }

    if (editingFee) {
      updateFee(editingFee.id, {
        title: feeTitle,
        description: feeDesc,
        amount: Number(feeAmount),
        dueDate: feeDueDate,
        targetType: feeTargetType,
        targetClass: feeTargetType === 'class' ? feeTargetClass : undefined,
        isActive: feeIsActive,
      });
    } else {
      const created = addFee({
        title: feeTitle,
        description: feeDesc,
        amount: Number(feeAmount),
        dueDate: feeDueDate,
        targetType: feeTargetType,
        targetClass: feeTargetType === 'class' ? feeTargetClass : undefined,
        isActive: feeIsActive,
      });
      setSelectedFeeId(created.id);
    }
    setIsFeeModalOpen(false);
  };

  const openRecordPayment = (studentId: string) => {
    if (!activeFee) return;
    setPayStudentId(studentId);
    const existing = db.feePayments.find(
      (fp) => fp.feeId === activeFee.id && fp.studentId === studentId
    );
    if (existing) {
      setPayAmount(existing.paidAmount);
      setPayStatus(existing.status);
      setPayDate(existing.paidDate || new Date().toISOString().slice(0, 10));
      setPayNotes(existing.notes || '');
    } else {
      setPayAmount(activeFee.amount);
      setPayStatus('Lunas');
      setPayDate(new Date().toISOString().slice(0, 10));
      setPayNotes('Diterima tunai oleh Wali Kelas');
    }
    setIsPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFee || !payStudentId) return;

    recordFeePayment({
      feeId: activeFee.id,
      feeTitleSnapshot: activeFee.title,
      feeAmountSnapshot: activeFee.amount,
      studentId: payStudentId,
      paidAmount: Number(payAmount),
      status: Number(payAmount) >= activeFee.amount ? 'Lunas' : payAmount > 0 ? 'Sebagian' : 'Belum Lunas',
      paidDate: payDate,
      notes: payNotes,
      recordedBy: 'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
    });

    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Iuran Tambahan & Kegiatan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat pos iuran baru (kegiatan, perlengkapan seragam, iuran mendadak) dan catat pembayaran siswa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan Iuran</span>
          </button>
          <button
            onClick={openAddFee}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Iuran Baru</span>
          </button>
        </div>
      </div>

      {/* Fees Selector & Active Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: List of all Fees */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Daftar Pos Iuran ({db.fees.length})
          </h3>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {db.fees.map((fee) => {
              const isSelected = fee.id === (activeFee?.id || '');
              return (
                <div
                  key={fee.id}
                  onClick={() => setSelectedFeeId(fee.id)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fee.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {fee.isActive ? 'Aktif' : 'Selesai / Nonaktif'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Batas: {fee.dueDate}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{fee.title}</h4>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                    <span className="font-black text-sm text-emerald-800">{formatRupiah(fee.amount)}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {fee.targetType === 'all' ? 'Seluruh Siswa' : `Kelas ${fee.targetClass}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Fee Detail & Payment Status Table */}
        <div className="lg:col-span-2 space-y-4">
          {activeFee ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{activeFee.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeFee.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {activeFee.isActive ? 'Aktif' : 'Arsip'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{activeFee.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Nominal: <strong className="text-emerald-800">{formatRupiah(activeFee.amount)}</strong></span>
                    <span>•</span>
                    <span>Batas Pembayaran: <strong>{activeFee.dueDate}</strong></span>
                    <span>•</span>
                    <span>Target: <strong>{activeFee.targetType === 'all' ? 'Seluruh Siswa' : 'Kelas ' + activeFee.targetClass}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditFee(activeFee)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition"
                    title="Edit Iuran"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteFeeTarget(activeFee);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition cursor-pointer"
                    title="Hapus Iuran (Arsip tetap aman)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Payment Status Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
                  Status Pembayaran Siswa:
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3 text-right">Sudah Dibayar</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3">Tanggal Bayar</th>
                        <th className="py-2 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eligibleStudents.map((student) => {
                        const payment = db.feePayments.find(
                          (fp) => fp.feeId === activeFee.id && fp.studentId === student.id
                        );
                        const isLunas = payment?.status === 'Lunas';
                        const isSebagian = payment?.status === 'Sebagian';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {student.fullName}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">
                              {student.className}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {formatRupiah(payment?.paidAmount || 0)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isLunas
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isSebagian
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {payment?.status || 'Belum Lunas'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {payment?.paidDate || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => openRecordPayment(student.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shadow-xs cursor-pointer"
                              >
                                {payment ? 'Update Bayar' : 'Catat Bayar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Belum ada iuran yang dibuat. Klik tombol "Buat Iuran Baru" di atas.
            </div>
          )}
        </div>
      </div>

      {/* MODAL BUAT / EDIT IURAN */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">
                {editingFee ? 'Edit Data Iuran' : 'Buat Iuran Tambahan Baru'}
              </h3>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Judul Iuran *</label>
                <input
                  type="text"
                  required
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  placeholder="Contoh: Iuran Outing Class / Seragam Batik"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Peruntukan</label>
                <textarea
                  rows={2}
                  value={feeDesc}
                  onChange={(e) => setFeeDesc(e.target.value)}
                  placeholder="Keterangan rincian iuran..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Iuran (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Siswa</label>
                  <select
                    value={feeTargetType}
                    onChange={(e) => setFeeTargetType(e.target.value as 'all' | 'class')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">Seluruh Siswa</option>
                    <option value="class">Khusus Kelas Tertentu</option>
                  </select>
                </div>

                {feeTargetType === 'class' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Kelas Target</label>
                    <select
                      value={feeTargetClass}
                      onChange={(e) => setFeeTargetClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {db.settings.classes.map((c) => (
                        <option key={c} value={c}>
                          Kelas {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Status Iuran Aktif</span>
                  <span className="text-[10px] text-slate-500">Iuran tampil di aplikasi wali murid</span>
                </div>
                <input
                  type="checkbox"
                  checked={feeIsActive}
                  onChange={(e) => setFeeIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan Iuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATAT PEMBAYARAN IURAN */}
      {isPayModalOpen && activeFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">Catat Pembayaran Iuran</h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Iuran & Siswa:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {db.students.find((s) => s.id === payStudentId)?.fullName}
                </div>
                <div className="text-[11px] text-emerald-800">
                  {activeFee.title} (Tagihan: {formatRupiah(activeFee.amount)})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal yang Dibayar (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Bukti Bayar</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Misal: Diterima tunai oleh Wali Kelas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan Status Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: LAPORAN IURAN */}
      {activeFee && (
        <PrintModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="LAPORAN REKAPITULASI PEMBAYARAN IURAN"
          subtitle={`Kegiatan: ${activeFee.title} | Nominal: ${formatRupiah(activeFee.amount)}`}
        >
          <div className="space-y-4 text-xs">
            <table className="w-full border-collapse border border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                  <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Kelas</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-right">Sudah Dibayar</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-center">Status</th>
                  <th className="border border-slate-800 py-1.5 px-2">Tanggal Bayar</th>
                  <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {eligibleStudents.map((s, idx) => {
                  const p = db.feePayments.find(
                    (fp) => fp.feeId === activeFee.id && fp.studentId === s.id
                  );
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-800 py-1.5 px-2 font-semibold">{s.fullName}</td>
                      <td className="border border-slate-800 py-1.5 px-2 text-center">{s.className}</td>
                      <td className="border border-slate-800 py-1.5 px-2 text-right font-bold">
                        {formatRupiah(p?.paidAmount || 0)}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                        {p?.status || 'Belum Lunas'}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2 font-mono text-[10px]">
                        {p?.paidDate || '-'}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2">{p?.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}

      {/* Delete Fee Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteFeeTarget}
        title="Hapus Iuran Tambahan"
        message={`Apakah Anda yakin ingin menghapus iuran "${deleteFeeTarget?.title}"?\n\nPERHATIAN: Riwayat pembayaran yang sudah dicatat oleh wali murid akan tetap tersimpan di dalam arsip database.`}
        confirmLabel="Ya, Hapus Iuran"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteFeeTarget) {
            deleteFee(deleteFeeTarget.id);
            setDeleteFeeTarget(null);
          }
        }}
        onCancel={() => setDeleteFeeTarget(null)}
      />
    </div>
  );
};
