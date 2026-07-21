import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createHoliday } from '@/api/holidays';
import type { NormalizedApiError } from '@/types/api';
import type { Holiday, HolidayPayload } from '@/types/holiday';

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation<Holiday, NormalizedApiError, HolidayPayload>({
    mutationFn: createHoliday,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
