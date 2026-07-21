import { useInfiniteQuery } from '@tanstack/react-query';

import { getStudents } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { StudentFilters } from '@/types/student';

export function useStudents(filters: StudentFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getStudents>>, NormalizedApiError>({
    queryKey: ['students', 'list', filters],
    queryFn: ({ pageParam }) => getStudents({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
