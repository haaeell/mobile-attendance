import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeacher } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteTeacher,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
    },
  });
}
