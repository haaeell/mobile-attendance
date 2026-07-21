import { useQuery } from '@tanstack/react-query';

import { getStudent } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { Student } from '@/types/student';

export function useStudent(id: number) {
  return useQuery<Student, NormalizedApiError>({
    queryKey: ['students', 'detail', id],
    queryFn: () => getStudent(id),
    enabled: Number.isFinite(id),
  });
}
