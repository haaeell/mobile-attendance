import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteClassroom } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteClassroom() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteClassroom,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}
