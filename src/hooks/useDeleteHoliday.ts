import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteHoliday } from '@/api/holidays';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteHoliday,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
