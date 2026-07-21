import { useMutation, useQueryClient } from '@tanstack/react-query';

import { regenerateTeacherBarcode } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher } from '@/types/teacher';

export function useRegenerateTeacherBarcode(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Teacher, NormalizedApiError, void>({
    mutationFn: () => regenerateTeacherBarcode(id),
    retry: false,
    onSuccess: (teacher) => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
      queryClient.setQueryData(['teachers', 'detail', id], teacher);
    },
  });
}
