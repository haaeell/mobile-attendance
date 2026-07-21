import type { Attendance, AttendanceFinalStatus } from '@/types/attendance';

export interface AttendanceReportSummary {
  total_records: number;
  present: number;
  late: number;
  permission: number;
  sick: number;
  dispensation: number;
  alpha: number;
  total_late_minutes: number;
  attendance_percentage: number;
}

export interface AttendanceReportFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  subject_type?: 'student' | 'teacher';
  classroom_id?: number;
  status?: AttendanceFinalStatus;
  keyword?: string;
}

/**
 * Bentuk `data` dari GET /reports/attendance (mode tanpa `group_by`).
 */
export interface AttendanceReportPage {
  summary: AttendanceReportSummary;
  data: Attendance[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
