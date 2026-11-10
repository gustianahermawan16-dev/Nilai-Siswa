import {
  AttendanceRecord,
  AttendanceStatus,
  LeavePermit,
  MonthlyInfak,
  SavingsTransaction,
} from '../types';

/**
 * Menghitung status ketuntasan nilai berdasarkan KKM / Batas Nilai Minimal
 * Nilai >= passingGrade: TUNTAS
 * Nilai < passingGrade: REMEDIAL
 */
export function calculateGradeStatus(
  score: number,
  passingGrade: number = 75
): 'TUNTAS' | 'REMEDIAL' {
  if (typeof score !== 'number' || isNaN(score)) return 'REMEDIAL';
  return score >= passingGrade ? 'TUNTAS' : 'REMEDIAL';
}

/**
 * Menghitung saldo tabungan: Saldo = Jumlah Uang Masuk - Jumlah Uang Keluar
 */
export function calculateSavingsBalance(transactions: SavingsTransaction[]): {
  totalIn: number;
  totalOut: number;
  balance: number;
} {
  let totalIn = 0;
  let totalOut = 0;

  for (const tx of transactions) {
    const val = Number(tx.amount) || 0;
    if (tx.type === 'in') {
      totalIn += val;
    } else if (tx.type === 'out') {
      totalOut += val;
    }
  }

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
}

/**
 * Menghitung total infak yang sudah dibayarkan
 */
export function calculateTotalInfak(records: MonthlyInfak[]): number {
  return records.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
}

/**
 * Rekapitulasi presensi / kehadiran
 */
export function calculateAttendanceSummary(records: AttendanceRecord[]): {
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  total: number;
  percentage: number;
} {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alfa = 0;

  for (const r of records) {
    if (r.status === 'Hadir') hadir++;
    else if (r.status === 'Sakit') sakit++;
    else if (r.status === 'Izin') izin++;
    else if (r.status === 'Alfa') alfa++;
  }

  const total = hadir + sakit + izin + alfa;
  const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

  return {
    hadir,
    sakit,
    izin,
    alfa,
    total,
    percentage,
  };
}

/**
 * Menghasilkan daftar tanggal YYYY-MM-DD dari startDate ke endDate (inklusif)
 */
export function generateDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  if (!startDateStr || !endDateStr) return dates;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return dates;
  if (start > end) {
    return [startDateStr];
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Menyinkronkan Surat Izin / Sakit yang disetujui ke daftar absensi.
 * Menjamin TIDAK ADA absensi ganda untuk siswa dan tanggal yang sama.
 */
export function syncPermitToAttendance(
  permit: LeavePermit,
  currentAttendance: AttendanceRecord[],
  adminName: string
): AttendanceRecord[] {
  if (permit.status !== 'approved') {
    return currentAttendance;
  }

  const targetDates = generateDateRange(permit.startDate, permit.endDate);
  const newStatus: AttendanceStatus = permit.type === 'Sakit' ? 'Sakit' : 'Izin';
  const updatedList = [...currentAttendance];

  for (const date of targetDates) {
    const existingIndex = updatedList.findIndex(
      (a) => a.studentId === permit.studentId && a.date === date
    );

    const recordData: AttendanceRecord = {
      id: existingIndex >= 0 ? updatedList[existingIndex].id : `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId: permit.studentId,
      date,
      status: newStatus,
      notes: `Surat ${permit.type}: ${permit.reason}`,
      sourcePermitId: permit.id,
      recordedBy: adminName,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Perbarui record yang ada agar tidak duplikat
      updatedList[existingIndex] = recordData;
    } else {
      // Tambahkan record baru
      updatedList.push(recordData);
    }
  }

  return updatedList;
}

/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format tanggal Indonesia: 10 November 2024
 */
export function formatDateIndonesian(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
