import { useInfiniteQuery } from '@tanstack/react-query';

import { getClassrooms } from '@/api/classrooms';
import type { NormalizedApiError } from '@/types/api';
import type { ClassroomFilters } from '@/types/classroom';

export function useClassrooms(filters: ClassroomFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getClassrooms>>, NormalizedApiError>({
    queryKey: ['classrooms', 'list', filters],
    queryFn: ({ pageParam }) => getClassrooms({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
