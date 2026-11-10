import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Calendar,
  AlertCircle,
  Printer,
  X,
  ExternalLink,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { LeavePermit } from '../../types';
import { formatDateIndonesian } from '../../utils/academic';
import { PrintModal } from '../common/PrintModal';

export const AdminPermits: React.FC = () => {
  const { db, approvePermit, rejectPermit } = useDatabase();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPermitForReview, setSelectedPermitForReview] = useState<LeavePermit | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState<string | null>(null);

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const filteredPermits = db.permits.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const pendingCount = db.permits.filter((p) => p.status === 'pending').length;

  const handleOpenReview = (permit: LeavePermit, action: 'approve' | 'reject') => {
    setSelectedPermitForReview(permit);
    setReviewAction(action);
    setReviewNote(
      action === 'approve'
        ? `Disetujui. Surat ${permit.type.toLowerCase()} telah diverifikasi oleh Madrasah.`
        : 'Permohonan ditolak karena alasan/lampiran belum memenuhi ketentuan.'
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermitForReview) return;

    if (reviewAction === 'approve') {
      approvePermit(
        selectedPermitForReview.id,
        'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
        reviewNote
      );
      alert('Surat izin disetujui! Kehadiran siswa otomatis diperbarui ke status ' + selectedPermitForReview.type + ' tanpa duplikasi.');
    } else {
      rejectPermit(
        selectedPermitForReview.id,
        'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
        reviewNote
      );
      alert('Surat izin ditolak dengan alasan yang telah dicatat.');
    }

    setSelectedPermitForReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Persetujuan Surat Izin & Surat Sakit
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs animate-pulse">
                {pendingCount} Perlu Ditinjau
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjau pengajuan surat izin/sakit dari wali murid. Persetujuan otomatis mengupdate presensi tanpa duplikasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Surat Izin</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Pengajuan ({db.permits.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Menunggu Persetujuan ({pendingCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Disetujui ({db.permits.filter((p) => p.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterStatus === 'rejected'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Ditolak ({db.permits.filter((p) => p.status === 'rejected').length})
        </button>
      </div>

      {/* Permits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPermits.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            Tidak ada pengajuan surat izin dengan status ini.
          </div>
        ) : (
          filteredPermits.map((permit) => {
            const student = db.students.find((s) => s.id === permit.studentId);
            const isPending = permit.status === 'pending';
            const isApproved = permit.status === 'approved';

            return (
              <div
                key={permit.id}
                className={`bg-white rounded-2xl p-5 border-2 transition shadow-xs flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-400 bg-amber-50/20'
                    : isApproved
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                }`}
              >
                <div>
                  {/* Top line status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          permit.type === 'Sakit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Surat {permit.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {permit.submittedAt.slice(0, 10)}
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

                  {/* Student details */}
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{student?.fullName}</h3>
                      <p className="text-xs text-slate-500">
                        Kelas {student?.className} • NIS: {student?.nis}
                      </p>
                    </div>
                    <img
                      src={student?.photoUrl || '/logo.png'}
                      alt={student?.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-200"
                    />
                  </div>

                  {/* Date range & reason */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Periode: {permit.startDate} s.d. {permit.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Alasan:</span>{' '}
                      <span className="text-slate-800">{permit.reason}</span>
                    </div>
                    {permit.notes && (
                      <div className="text-slate-500 italic text-[11px]">
                        Catatan wali: {permit.notes}
                      </div>
                    )}
                  </div>

                  {/* Doctor's note or attachment */}
                  {permit.attachmentUrl && (
                    <div className="mt-3">
                      <button
                        onClick={() => setIsPhotoPreviewOpen(permit.attachmentUrl || null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Lampiran Surat Dokter / Bukti</span>
                      </button>
                    </div>
                  )}

                  {/* Admin feedback note */}
                  {permit.adminNote && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-100 text-xs text-slate-700 border-l-4 border-emerald-600">
                      <span className="font-bold text-[11px] block text-slate-800">
                        Catatan Pengelola Madrasah:
                      </span>
                      <span>{permit.adminNote}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons (only if pending) */}
                {isPending && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => handleOpenReview(permit, 'approve')}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Setujui Permohonan</span>
                    </button>
                    <button
                      onClick={() => handleOpenReview(permit, 'reject')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* REVIEW CONFIRMATION MODAL */}
      {selectedPermitForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div
              className={`px-5 py-3.5 text-white flex justify-between items-center ${
                reviewAction === 'approve'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 border-b-2 border-amber-400'
                  : 'bg-rose-800'
              }`}
            >
              <h3 className="font-bold text-sm">
                {reviewAction === 'approve'
                  ? 'Konfirmasi Persetujuan Surat Izin'
                  : 'Konfirmasi Penolakan Surat Izin'}
              </h3>
              <button
                onClick={() => setSelectedPermitForReview(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Siswa Pemohon:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {db.students.find((s) => s.id === selectedPermitForReview.studentId)?.fullName}
                </div>
                <div className="text-[11px] text-emerald-800">
                  Jenis: Surat {selectedPermitForReview.type} ({selectedPermitForReview.startDate} s.d.{' '}
                  {selectedPermitForReview.endDate})
                </div>
              </div>

              {reviewAction === 'approve' ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Sistem otomatis memasukkan status <strong>{selectedPermitForReview.type}</strong> ke daftar presensi
                    siswa untuk seluruh tanggal ({selectedPermitForReview.startDate} s.d.{' '}
                    {selectedPermitForReview.endDate}). Dijamin tidak ada absensi ganda.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Pengajuan akan ditolak. Absensi siswa tidak akan diubah. Berikan alasan penolakan yang jelas untuk wali murid.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Persetujuan Madrasah *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedPermitForReview(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {reviewAction === 'approve' ? 'Setujui & Perbarui Absensi' : 'Tolak Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      {isPhotoPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="max-w-xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 relative shadow-2xl">
            <button
              onClick={() => setIsPhotoPreviewOpen(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={isPhotoPreviewOpen}
              alt="Lampiran Surat Dokter"
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs text-slate-600 font-medium">
              Lampiran Dokumen Surat Dokter / Keterangan Wali Murid
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL: LAPORAN PERIZINAN */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="REKAPITULASI PENGAJUAN SURAT IZIN & SAKIT"
        subtitle={`MI Nurul Falah | Status: ${filterStatus.toUpperCase()} | Total: ${filteredPermits.length} Pengajuan`}
      >
        <div className="space-y-4 text-xs">
          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Tanggal Pengajuan</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Kelas</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Jenis Izin</th>
                <th className="border border-slate-800 py-1.5 px-2">Rentang Tanggal</th>
                <th className="border border-slate-800 py-1.5 px-2">Alasan</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermits.map((p, idx) => {
                const s = db.students.find((st) => st.id === p.studentId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono">
                      {p.submittedAt.slice(0, 10)}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2 font-semibold">{s?.fullName || '-'}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center">{s?.className || '-'}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">{p.type}</td>
                    <td className="border border-slate-800 py-1.5 px-2 font-mono text-[10px]">
                      {p.startDate} s.d. {p.endDate}
                    </td>
                    <td className="border border-slate-800 py-1.5 px-2">{p.reason}</td>
                    <td className="border border-slate-800 py-1.5 px-2 text-center font-bold">
                      {p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
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
