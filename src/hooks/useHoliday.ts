import { useQuery } from '@tanstack/react-query';

import { getHoliday } from '@/api/holidays';
import type { NormalizedApiError } from '@/types/api';
import type { Holiday } from '@/types/holiday';

export function useHoliday(id: number) {
  return useQuery<Holiday, NormalizedApiError>({
    queryKey: ['holidays', 'detail', id],
    queryFn: () => getHoliday(id),
    enabled: Number.isFinite(id),
  });
}
