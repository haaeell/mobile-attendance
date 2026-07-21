import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAttendanceSetting } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';

export function useDeleteAttendanceSetting() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, number>({
    mutationFn: deleteAttendanceSetting,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
    },
  });
}
