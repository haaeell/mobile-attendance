import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAcademicYear } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYear, AcademicYearPayload } from '@/types/academicYear';

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation<AcademicYear, NormalizedApiError, AcademicYearPayload>({
    mutationFn: createAcademicYear,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
}
