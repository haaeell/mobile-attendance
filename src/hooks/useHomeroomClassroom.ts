import { useQuery } from '@tanstack/react-query';

import { getHomeroomClassroom } from '@/api/homeroom';
import type { NormalizedApiError } from '@/types/api';
import type { HomeroomClassroomData } from '@/types/homeroom';

export function useHomeroomClassroom() {
  return useQuery<HomeroomClassroomData | null, NormalizedApiError>({
    queryKey: ['homeroom', 'classroom'],
    queryFn: getHomeroomClassroom,
  });
}
