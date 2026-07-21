import type { Classroom, Teacher } from '@/types/auth';
import type { Attendance, AttendanceFinalStatus } from '@/types/attendance';
import type { ClassroomStatusSummary } from '@/types/dashboard';
import type { Student } from '@/types/student';

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

/**
 * Bentuk data GET /homeroom/classroom — `ClassroomResource` yang sudah
 * disisipi `today_summary` oleh HomeroomController. `data` bernilai null
 * bila user bukan wali kelas aktif pada kelas mana pun (bukan error).
 */
export interface HomeroomClassroomData extends Classroom {
  academic_year: AcademicYear | null;
  homeroom_teacher: Teacher | null;
  today_summary: ClassroomStatusSummary;
}

export type HomeroomAttendanceStatus = AttendanceFinalStatus | 'not_recorded';

/**
 * Satu baris GET /homeroom/attendances — `attendance` null berarti siswa
 * belum tercatat sama sekali untuk tanggal tersebut.
 */
export interface HomeroomAttendanceRow {
  student: Student;
  attendance: Attendance | null;
  status: HomeroomAttendanceStatus;
  status_label: string;
}

export type HomeroomUpdatableStatus = 'permission' | 'sick' | 'dispensation';

export interface UpdateHomeroomStatusPayload {
  student_id: number;
  date: string;
  status: HomeroomUpdatableStatus;
  notes?: string | null;
  sick_letter?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}
