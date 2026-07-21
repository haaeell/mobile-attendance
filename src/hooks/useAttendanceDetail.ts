import { useQuery } from '@tanstack/react-query';

import { getAttendanceDetail } from '@/api/attendances';
import type { NormalizedApiError } from '@/types/api';
import type { Attendance } from '@/types/attendance';

export function useAttendanceDetail(id: number) {
  return useQuery<Attendance, NormalizedApiError>({
    queryKey: ['attendances', 'detail', id],
    queryFn: () => getAttendanceDetail(id),
    enabled: Number.isFinite(id),
  });
}
