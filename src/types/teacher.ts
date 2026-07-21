import type { BarcodeStatus } from '@/types/student';

export type TeacherGender = 'male' | 'female';

/**
 * Bentuk `TeacherResource` di backend.
 */
export interface Teacher {
  id: number;
  user_id: number;
  teacher_number: string;
  name: string;
  email: string;
  gender: TeacherGender;
  phone: string | null;
  address: string | null;
  barcode_value: string | null;
  barcode_status: BarcodeStatus;
  barcode_status_label: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Filter yang didukung GET /teachers (lihat TeacherController@index).
 */
export interface TeacherFilters {
  search?: string;
  is_active?: boolean;
}

/**
 * Payload untuk POST /teachers dan PUT /teachers/{id}. `password`/
 * `password_confirmation` wajib saat membuat akun; opsional saat edit —
 * bila diisi kosong pada edit, jangan sertakan field ini sama sekali di
 * payload (lihat toPayload di TeacherForm).
 */
export interface TeacherPayload {
  teacher_number: string;
  name: string;
  email: string;
  gender: TeacherGender;
  phone?: string | null;
  address?: string | null;
  password?: string;
  password_confirmation?: string;
}
