import { useInfiniteQuery } from '@tanstack/react-query';

import { getAttendanceReport } from '@/api/reports';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceReportFilters } from '@/types/report';

export function useAttendanceReport(filters: AttendanceReportFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getAttendanceReport>>, NormalizedApiError>({
    queryKey: ['reports', 'attendance', filters],
    queryFn: ({ pageParam }) => getAttendanceReport({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
