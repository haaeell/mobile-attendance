import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createStudent } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { Student, StudentPayload } from '@/types/student';

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, NormalizedApiError, StudentPayload>({
    mutationFn: createStudent,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
}
