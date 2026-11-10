import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Key,
  Camera,
  Printer,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  X,
  UserCheck,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Student } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminStudents: React.FC = () => {
  const { db, addStudent, updateStudent, deleteStudent, createWaliAccount } = useDatabase();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [className, setClassName] = useState('4A');
  const [homeroomTeacher, setHomeroomTeacher] = useState('Ustadz Gustiana Hermawan, S.Pd.');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Wali Account Creation Modal
  const [accountModalStudent, setAccountModalStudent] = useState<Student | null>(null);
  const [accountFullName, setAccountFullName] = useState('');
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('wali123');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountNotice, setAccountNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const resetForm = () => {
    setEditingStudent(null);
    setNis(`212204${Math.floor(10 + Math.random() * 89)}`);
    setNisn(`01345${Math.floor(10000 + Math.random() * 89999)}`);
    setFullName('');
    setGender('L');
    setClassName(db.settings.classes[0] || '4A');
    setHomeroomTeacher('Ustadz Gustiana Hermawan, S.Pd.');
    setBirthPlace('Bandung');
    setBirthDate('2014-05-15');
    setParentName('');
    setParentPhone('');
    setAddress('');
    setPhotoUrl('');
    setStatus('aktif');
  };

  const openAddModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setNis(s.nis);
    setNisn(s.nisn);
    setFullName(s.fullName);
    setGender(s.gender);
    setClassName(s.className);
    setHomeroomTeacher(s.homeroomTeacher);
    setBirthPlace(s.birthPlace);
    setBirthDate(s.birthDate);
    setParentName(s.parentName);
    setParentPhone(s.parentPhone);
    setAddress(s.address);
    setPhotoUrl(s.photoUrl || '');
    setStatus(s.status);
    setIsFormOpen(true);
  };

  // Upload foto siswa dari galeri HP / komputer via FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file foto maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nis.trim() || !nisn.trim()) {
      alert('Nama lengkap, NIS, dan NISN wajib diisi.');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        nis,
        nisn,
        fullName,
        gender,
        className,
        homeroomTeacher,
        birthPlace,
        birthDate,
        parentName,
        parentPhone,
        address,
        photoUrl,
        status,
      });
    } else {
      addStudent({
        nis,
        nisn,
        fullName,
        gender,
        className,
        homeroomTeacher,
        academicYear: db.settings.academicYear,
        birthPlace,
        birthDate,
        parentName,
        parentPhone,
        address,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300',
        status,
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  // Create Wali Murid Account
  const openWaliAccountModal = (s: Student) => {
    setAccountModalStudent(s);
    setAccountFullName(s.parentName || `Wali dari ${s.fullName}`);
    const generatedUsername = `wali.${s.fullName.toLowerCase().split(' ')[0]}.${s.nis.slice(-3)}`;
    setAccountUsername(generatedUsername);
    setAccountPassword('wali123');
    setAccountPhone(s.parentPhone || '');
    setAccountNotice(null);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountModalStudent) return;
    const res = createWaliAccount({
      studentId: accountModalStudent.id,
      fullName: accountFullName,
      username: accountUsername,
      password: accountPassword,
      phone: accountPhone,
    });
    if (res.success) {
      setAccountNotice({ type: 'success', text: 'Akun wali murid berhasil dibuat! Username: ' + accountUsername });
      setTimeout(() => {
        setAccountModalStudent(null);
      }, 1500);
    } else {
      setAccountNotice({ type: 'error', text: res.message || 'Gagal membuat akun.' });
    }
  };

  // Filtered Students
  const filteredStudents = db.students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    const matchesClass = selectedClass === 'all' || s.className === selectedClass;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Siswa & Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data murid, atur wali kelas, unggah foto dari perangkat, dan buat akun akses wali murid.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Siswa</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
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
            placeholder="Cari nama siswa, NIS, atau NISN..."
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
            <option value="all">Semua Kelas ({db.students.length})</option>
            {db.settings.classes.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-aktif</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Foto & Siswa</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Kelas & Wali Kelas</th>
                <th className="py-3 px-4">Wali Murid & Kontak</th>
                <th className="py-3 px-4">Status Akun Wali</th>
                <th className="py-3 px-4">Status Siswa</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const waliAccount = db.users.find(
                    (u) => u.role === 'wali_murid' && u.studentId === student.id
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photoUrl || '/logo.png'}
                            alt={student.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{student.fullName}</div>
                            <div className="text-[10px] text-slate-500">
                              {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {student.birthPlace},{' '}
                              {student.birthDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-800 font-semibold">{student.nis}</div>
                        <div className="text-[10px] text-slate-400">NISN: {student.nisn}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          Kelas {student.className}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                          {student.homeroomTeacher}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{student.parentName || '-'}</div>
                        <div className="text-[10px] text-slate-500">{student.parentPhone || '-'}</div>
                      </td>

                      <td className="py-3 px-4">
                        {waliAccount ? (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="font-mono text-[11px] font-semibold">
                              {waliAccount.username}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openWaliAccountModal(student)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition cursor-pointer"
                          >
                            <Key className="w-3 h-3" />
                            <span>Buat Akun Wali</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {student.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.fullName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT SISWA */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 overflow-hidden my-6">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Photo Upload Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-white flex-shrink-0 shadow-xs relative">
                  <img
                    src={photoUrl || '/logo.png'}
                    alt="Pratinjau Foto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="font-bold text-slate-800 block text-xs">
                    Unggah Foto Siswa (Dari Galeri HP / Komputer)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Gunakan foto formal berseragam madrasah. Format JPG, PNG, atau WEBP.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer text-xs shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Pilih Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN (Nasional) *</label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {db.settings.classes.map((c) => (
                      <option key={c} value={c}>
                        Kelas {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wali Kelas</label>
                  <input
                    type="text"
                    value={homeroomTeacher}
                    onChange={(e) => setHomeroomTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Contoh: Bpk. Gunawan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP Wali</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Domisili Siswa</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap RT/RW, Desa, Kecamatan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Keaktifan Siswa</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="aktif">Aktif Mengikuti Pembelajaran</option>
                  <option value="nonaktif">Non-aktif / Pindah</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PEMBUATAN AKUN WALI MURID */}
      {accountModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex justify-between items-center border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">Buat Akun Login Wali Murid</h3>
              </div>
              <button
                onClick={() => setAccountModalStudent(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold block">Siswa Terhubung:</span>
                <div>{accountModalStudent.fullName} (Kelas {accountModalStudent.className})</div>
                <div className="text-[10px] text-emerald-700">NIS: {accountModalStudent.nis}</div>
              </div>

              {accountNotice && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    accountNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {accountNotice.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{accountNotice.text}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Wali</label>
                <input
                  type="text"
                  required
                  value={accountFullName}
                  onChange={(e) => setAccountFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login Wali *</label>
                <input
                  type="text"
                  required
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
                <span className="text-[10px] text-slate-400">Contoh: wali.ahmad</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Awal *</label>
                <input
                  type="text"
                  required
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kontak WhatsApp Wali</label>
                <input
                  type="text"
                  value={accountPhone}
                  onChange={(e) => setAccountPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAccountModalStudent(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Aktifkan Akun Wali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: DATA SISWA */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="BUKU INDUK & REKAP DATA SISWA"
        subtitle={`Filter: ${selectedClass === 'all' ? 'Seluruh Kelas' : 'Kelas ' + selectedClass} | Tahun Pelajaran ${db.settings.academicYear}`}
        className={selectedClass === 'all' ? 'Semua Kelas' : selectedClass}
      >
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse border border-slate-800 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="border border-slate-800 py-1.5 px-2 text-center w-8">No</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">L/P</th>
                <th className="border border-slate-800 py-1.5 px-2">NIS / NISN</th>
                <th className="border border-slate-800 py-1.5 px-2 text-center">Kelas</th>
                <th className="border border-slate-800 py-1.5 px-2">Nama Wali Murid</th>
                <th className="border border-slate-800 py-1.5 px-2">No. HP / Kontak</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="border border-slate-800 py-1.5 px-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-800 py-1.5 px-2 font-semibold">{s.fullName}</td>
                  <td className="border border-slate-800 py-1.5 px-2 text-center">{s.gender}</td>
                  <td className="border border-slate-800 py-1.5 px-2 font-mono">
                    {s.nis} / {s.nisn}
                  </td>
                  <td className="border border-slate-800 py-1.5 px-2 text-center">{s.className}</td>
                  <td className="border border-slate-800 py-1.5 px-2">{s.parentName || '-'}</td>
                  <td className="border border-slate-800 py-1.5 px-2">{s.parentPhone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa "${deleteTarget?.name}"?\nSemua riwayat nilai, tabungan, dan absensi terkait akan ikut terhapus.`}
        confirmLabel="Ya, Hapus Siswa"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteStudent(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
