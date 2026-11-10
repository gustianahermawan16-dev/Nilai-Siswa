import React, { useState } from 'react';
import {
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Printer,
  Search,
  Filter,
  Wallet,
  Calendar,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { SavingsTransaction } from '../../types';
import { calculateSavingsBalance, formatDateIndonesian, formatRupiah } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminSavings: React.FC = () => {
  const { db, addSavingsTransaction, deleteSavingsTransaction } = useDatabase();

  const [deleteTxTarget, setDeleteTxTarget] = useState<{ id: string; desc: string } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txStudentId, setTxStudentId] = useState('');
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [txAmount, setTxAmount] = useState<number>(50000);
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNotes, setTxNotes] = useState('Tabungan rutin mingguan');

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const activeStudents = db.students.filter(
    (s) => s.status === 'aktif' && (selectedClass === 'all' || s.className === selectedClass)
  );

  const overallBalance = calculateSavingsBalance(db.savings);

  // Filtered transactions
  const filteredTransactions = db.savings.filter((tx) => {
    const student = db.students.find((s) => s.id === tx.studentId);
    if (!student) return false;
    const matchClass = selectedClass === 'all' || student.className === selectedClass;
    const matchStudent = selectedStudentId === 'all' || tx.studentId === selectedStudentId;
    const matchSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStudent && matchSearch;
  });

  const openAddModal = (studentId?: string, type: 'in' | 'out' = 'in') => {
    setTxStudentId(studentId || activeStudents[0]?.id || db.students[0]?.id || '');
    setTxType(type);
    setTxAmount(50000);
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxNotes(type === 'in' ? 'Setoran tabungan sukarela' : 'Penarikan keperluan sekolah');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txStudentId || txAmount <= 0) {
      alert('Mohon pilih siswa dan nominal transaksi valid (lebih dari 0).');
      return;
    }

    // Cek saldo jika penarikan
    if (txType === 'out') {
      const studentTxs = db.savings.filter((s) => s.studentId === txStudentId);
      const studentBal = calculateSavingsBalance(studentTxs).balance;
      if (txAmount > studentBal) {
        alert(
          `Saldo siswa tidak mencukupi untuk penarikan ini! Saldo saat ini: ${formatRupiah(studentBal)}.`
        );
        return;
      }
    }

    addSavingsTransaction({
      studentId: txStudentId,
      type: txType,
      amount: Number(txAmount),
      date: txDate,
      notes: txNotes,
      recordedBy: 'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
    });

    setIsModalOpen(false);
  };

  const selectedStudentObj = db.students.find((s) => s.id === selectedStudentId);
  const selectedStudentBalance = selectedStudentId !== 'all'
    ? calculateSavingsBalance(db.savings.filter((t) => t.studentId === selectedStudentId))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengelolaan Tabungan Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catat transaksi setoran uang masuk dan penarikan uang keluar dengan perhitungan saldo otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Buku / Rekap Tabungan</span>
          </button>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Tabungan</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-700 text-white p-5 rounded-2xl shadow-md border-b-4 border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Total Saldo Seluruh Siswa
            </span>
            <Wallet className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2">
            {formatRupiah(overallBalance.balance)}
          </div>
          <p className="text-[11px] text-emerald-100 mt-1">Saldo Kas Nyata MI Nurul Falah</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Uang Masuk (Setoran)
            </span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatRupiah(overallBalance.totalIn)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh setoran siswa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Uang Keluar (Penarikan)
            </span>
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            {formatRupiah(overallBalance.totalOut)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi penarikan keperluan siswa</p>
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
            placeholder="Cari transaksi atau nama siswa..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kelas:</span>
          </div>
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

      {/* If specific student selected, show personalized balance banner */}
      {selectedStudentObj && selectedStudentBalance && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Buku Tabungan Siswa:
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {selectedStudentObj.fullName} — Kelas {selectedStudentObj.className} (NIS: {selectedStudentObj.nis})
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Total Masuk: {formatRupiah(selectedStudentBalance.totalIn)} | Total Keluar: {formatRupiah(selectedStudentBalance.totalOut)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-semibold block">Saldo Saat Ini:</span>
            <span className="text-2xl font-black text-emerald-800">
              {formatRupiah(selectedStudentBalance.balance)}
            </span>
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Riwayat Mutasi Transaksi Tabungan</h3>
          <span className="text-xs text-slate-500 font-medium">
            {filteredTransactions.length} Transaksi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Nama Siswa & Kelas</th>
                <th className="py-2.5 px-4 text-center">Jenis Mutasi</th>
                <th className="py-2.5 px-4 text-right">Nominal</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-4">Pencatat</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada riwayat transaksi tabungan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const student = db.students.find((s) => s.id === tx.studentId);
                  const isDeposit = tx.type === 'in';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-600">{tx.date}</td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student?.fullName || '-'}</div>
                        <div className="text-[10px] text-slate-500">Kelas {student?.className}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isDeposit ? 'Setoran (Masuk)' : 'Penarikan (Keluar)'}</span>
                        </span>
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-black text-sm ${
                          isDeposit ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">{tx.notes}</td>

                      <td className="py-3 px-4 text-[10px] text-slate-500">{tx.recordedBy}</td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setDeleteTxTarget({
                              id: tx.id,
                              desc: `${tx.type === 'in' ? 'Setoran' : 'Penarikan'} ${formatRupiah(tx.amount)} (${tx.date}) untuk ${student?.fullName || 'siswa'}`,
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Transaksi"
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

      {/* TRANSACTION INPUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">Catat Transaksi Tabungan Siswa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={txStudentId}
                  onChange={(e) => setTxStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis}) — Kelas {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('in')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      txType === 'in'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Uang Masuk (Setoran)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('out')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      txType === 'out'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Uang Keluar (Penarikan)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Contoh: Setoran tabungan mingguan..."
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
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: LAPORAN TABUNGAN */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="LAPORAN REKAPITULASI TABUNGAN SISWA"
        subtitle={`MI Nurul Falah | Kelas: ${selectedClass === 'all' ? 'Seluruh Kelas' : selectedClass}`}
        studentName={selectedStudentObj?.fullName}
        className={selectedStudentObj?.className || selectedClass}
        nisn={selectedStudentObj?.nisn}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-900">Total Transaksi Mutasi:</p>
              <p className="text-slate-600 text-[11px]">{filteredTransactions.length} transaksi</p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-[11px]">Saldo Akhir Kas Tabungan:</p>
              <p className="text-base font-black text-emerald-800">
                {selectedStudentBalance
                  ? formatRupiah(selectedStudentBalance.balance)
                  : formatRupiah(overallBalance.balance)}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Tanggal</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Jenis</th>
                <th className="border border-slate-800 py-1.5 px-2 text-right">Uang Masuk</th>
                <th className="border border-slate-800 py-1.5 px-2 text-right">Uang Keluar</th>
                <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, idx) => {
                const st = db.students.find((s) => s.id === tx.studentId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">{tx.date}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">{st?.fullName || '-'}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">
                      {tx.type === 'in' ? 'Setoran' : 'Tarik'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-semibold">
                      {tx.type === 'in' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 text-right font-semibold text-rose-700">
                      {tx.type === 'out' ? formatRupiah(tx.amount) : '-'}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{tx.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTxTarget}
        title="Hapus Transaksi Tabungan"
        message={`Apakah Anda yakin ingin menghapus transaksi tabungan:\n"${deleteTxTarget?.desc}"?\n\nSaldo siswa akan otomatis terkalkulasi ulang.`}
        confirmLabel="Ya, Hapus Transaksi"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteTxTarget) {
            deleteSavingsTransaction(deleteTxTarget.id);
            setDeleteTxTarget(null);
          }
        }}
        onCancel={() => setDeleteTxTarget(null)}
      />
    </div>
  );
};
