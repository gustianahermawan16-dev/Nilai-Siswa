import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdditionalFee,
  Announcement,
  AttendanceRecord,
  DailyGrade,
  DatabaseSchema,
  ExamGrade,
  FeePayment,
  LeavePermit,
  MonthlyInfak,
  SavingsTransaction,
  ScheduleItem,
  SchoolSettings,
  Student,
  Subject,
  UserAccount,
} from '../types';
import {
  loadDatabase,
  saveDatabase,
  savePassword,
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToDefault,
} from '../services/db';
import { syncPermitToAttendance } from '../utils/academic';

interface DatabaseContextType {
  db: DatabaseSchema;
  refreshDb: () => void;
  // Students
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  // Accounts
  createWaliAccount: (data: { studentId: string; fullName: string; username: string; password: string; phone?: string }) => { success: boolean; message?: string };
  updateUserAccount: (id: string, updates: Partial<UserAccount>) => void;
  resetUserPassword: (username: string, newPass: string) => void;
  // Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  // Daily Grades
  addDailyGrade: (grade: Omit<DailyGrade, 'id' | 'updatedAt'>) => void;
  updateDailyGrade: (id: string, updates: Partial<DailyGrade>) => void;
  deleteDailyGrade: (id: string) => void;
  releaseDailyGrades: (ids: string[], isReleased: boolean) => void;
  // Exam Grades (PTS/PAS)
  upsertExamGrade: (
    data: Omit<ExamGrade, 'id' | 'updatedAt' | 'changeLogs'> & { reason?: string; changedBy?: string }
  ) => void;
  releaseExamGrades: (ids: string[], isReleased: boolean) => void;
  // Savings
  addSavingsTransaction: (tx: Omit<SavingsTransaction, 'id' | 'createdAt'>) => void;
  deleteSavingsTransaction: (id: string) => void;
  // Infak
  addMonthlyInfak: (inf: Omit<MonthlyInfak, 'id' | 'createdAt'>) => void;
  deleteMonthlyInfak: (id: string) => void;
  // Attendance
  recordAttendance: (records: Array<Omit<AttendanceRecord, 'id' | 'updatedAt'>>) => void;
  // Leave Permits
  submitPermit: (permit: Omit<LeavePermit, 'id' | 'status' | 'submittedAt'>) => LeavePermit;
  approvePermit: (permitId: string, adminName: string, adminNote?: string) => void;
  rejectPermit: (permitId: string, adminName: string, reason: string) => void;
  // Fees & Payments
  addFee: (fee: Omit<AdditionalFee, 'id' | 'createdAt'>) => AdditionalFee;
  updateFee: (id: string, updates: Partial<AdditionalFee>) => void;
  deleteFee: (id: string) => void;
  recordFeePayment: (payment: Omit<FeePayment, 'id' | 'updatedAt'>) => void;
  // Announcements
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  // Schedules
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  // Settings
  updateSettings: (updates: Partial<SchoolSettings>) => void;
  // Backup
  exportBackup: () => void;
  importBackup: (json: string) => boolean;
  resetDefault: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseSchema>(loadDatabase);

