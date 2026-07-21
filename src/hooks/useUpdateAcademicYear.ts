import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAcademicYear } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYear, AcademicYearPayload } from '@/types/academicYear';

export function useUpdateAcademicYear(id: number) {
  const queryClient = useQueryClient();

  return useMutation<AcademicYear, NormalizedApiError, AcademicYearPayload>({
    mutationFn: (payload) => updateAcademicYear(id, payload),
    retry: false,
    onSuccess: (academicYear) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.setQueryData(['academic-years', 'detail', id], academicYear);
    },
  });
}
