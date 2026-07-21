import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateHoliday } from '@/api/holidays';
import type { NormalizedApiError } from '@/types/api';
import type { Holiday, HolidayPayload } from '@/types/holiday';

export function useUpdateHoliday(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Holiday, NormalizedApiError, HolidayPayload>({
    mutationFn: (payload) => updateHoliday(id, payload),
    retry: false,
    onSuccess: (holiday) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.setQueryData(['holidays', 'detail', id], holiday);
    },
  });
}
