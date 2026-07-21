import { useInfiniteQuery } from '@tanstack/react-query';

import { getHolidays } from '@/api/holidays';
import type { NormalizedApiError } from '@/types/api';
import type { HolidayFilters } from '@/types/holiday';

export function useHolidays(filters: HolidayFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getHolidays>>, NormalizedApiError>({
    queryKey: ['holidays', 'list', filters],
    queryFn: ({ pageParam }) => getHolidays({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
