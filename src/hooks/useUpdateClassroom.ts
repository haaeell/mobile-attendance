import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateClassroom } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';
import type { Classroom, ClassroomPayload } from '@/types/classroom';

export function useUpdateClassroom(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Classroom, NormalizedApiError, ClassroomPayload>({
    mutationFn: (payload) => updateClassroom(id, payload),
    retry: false,
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.setQueryData(['classrooms', 'detail', id], classroom);
    },
  });
}
