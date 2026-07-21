import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTeacher } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher, TeacherPayload } from '@/types/teacher';

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation<Teacher, NormalizedApiError, TeacherPayload>({
    mutationFn: createTeacher,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
    },
  });
}
