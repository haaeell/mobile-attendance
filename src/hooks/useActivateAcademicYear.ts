import { useMutation, useQueryClient } from '@tanstack/react-query';

import { activateAcademicYear } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYear } from '@/types/academicYear';

export function useActivateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation<AcademicYear, NormalizedApiError, number>({
    mutationFn: activateAcademicYear,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
}
