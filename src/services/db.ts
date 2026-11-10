import { DatabaseSchema, Student, UserAccount } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';

const DB_STORAGE_KEY = 'MI_NURUL_FALAH_DATABASE_V1';
const PASSWORDS_STORAGE_KEY = 'MI_NURUL_FALAH_PASSWORDS_V1';

// Default credentials map for mock secure authentication
const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  'wali.ahmad': 'wali123',
  'wali.aisyah': 'wali123',
  'wali.fatih': 'wali123',
};

export function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PASSWORDS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to read passwords from storage', err);
  }
  return { ...DEFAULT_PASSWORDS };
}

export function savePassword(username: string, newPassword: string):void {
  try {
    const current = getStoredPasswords();
    current[username] = newPassword;
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save password', err);
  }
}

export function loadDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all top-level keys exist if schema was updated
      return {
        ...INITIAL_DATABASE,
        ...parsed,
        settings: { ...INITIAL_DATABASE.settings, ...(parsed.settings || {}) },
        schedules: parsed.schedules && parsed.schedules.length > 0 ? parsed.schedules : INITIAL_DATABASE.schedules,
      };
    }
  } catch (err) {
    console.error('Error loading database from localStorage', err);
  }
  // Initialize with initial data
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('database_updated'));
  } catch (err) {
    console.error('Error saving database to localStorage', err);
  }
}

export function exportDatabaseBackup(): void {
  const db = loadDatabase();
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BACKUP_NILAI_SISWA_MI_NURUL_FALAH_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as DatabaseSchema;
    if (!parsed.settings || !Array.isArray(parsed.students) || !Array.isArray(parsed.users)) {
      throw new Error('Format file backup tidak valid.');
    }
    saveDatabase(parsed);
    return true;
  } catch (err) {
    console.error('Gagal mengimpor database backup:', err);
    return false;
  }
}

export function resetDatabaseToDefault(): void {
  saveDatabase(INITIAL_DATABASE);
  localStorage.removeItem(PASSWORDS_STORAGE_KEY);
  window.dispatchEvent(new Event('database_updated'));
}
