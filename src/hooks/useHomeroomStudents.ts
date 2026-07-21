import { useInfiniteQuery } from '@tanstack/react-query';

import { getHomeroomStudents } from '@/api/homeroom';
import type { NormalizedApiError } from '@/types/api';

export function useHomeroomStudents() {
  return useInfiniteQuery<Awaited<ReturnType<typeof getHomeroomStudents>>, NormalizedApiError>({
    queryKey: ['homeroom', 'students'],
    queryFn: ({ pageParam }) => getHomeroomStudents(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
