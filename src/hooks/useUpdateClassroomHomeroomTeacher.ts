import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateClassroomHomeroomTeacher } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';
import type { Classroom } from '@/types/classroom';

export function useUpdateClassroomHomeroomTeacher(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Classroom, NormalizedApiError, number | null>({
    mutationFn: (teacherId) => updateClassroomHomeroomTeacher(id, teacherId),
    retry: false,
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.setQueryData(['classrooms', 'detail', id], classroom);
    },
  });
}
