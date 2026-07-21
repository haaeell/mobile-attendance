import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAcademicYear } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteAcademicYear,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
}
