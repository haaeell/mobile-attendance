import type { AcademicYearOption } from '@/api/academicYears';
import type { Teacher } from '@/types/teacher';

/**
 * Bentuk `ClassroomResource` di backend. `academic_year`/`homeroom_teacher`
 * hanya terisi penuh bila relasinya di-eager-load di server — di endpoint
 * yang tidak memuatnya, field ini bisa berupa objek kosong `{}` (bukan
 * `null`), jadi selalu akses lewat optional chaining (`?.name`) di UI.
 */
export interface Classroom {
  id: number;
  academic_year_id: number;
  academic_year?: AcademicYearOption | null;
  name: string;
  grade_level: string;
  major: string | null;
  homeroom_teacher_id: number | null;
  homeroom_teacher?: Teacher | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClassroomFilters {
  academic_year_id?: number;
  search?: string;
  is_active?: boolean;
}

export interface ClassroomPayload {
  academic_year_id: number;
  name: string;
  grade_level: string;
  major?: string | null;
  is_active?: boolean;
}
