export type AttendanceFinalStatus =
  | 'present'
  | 'late'
  | 'permission'
  | 'sick'
  | 'dispensation'
  | 'alpha';

export type AttendanceSource = 'barcode' | 'manual' | 'system';

export interface AttendanceSubject {
  id: number;
  name: string;
  identifier: string;
  classroom: { id: number; name: string } | null;
}

/**
 * Bentuk `AttendanceResource` di backend.
 */
export interface Attendance {
  id: number;
  attendance_date: string;
  subject_type: 'student' | 'teacher';
  subject: AttendanceSubject | null;
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_status: AttendanceFinalStatus | null;
  check_in_status_label: string | null;
  final_status: AttendanceFinalStatus;
  final_status_label: string;
  late_minutes: number;
  source: AttendanceSource;
  source_label: string;
  notes: string | null;
  check_in_scanned_by: string | null;
  check_out_scanned_by: string | null;
  manually_updated_by: string | null;
  manually_updated_at: string | null;
}

/**
 * Filter yang didukung GET /attendances dan GET /attendances/today
 * (lihat AttendanceQueryService di backend).
 */
export interface AttendanceFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  subject_type?: 'student' | 'teacher';
  classroom_id?: number;
  status?: AttendanceFinalStatus;
  keyword?: string;
  sort_by?: 'attendance_date' | 'created_at' | 'late_minutes';
  sort_direction?: 'asc' | 'desc';
}

export interface ClassroomOption {
  id: number;
  name: string;
}

/**
 * Bentuk `ScanLogResource` di backend — nilai barcode selalu sudah
 * disamarkan oleh server, tidak pernah nilai penuh.
 */
export interface ScanLogEntry {
  id: number;
  barcode_masked: string;
  scanner: string | null;
  scanned_at: string | null;
  result: string;
  result_label: string;
  message: string;
  subject_type: 'student' | 'teacher' | null;
  attendable_id: number | null;
  attendance_id: number | null;
  device_identifier: string | null;
}
