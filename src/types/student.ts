import type { Classroom } from '@/types/auth';

export type BarcodeStatus = 'active' | 'inactive';
export type StudentGender = 'male' | 'female';

/**
 * Bentuk `StudentResource` di backend.
 */
export interface Student {
  id: number;
  academic_year_id: number;
  classroom_id: number;
  classroom: Classroom | null;
  nis: string;
  nisn: string | null;
  name: string;
  gender: StudentGender;
  birth_place: string | null;
  birth_date: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  barcode_value: string | null;
  barcode_status: BarcodeStatus;
  barcode_status_label: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Filter yang didukung GET /students (lihat StudentController@index).
 */
export interface StudentFilters {
  keyword?: string;
  classroom_id?: number;
  academic_year_id?: number;
  gender?: StudentGender;
  is_active?: boolean;
}

/**
 * Payload untuk POST /students dan PUT /students/{id}. Field `is_active`
 * sengaja tidak disertakan — diubah lewat PATCH /students/{id}/status
 * (fitur "nonaktifkan/aktifkan" terpisah dari form tambah/edit).
 */
export interface StudentPayload {
  academic_year_id: number;
  classroom_id: number;
  nis: string;
  nisn?: string | null;
  name: string;
  gender: StudentGender;
  birth_place?: string | null;
  birth_date?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  address?: string | null;
}
