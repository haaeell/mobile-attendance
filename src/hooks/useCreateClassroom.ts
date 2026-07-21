import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createClassroom } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';
import type { Classroom, ClassroomPayload } from '@/types/classroom';

export function useCreateClassroom() {
  const queryClient = useQueryClient();

  return useMutation<Classroom, NormalizedApiError, ClassroomPayload>({
    mutationFn: createClassroom,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}
