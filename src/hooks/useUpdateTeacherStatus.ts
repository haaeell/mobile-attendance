import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTeacherStatus } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher } from '@/types/teacher';

export function useUpdateTeacherStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Teacher, NormalizedApiError, boolean>({
    mutationFn: (isActive) => updateTeacherStatus(id, isActive),
    retry: false,
    onSuccess: (teacher) => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
      queryClient.setQueryData(['teachers', 'detail', id], teacher);
    },
  });
}