  const refreshDb = useCallback(() => {
    setDb(loadDatabase());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setDb(loadDatabase());
    };
    window.addEventListener('database_updated', handleUpdate);
    return () => window.removeEventListener('database_updated', handleUpdate);
  }, []);

  const commit = (updater: (prev: DatabaseSchema) => DatabaseSchema) => {
    setDb((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // STUDENTS
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    commit((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteStudent = (id: string) => {
    commit((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  // USER / WALI MURID ACCOUNTS
  const createWaliAccount = (data: {
    studentId: string;
    fullName: string;
    username: string;
    password: string;
    phone?: string;
  }) => {
    const cleanUser = data.username.trim().toLowerCase();
    if (!cleanUser || !data.password) {
      return { success: false, message: 'Username dan kata sandi wajib diisi.' };
    }

    if (db.users.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'Username ini sudah digunakan akun lain.' };
    }

    const newUser: UserAccount = {
      id: `usr-wali-${Date.now()}`,
      username: cleanUser,
      fullName: data.fullName,
      email: `${cleanUser}@wali.minurulfalah.sch.id`,
      role: 'wali_murid',
      phone: data.phone || '',
      studentId: data.studentId,
      createdAt: new Date().toISOString(),
    };

    savePassword(cleanUser, data.password);

    commit((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    return { success: true };
  };

  const updateUserAccount = (id: string, updates: Partial<UserAccount>) => {
    commit((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  };

  const resetUserPassword = (username: string, newPass: string) => {
    savePassword(username, newPass);
  };

  // SUBJECTS
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    commit((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    commit((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
    }));
  };

  const deleteSubject = (id: string) => {
    commit((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((sub) => sub.id !== id),
    }));
  };

  // DAILY GRADES
  const addDailyGrade = (gradeData: Omit<DailyGrade, 'id' | 'updatedAt'>) => {
    const newGrade: DailyGrade = {
      ...gradeData,
      id: `dg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      dailyGrades: [newGrade, ...prev.dailyGrades],
    }));
  };

  const updateDailyGrade = (id: string, updates: Partial<DailyGrade>) => {
    commit((prev) => ({
      ...prev,
      dailyGrades: prev.dailyGrades.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      ),
    }));
  };

  const deleteDailyGrade = (id: string) => {
    commit((prev) => ({
      ...prev,
      dailyGrades: prev.dailyGrades.filter((g) => g.id !== id),
    }));
  };

  const releaseDailyGrades = (ids: string[], isReleased: boolean) => {
    commit((prev) => ({
      ...prev,
      dailyGrades: prev.dailyGrades.map((g) =>
        ids.includes(g.id) ? { ...g, isReleased, updatedAt: new Date().toISOString() } : g
      ),
    }));
  };

  // EXAM GRADES (PTS/PAS)
  const upsertExamGrade = (
    data: Omit<ExamGrade, 'id' | 'updatedAt' | 'changeLogs'> & {
      reason?: string;
      changedBy?: string;
    }
  ) => {
    commit((prev) => {
      const existingIndex = prev.examGrades.findIndex(
        (e) =>
          e.studentId === data.studentId &&
          e.subjectId === data.subjectId &&
          e.type === data.type &&
          e.academicYear === data.academicYear &&
          e.semester === data.semester
      );

      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const old = prev.examGrades[existingIndex];
        const newLogs = [...(old.changeLogs || [])];
        if (old.score !== data.score) {
          newLogs.push({
            date: now,
            oldScore: old.score,
            newScore: data.score,
            changedBy: data.changedBy || 'Admin/Guru',
            reason: data.reason || 'Pembaruan nilai ujian',
          });
        }

        const updated: ExamGrade = {
          ...old,
          score: data.score,
          notes: data.notes,
          isReleased: data.isReleased,
          updatedAt: now,
          changeLogs: newLogs,
        };

        const updatedList = [...prev.examGrades];
        updatedList[existingIndex] = updated;
        return { ...prev, examGrades: updatedList };
      } else {
        const newExam: ExamGrade = {
          id: `eg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: data.studentId,
          subjectId: data.subjectId,
          type: data.type,
          score: data.score,
          academicYear: data.academicYear,
          semester: data.semester,
          notes: data.notes,
          isReleased: data.isReleased,
          updatedAt: now,
          changeLogs: [],
        };
        return { ...prev, examGrades: [newExam, ...prev.examGrades] };
      }
    });
  };

  const releaseExamGrades = (ids: string[], isReleased: boolean) => {
    commit((prev) => ({
      ...prev,
      examGrades: prev.examGrades.map((g) =>
        ids.includes(g.id) ? { ...g, isReleased, updatedAt: new Date().toISOString() } : g
      ),
    }));
  };

  // SAVINGS
  const addSavingsTransaction = (tx: Omit<SavingsTransaction, 'id' | 'createdAt'>) => {
    const newTx: SavingsTransaction = {
      ...tx,
      id: `sav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      savings: [newTx, ...prev.savings],
    }));
  };

  const deleteSavingsTransaction = (id: string) => {
    commit((prev) => ({
      ...prev,
      savings: prev.savings.filter((s) => s.id !== id),
    }));
  };

  // INFAK
  const addMonthlyInfak = (inf: Omit<MonthlyInfak, 'id' | 'createdAt'>) => {
    const newInf: MonthlyInfak = {
      ...inf,
      id: `inf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      infak: [newInf, ...prev.infak],
    }));
  };

  const deleteMonthlyInfak = (id: string) => {
    commit((prev) => ({
      ...prev,
      infak: prev.infak.filter((i) => i.id !== id),
    }));
  };

  // ATTENDANCE
  const recordAttendance = (records: Array<Omit<AttendanceRecord, 'id' | 'updatedAt'>>) => {
    commit((prev) => {
      const updatedList = [...prev.attendance];
      const now = new Date().toISOString();

      for (const rec of records) {
        const existingIdx = updatedList.findIndex(
          (a) => a.studentId === rec.studentId && a.date === rec.date
        );
        if (existingIdx >= 0) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            status: rec.status,
            notes: rec.notes,
            recordedBy: rec.recordedBy,
            updatedAt: now,
          };
        } else {
          updatedList.push({
            ...rec,
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            updatedAt: now,
          });
        }
      }

      return { ...prev, attendance: updatedList };
    });
  };

  // LEAVE PERMITS
  const submitPermit = (permitData: Omit<LeavePermit, 'id' | 'status' | 'submittedAt'>) => {
    const newPermit: LeavePermit = {
      ...permitData,
      id: `prm-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      permits: [newPermit, ...prev.permits],
    }));
    return newPermit;
  };

  const approvePermit = (permitId: string, adminName: string, adminNote?: string) => {
    commit((prev) => {
      const permit = prev.permits.find((p) => p.id === permitId);
      if (!permit) return prev;

      const updatedPermit: LeavePermit = {
        ...permit,
        status: 'approved',
        adminNote: adminNote || 'Disetujui oleh Madrasah',
        processedAt: new Date().toISOString(),
        processedBy: adminName,
      };

      // Otomatis masukkan status Sakit / Izin ke daftar hadir tanpa duplikasi!
      const syncedAttendance = syncPermitToAttendance(updatedPermit, prev.attendance, adminName);

      return {
        ...prev,
        permits: prev.permits.map((p) => (p.id === permitId ? updatedPermit : p)),
        attendance: syncedAttendance,
      };
    });
  };

  const rejectPermit = (permitId: string, adminName: string, reason: string) => {
    commit((prev) => ({
      ...prev,
      permits: prev.permits.map((p) =>
        p.id === permitId
          ? {
              ...p,
              status: 'rejected',
              adminNote: reason,
              processedAt: new Date().toISOString(),
              processedBy: adminName,
            }
          : p
      ),
    }));
  };

  // ADDITIONAL FEES & PAYMENTS
  const addFee = (feeData: Omit<AdditionalFee, 'id' | 'createdAt'>) => {
    const newFee: AdditionalFee = {
      ...feeData,
      id: `fee-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      fees: [newFee, ...prev.fees],
    }));
    return newFee;
  };

  const updateFee = (id: string, updates: Partial<AdditionalFee>) => {
    commit((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const deleteFee = (id: string) => {
    // Kebutuhan penting: jika iuran dihapus, arsip transaksi pembayaran tetap tersimpan!
    commit((prev) => ({
      ...prev,
      fees: prev.fees.filter((f) => f.id !== id),
    }));
  };

  const recordFeePayment = (paymentData: Omit<FeePayment, 'id' | 'updatedAt'>) => {
    commit((prev) => {
      const existingIdx = prev.feePayments.findIndex(
        (fp) => fp.feeId === paymentData.feeId && fp.studentId === paymentData.studentId
      );
      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        const updatedList = [...prev.feePayments];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          ...paymentData,
          updatedAt: now,
        };
        return { ...prev, feePayments: updatedList };
      } else {
        const newPayment: FeePayment = {
          ...paymentData,
          id: `fp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          updatedAt: now,
        };
        return { ...prev, feePayments: [newPayment, ...prev.feePayments] };
      }
    });
  };

  // ANNOUNCEMENTS
  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements],
    }));
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    commit((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const deleteAnnouncement = (id: string) => {
    commit((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  };

  // SCHEDULES
  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...itemData,
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    commit((prev) => ({
      ...prev,
      schedules: [...(prev.schedules || []), newItem],
    }));
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    commit((prev) => ({
      ...prev,
      schedules: (prev.schedules || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteScheduleItem = (id: string) => {
    commit((prev) => ({
      ...prev,
      schedules: (prev.schedules || []).filter((s) => s.id !== id),
    }));
  };

  // SETTINGS
  const updateSettings = (updates: Partial<SchoolSettings>) => {
    commit((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  return (
    <DatabaseContext.Provider
      value={{
        db,
        refreshDb,
        addStudent,
        updateStudent,
        deleteStudent,
        createWaliAccount,
        updateUserAccount,
        resetUserPassword,
        addSubject,
        updateSubject,
        deleteSubject,
        addDailyGrade,
        updateDailyGrade,
        deleteDailyGrade,
        releaseDailyGrades,
        upsertExamGrade,
        releaseExamGrades,
        addSavingsTransaction,
        deleteSavingsTransaction,
        addMonthlyInfak,
        deleteMonthlyInfak,
        recordAttendance,
        submitPermit,
        approvePermit,
        rejectPermit,
        addFee,
        updateFee,
        deleteFee,
        recordFeePayment,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        updateSettings,
        exportBackup: exportDatabaseBackup,
        importBackup: importDatabaseBackup,
        resetDefault: resetDatabaseToDefault,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
