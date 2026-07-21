import { useQuery } from '@tanstack/react-query';

import { getTeacher } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher } from '@/types/teacher';

export function useTeacher(id: number) {
  return useQuery<Teacher, NormalizedApiError>({
    queryKey: ['teachers', 'detail', id],
    queryFn: () => getTeacher(id),
    enabled: Number.isFinite(id),
  });
}
