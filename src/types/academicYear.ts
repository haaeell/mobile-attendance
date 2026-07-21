/**
 * Bentuk `AcademicYearResource` di backend.
 */
export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AcademicYearPayload {
  name: string;
  start_date: string;
  end_date: string;
}
