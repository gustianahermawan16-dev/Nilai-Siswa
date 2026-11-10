import React, { useState } from 'react';
import { Bell, Plus, Trash2, Edit3, Camera, Calendar, Users, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Announcement } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminAnnouncements: React.FC = () => {
  const { db, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useDatabase();

  const [deleteAnnTarget, setDeleteAnnTarget] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetType, setTargetType] = useState<'all' | 'class'>('all');
  const [targetClass, setTargetClass] = useState('4A');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const openAdd = () => {
    setEditingAnn(null);
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().slice(0, 10));
    setTargetType('all');
    setTargetClass('4A');
    setAttachmentUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setDate(ann.date);
    setTargetType(ann.targetType);
    setTargetClass(ann.targetClass || '4A');
    setAttachmentUrl(ann.attachmentUrl || '');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachmentUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    if (editingAnn) {
      updateAnnouncement(editingAnn.id, {
        title,
        content,
        date,
        targetType,
        targetClass: targetType === 'class' ? targetClass : undefined,
        attachmentUrl: attachmentUrl || undefined,
      });
    } else {
      addAnnouncement({
        title,
        content,
        date,
        targetType,
        targetClass: targetType === 'class' ? targetClass : undefined,
        attachmentUrl: attachmentUrl || undefined,
        author: 'Ustadz Gustiana Hermawan, S.Pd. (Admin)',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengumuman & Informasi Madrasah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan pengumuman penting yang akan tampil langsung di dasbor wali murid.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {db.announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {ann.targetType === 'all' ? 'Seluruh Siswa & Wali' : `Khusus Kelas ${ann.targetClass}`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{ann.date}</span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mt-2.5">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                {ann.content}
              </p>

              {ann.attachmentUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-h-48">
                  <img
                    src={ann.attachmentUrl}
                    alt={ann.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Oleh: {ann.author}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(ann)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                  title="Edit Pengumuman"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDeleteAnnTarget(ann);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-sm">
                {editingAnn ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Ujian Madrasah atau Kegiatan Maulid"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Pembaca</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as 'all' | 'class')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">Seluruh Siswa & Wali</option>
                    <option value="class">Khusus Kelas Tertentu</option>
                  </select>
                </div>

                {targetType === 'class' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Kelas</label>
                    <select
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {db.settings.classes.map((c) => (
                        <option key={c} value={c}>
                          Kelas {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Pengumuman</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Pengumuman *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman atau instruksi untuk wali murid..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Foto / Pamflet Lampiran (Opsional)
                </label>
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span className="text-slate-600">Pilih gambar lampiran dari perangkat...</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {attachmentUrl && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={attachmentUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                  </div>
                )}
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
                  Publikasikan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteAnnTarget}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteAnnTarget?.title}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteAnnTarget) {
            deleteAnnouncement(deleteAnnTarget.id);
            setDeleteAnnTarget(null);
          }
        }}
        onCancel={() => setDeleteAnnTarget(null)}
      />
    </div>
  );
};
