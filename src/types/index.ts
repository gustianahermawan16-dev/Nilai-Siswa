export type UserRole = 'admin' | 'wali_murid';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  studentId?: string; // Connected student ID for wali_murid
  teacherRole?: string; // e.g. "Wali Kelas 4A" or "Kepala Madrasah"
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  className: string;
  homeroomTeacher: string;
  academicYear: string;
  birthPlace: string;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  address: string;
  photoUrl?: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'PAI' | 'Umum' | 'Muatan Lokal';
  classes: string[];
}

export interface DailyGrade {
  id: string;
  studentId: string;
  subjectId: string;
  chapter: string; // Nama bab atau materi
  date: string;
  score: number;
  notes?: string;
  isReleased: boolean;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  updatedAt: string;
}

export interface ScoreChangeLog {
  date: string;
  oldScore: number;
  newScore: number;
  changedBy: string;
  reason: string;
}

export interface ExamGrade {
  id: string;
  studentId: string;
  subjectId: string;
  type: 'PTS' | 'PAS';
  score: number;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  notes?: string;
  isReleased: boolean;
  updatedAt: string;
  changeLogs?: ScoreChangeLog[];
}

export interface SavingsTransaction {
  id: string;
  studentId: string;
  type: 'in' | 'out'; // Uang Masuk / Keluar
  amount: number;
  date: string;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export interface MonthlyInfak {
  id: string;
  studentId: string;
  month: string; // Juli, Agustus, etc.
  year: number;
  paymentDate: string;
  amount: number;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  sourcePermitId?: string;
  recordedBy: string;
  updatedAt: string;
}

export interface LeavePermit {
  id: string;
  studentId: string;
  type: 'Sakit' | 'Izin';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  notes?: string;
  attachmentUrl?: string; // Foto surat dokter / surat wali
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface AdditionalFee {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  targetType: 'all' | 'class' | 'students';
  targetClass?: string;
  targetStudentIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface FeePayment {
  id: string;
  feeId: string;
  feeTitleSnapshot: string; // Saved snapshot so archive remains even if fee is deleted
  feeAmountSnapshot: number;
  studentId: string;
  paidAmount: number;
  status: 'Lunas' | 'Sebagian' | 'Belum Lunas';
  paidDate?: string;
  notes?: string;
  recordedBy?: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  targetType: 'all' | 'class';
  targetClass?: string;
  attachmentUrl?: string;
  author: string;
  createdAt: string;
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  headmaster: string;
  headmasterNip: string;
  passingGrade: number; // Batas minimal KKM (Default 75)
  academicYear: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  classes: string[];
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface ScheduleItem {
  id: string;
  className: string;
  day: DayOfWeek;
  period: number; // Jam ke-1, 2, dst
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "08:15"
  subjectId: string;
  subjectName: string;
  teacherName: string;
  room?: string;
}

export interface DatabaseSchema {
  settings: SchoolSettings;
  users: UserAccount[];
  students: Student[];
  subjects: Subject[];
  dailyGrades: DailyGrade[];
  examGrades: ExamGrade[];
  savings: SavingsTransaction[];
  infak: MonthlyInfak[];
  attendance: AttendanceRecord[];
  permits: LeavePermit[];
  fees: AdditionalFee[];
  feePayments: FeePayment[];
  announcements: Announcement[];
  schedules: ScheduleItem[];
}

