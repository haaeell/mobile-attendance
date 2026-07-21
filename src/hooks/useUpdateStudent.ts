import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateStudent } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { Student, StudentPayload } from '@/types/student';

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Student, NormalizedApiError, StudentPayload>({
    mutationFn: (payload) => updateStudent(id, payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['students', 'detail', id] });
    },
  });
}
