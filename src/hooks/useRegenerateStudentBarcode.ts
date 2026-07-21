import { useMutation, useQueryClient } from '@tanstack/react-query';

import { regenerateStudentBarcode } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { Student } from '@/types/student';

export function useRegenerateStudentBarcode(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Student, NormalizedApiError, void>({
    mutationFn: () => regenerateStudentBarcode(id),
    retry: false,
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
      queryClient.setQueryData(['students', 'detail', id], student);
    },
  });
}
