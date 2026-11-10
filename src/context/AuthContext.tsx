import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, UserAccount } from '../types';
import { getStoredPasswords, loadDatabase, savePassword } from '../services/db';

interface AuthContextType {
  currentUser: UserAccount | null;
  activeStudent: Student | null; // Available when role is wali_murid
  login: (username: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  changePassword: (newPass: string) => { success: boolean; message?: string };
  forgotPasswordRecover: (username: string, recoveryAnswer: string, newPass: string) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'MI_NURUL_FALAH_SESSION';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Restore session on load
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const user = JSON.parse(saved) as UserAccount;
        const db = loadDatabase();
        // verify user still exists
        const exists = db.users.find((u) => u.id === user.id);
        if (exists) {
          setCurrentUser(exists);
          if (exists.role === 'wali_murid' && exists.studentId) {
            const student = db.students.find((s) => s.id === exists.studentId);
            setActiveStudent(student || null);
          }
        }
      }
    } catch (e) {
      console.error('Session load error', e);
    }
  }, []);

  const login = (usernameInput: string, passInput: string): { success: boolean; message?: string } => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const db = loadDatabase();
    const user = db.users.find((u) => u.username.toLowerCase() === trimmedUser);

    if (!user) {
      return { success: false, message: 'Nama pengguna tidak ditemukan dalam sistem.' };
    }

    const passwords = getStoredPasswords();
    const expectedPassword = passwords[user.username] || '123456';

    if (passInput !== expectedPassword) {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    if (user.role === 'wali_murid' && user.studentId) {
      const student = db.students.find((s) => s.id === user.studentId);
      setActiveStudent(student || null);
    } else {
      setActiveStudent(null);
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveStudent(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const changePassword = (newPass: string): { success: boolean; message?: string } => {
    if (!currentUser) return { success: false, message: 'Belum masuk ke akun.' };
    if (!newPass || newPass.length < 5) {
      return { success: false, message: 'Kata sandi minimal 5 karakter.' };
    }
    savePassword(currentUser.username, newPass);
    return { success: true, message: 'Kata sandi berhasil diubah.' };
  };

  const forgotPasswordRecover = (username: string, recoveryCode: string, newPass: string) => {
    const trimmed = username.trim().toLowerCase();
    const db = loadDatabase();
    const user = db.users.find((u) => u.username.toLowerCase() === trimmed);
    if (!user) {
      return { success: false, message: 'Nama pengguna tidak terdaftar.' };
    }

    // Pemulihan aman: verifikasi email atau nomor HP terdaftar atau kode verifikasi madrasah "FALAH2024"
    const isValidRecovery = 
      recoveryCode.trim() === 'FALAH2024' ||
      (user.email && user.email.toLowerCase() === recoveryCode.trim().toLowerCase()) ||
      (user.phone && user.phone.includes(recoveryCode.trim()));

    if (!isValidRecovery) {
      return {
        success: false,
        message: 'Verifikasi identitas gagal! Masukkan Email/No HP terdaftar atau Kode Madrasah (FALAH2024).',
      };
    }

    savePassword(user.username, newPass);
    return { success: true, message: 'Kata sandi akun Anda berhasil diperbarui. Silakan masuk.' };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeStudent,
        login,
        logout,
        changePassword,
        forgotPasswordRecover,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
