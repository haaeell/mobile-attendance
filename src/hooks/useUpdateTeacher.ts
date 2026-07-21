import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTeacher } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher, TeacherPayload } from '@/types/teacher';

export function useUpdateTeacher(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Teacher, NormalizedApiError, TeacherPayload>({
    mutationFn: (payload) => updateTeacher(id, payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', 'detail', id] });
    },
  });
}
