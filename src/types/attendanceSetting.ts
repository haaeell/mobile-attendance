import type { AcademicYearOption } from '@/api/academicYears';

export type AttendanceSubjectType = 'student' | 'teacher';

/**
 * Bentuk `AttendanceSettingResource` di backend. Field waktu (`check_in_start`
 * dkk.) dikembalikan server sebagai string mentah kolom `time` (umumnya
 * "HH:MM:SS"), berbeda dari format input `H:i` yang divalidasi saat
 * create/update — selalu ambil 5 karakter pertama (`slice(0, 5)`) saat
 * menampilkan atau mengedit nilainya.
 */
export interface AttendanceSetting {
  id: number;
  academic_year_id: number;
  academic_year?: AcademicYearOption | null;
  subject_type: AttendanceSubjectType;
  subject_type_label: string;
  effective_date: string | null;
  check_in_start: string;
  on_time_limit: string;
  late_limit: string | null;
  check_in_close: string;
  check_out_start: string;
  check_out_end: string | null;
  allow_early_checkout: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AttendanceSettingFilters {
  academic_year_id?: number;
  subject_type?: AttendanceSubjectType;
  is_active?: boolean;
}

/**
 * Payload untuk POST/PUT — field waktu wajib dalam format `H:i` (mis. "07:00").
 */
export interface AttendanceSettingPayload {
  academic_year_id: number;
  subject_type: AttendanceSubjectType;
  effective_date?: string | null;
  check_in_start: string;
  on_time_limit: string;
  late_limit?: string | null;
  check_in_close: string;
  check_out_start: string;
  check_out_end?: string | null;
  allow_early_checkout?: boolean;
}
