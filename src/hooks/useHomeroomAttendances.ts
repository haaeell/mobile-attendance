import { useQuery } from '@tanstack/react-query';

import { getHomeroomAttendances } from '@/api/homeroom';
import type { NormalizedApiError } from '@/types/api';
import type { HomeroomAttendanceRow } from '@/types/homeroom';

export function useHomeroomAttendances(date: string) {
  return useQuery<HomeroomAttendanceRow[], NormalizedApiError>({
    queryKey: ['homeroom', 'attendances', date],
    queryFn: () => getHomeroomAttendances(date),
  });
}
