import { useInfiniteQuery } from '@tanstack/react-query';

import { getAttendanceSettings } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSettingFilters } from '@/types/attendanceSetting';

export function useAttendanceSettings(filters: AttendanceSettingFilters) {
  return useInfiniteQuery<Awaited<ReturnType<typeof getAttendanceSettings>>, NormalizedApiError>({
    queryKey: ['attendance-settings', 'list', filters],
    queryFn: ({ pageParam }) => getAttendanceSettings({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
  });
}
