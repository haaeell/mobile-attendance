import { useInfiniteQuery } from '@tanstack/react-query';

import { getAttendances, getAttendancesToday } from '@/api/attendances';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceFilters } from '@/types/attendance';

function getNextPageParam(lastPage: { meta: { current_page: number; last_page: number } }) {
  return lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined;
}

export function useAttendancesToday(filters: Omit<AttendanceFilters, 'date' | 'start_date' | 'end_date'>) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getAttendancesToday>>, NormalizedApiError>({
    queryKey: ['attendances', 'today', filters],
    queryFn: ({ pageParam }) => getAttendancesToday({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam,
  });
}

export function useAttendances(filters: AttendanceFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getAttendances>>, NormalizedApiError>({
    queryKey: ['attendances', 'list', filters],
    queryFn: ({ pageParam }) => getAttendances({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam,
  });
}
