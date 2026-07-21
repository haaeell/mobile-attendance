import { useQuery } from '@tanstack/react-query';

import { getClassroom } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';
import type { Classroom } from '@/types/classroom';

export function useClassroom(id: number) {
  return useQuery<Classroom, NormalizedApiError>({
    queryKey: ['classrooms', 'detail', id],
    queryFn: () => getClassroom(id),
    enabled: Number.isFinite(id),
  });
}
