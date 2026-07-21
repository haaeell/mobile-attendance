import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { NormalizedApiError } from '@/types/api';

/**
 * Petakan error validasi 422 dari backend (`errors: { field: string[] }`)
 * ke masing-masing field React Hook Form. Nama field form harus sama persis
 * dengan nama field yang dipakai backend (snake_case) supaya pemetaan ini
 * bekerja tanpa tabel terjemahan nama.
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: NormalizedApiError,
): boolean {
  if (!error.errors) {
    return false;
  }

  Object.entries(error.errors).forEach(([field, messages]) => {
    setError(field as Path<T>, { type: 'server', message: messages[0] });
  });

  return true;
}
