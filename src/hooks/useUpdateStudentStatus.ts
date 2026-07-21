import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateStudentStatus } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { Student } from '@/types/student';

export function useUpdateStudentStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Student, NormalizedApiError, boolean>({
    mutationFn: (isActive) => updateStudentStatus(id, isActive),
    retry: false,
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
      queryClient.setQueryData(['students', 'detail', id], student);
    },
  });
}
