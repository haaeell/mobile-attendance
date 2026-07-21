import { useInfiniteQuery } from '@tanstack/react-query';

import { getTeachers } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { TeacherFilters } from '@/types/teacher';

export function useTeachers(filters: TeacherFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getTeachers>>, NormalizedApiError>({
    queryKey: ['teachers', 'list', filters],
    queryFn: ({ pageParam }) => getTeachers({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
