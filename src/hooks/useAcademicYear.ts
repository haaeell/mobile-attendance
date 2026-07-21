import { useQuery } from '@tanstack/react-query';

import { getAcademicYear } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYear } from '@/types/academicYear';

export function useAcademicYear(id: number) {
  return useQuery<AcademicYear, NormalizedApiError>({
    queryKey: ['academic-years', 'detail', id],
    queryFn: () => getAcademicYear(id),
    enabled: Number.isFinite(id),
  });
}
