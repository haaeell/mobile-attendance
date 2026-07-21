export type HolidayAppliesTo = 'all' | 'student' | 'teacher';

/**
 * Bentuk `HolidayResource` di backend.
 */
export interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  applies_to: HolidayAppliesTo;
  applies_to_label: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Filter `start_date`/`end_date` di sini mencari hari libur yang
 * BERSINGGUNGAN dengan rentang yang diberikan, bukan pencocokan persis.
 */
export interface HolidayFilters {
  applies_to?: HolidayAppliesTo;
  start_date?: string;
  end_date?: string;
}

export interface HolidayPayload {
  name: string;
  start_date: string;
  end_date: string;
  applies_to: HolidayAppliesTo;
  description?: string | null;
}
