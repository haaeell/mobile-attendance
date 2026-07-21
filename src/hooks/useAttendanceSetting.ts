import { useQuery } from '@tanstack/react-query';

import { getAttendanceSetting } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSetting } from '@/types/attendanceSetting';

export function useAttendanceSetting(id: number) {
  return useQuery<AttendanceSetting, NormalizedApiError>({
    queryKey: ['attendance-settings', 'detail', id],
    queryFn: () => getAttendanceSetting(id),
    enabled: Number.isFinite(id),
  });
}
