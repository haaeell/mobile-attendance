export type UserRole = 'admin' | 'teacher';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  is_active: boolean;
}

export interface Teacher {
  id: number;
  user_id: number;
  teacher_number: string;
  name: string;
  email: string | null;
  gender: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

export interface Classroom {
  id: number;
  academic_year_id: number;
  name: string;
  grade_level: string;
  major: string | null;
  homeroom_teacher_id: number | null;
  is_active: boolean;
}

/**
 * Bentuk `data` dari GET /auth/me. Field `teacher`/`is_homeroom_teacher`/
 * `homeroom_classroom` hanya ada bila role === 'teacher'.
 */
export interface AuthenticatedUser extends User {
  teacher?: Teacher | null;
  is_homeroom_teacher?: boolean;
  homeroom_classroom?: Classroom | null;
}

export interface LoginResponseData {
  token: string;
  token_type: string;
  user: User;
}
