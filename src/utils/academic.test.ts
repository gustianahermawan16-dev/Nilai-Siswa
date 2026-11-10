import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGradeStatus,
  calculateSavingsBalance,
  calculateTotalInfak,
  calculateAttendanceSummary,
  generateDateRange,
  syncPermitToAttendance,
  formatRupiah,
} from './academic.js';
import { AttendanceRecord, LeavePermit, MonthlyInfak, SavingsTransaction } from '../types/index.js';

test('calculateGradeStatus returns TUNTAS when score >= 75 and REMEDIAL when < 75', () => {
  assert.equal(calculateGradeStatus(100, 75), 'TUNTAS');
  assert.equal(calculateGradeStatus(75, 75), 'TUNTAS');
  assert.equal(calculateGradeStatus(74.9, 75), 'REMEDIAL');
  assert.equal(calculateGradeStatus(60, 75), 'REMEDIAL');
  assert.equal(calculateGradeStatus(0, 75), 'REMEDIAL');
  // Custom threshold
  assert.equal(calculateGradeStatus(70, 70), 'TUNTAS');
  assert.equal(calculateGradeStatus(69, 70), 'REMEDIAL');
});

test('calculateSavingsBalance correctly sums in, out and calculates balance', () => {
  const transactions: SavingsTransaction[] = [
    { id: '1', studentId: 's1', type: 'in', amount: 50000, date: '2024-08-01', notes: 'Setoran 1', recordedBy: 'Admin', createdAt: '' },
    { id: '2', studentId: 's1', type: 'in', amount: 25000, date: '2024-08-05', notes: 'Setoran 2', recordedBy: 'Admin', createdAt: '' },
    { id: '3', studentId: 's1', type: 'out', amount: 30000, date: '2024-08-10', notes: 'Penarikan', recordedBy: 'Admin', createdAt: '' },
  ];

  const result = calculateSavingsBalance(transactions);
  assert.equal(result.totalIn, 75000);
  assert.equal(result.totalOut, 30000);
  assert.equal(result.balance, 45000);
});

test('calculateTotalInfak accurately computes sum', () => {
  const records: MonthlyInfak[] = [
    { id: '1', studentId: 's1', month: 'Juli', year: 2024, paymentDate: '2024-07-15', amount: 20000, recordedBy: 'Admin', createdAt: '' },
    { id: '2', studentId: 's1', month: 'Agustus', year: 2024, paymentDate: '2024-08-15', amount: 20000, recordedBy: 'Admin', createdAt: '' },
  ];
  assert.equal(calculateTotalInfak(records), 40000);
});

test('calculateAttendanceSummary counts each status and percentage correctly', () => {
  const records: AttendanceRecord[] = [
    { id: '1', studentId: 's1', date: '2024-08-01', status: 'Hadir', recordedBy: 'Admin', updatedAt: '' },
    { id: '2', studentId: 's1', date: '2024-08-02', status: 'Hadir', recordedBy: 'Admin', updatedAt: '' },
    { id: '3', studentId: 's1', date: '2024-08-03', status: 'Sakit', recordedBy: 'Admin', updatedAt: '' },
    { id: '4', studentId: 's1', date: '2024-08-04', status: 'Izin', recordedBy: 'Admin', updatedAt: '' },
  ];

  const summary = calculateAttendanceSummary(records);
  assert.equal(summary.hadir, 2);
  assert.equal(summary.sakit, 1);
  assert.equal(summary.izin, 1);
  assert.equal(summary.alfa, 0);
  assert.equal(summary.total, 4);
  assert.equal(summary.percentage, 50); // 2/4 = 50%
});

test('generateDateRange produces inclusive day list', () => {
  const dates = generateDateRange('2024-08-01', '2024-08-03');
  assert.deepEqual(dates, ['2024-08-01', '2024-08-02', '2024-08-03']);
});

test('syncPermitToAttendance updates attendance without duplicating same day record', () => {
  const existing: AttendanceRecord[] = [
    { id: 'att-1', studentId: 's1', date: '2024-08-01', status: 'Alfa', recordedBy: 'Admin', updatedAt: '' },
  ];

  const permit: LeavePermit = {
    id: 'p-1',
    studentId: 's1',
    type: 'Sakit',
    startDate: '2024-08-01',
    endDate: '2024-08-02',
    reason: 'Demam tinggi rawat inap',
    status: 'approved',
    submittedAt: '2024-08-01T07:00:00Z',
  };

  const synced = syncPermitToAttendance(permit, existing, 'Admin');
  assert.equal(synced.length, 2); // 2024-08-01 (overwritten) and 2024-08-02 (new)
  
  const day1 = synced.find(a => a.date === '2024-08-01');
  const day2 = synced.find(a => a.date === '2024-08-02');
  assert.ok(day1);
  assert.ok(day2);
  assert.equal(day1.status, 'Sakit');
  assert.equal(day1.id, 'att-1'); // preserves id to avoid duplicate
  assert.equal(day2.status, 'Sakit');
});

test('formatRupiah formats Indonesian currency format', () => {
  const formatted = formatRupiah(50000);
  assert.ok(formatted.includes('50.000'));
});
