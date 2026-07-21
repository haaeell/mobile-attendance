import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteStudent } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteStudent,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
    },
  });
}
