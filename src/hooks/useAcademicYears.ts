import { useInfiniteQuery } from '@tanstack/react-query';

import { getAcademicYears } from '@/api/academicYears';
import type { NormalizedApiError } from '@/types/api';

export function useAcademicYears() {
  return useInfiniteQuery<Awaited<ReturnType<typeof getAcademicYears>>, NormalizedApiError>({
    queryKey: ['academic-years', 'list'],
    queryFn: ({ pageParam }) => getAcademicYears(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
