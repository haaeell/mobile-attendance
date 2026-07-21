import type { AttendanceFinalStatus } from '@/types/attendance';

export interface ScanRequestPayload {
  barcode: string;
  device_identifier: string;
}

/**
 * Bentuk `data` sukses dari POST /attendance/scan
 * (lihat AttendanceScanService::buildResponse() di backend).
 */
export interface ScanSuccessData {
  scan_type: 'check_in' | 'check_out';
  subject_type: 'student' | 'teacher';
  name: string;
  identifier: string;
  classroom: { id: number; name: string } | null;
  attendance_date: string;
  time: string | null;
  status: AttendanceFinalStatus;
  status_label: string;
  late_minutes: number;
  check_in_at: string | null;
  check_out_at: string | null;
}

/**
 * Satu entri riwayat scan dalam sesi berjalan (di memori, tidak disimpan).
 */
export type ScanSessionEntry =
  | { id: string; scannedAt: number; outcome: 'success'; data: ScanSuccessData }
  | { id: string; scannedAt: number; outcome: 'error'; message: string; errorCode: string | null };
