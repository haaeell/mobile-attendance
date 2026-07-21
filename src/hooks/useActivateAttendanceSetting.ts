import { useMutation, useQueryClient } from '@tanstack/react-query';

import { activateAttendanceSetting } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSetting } from '@/types/attendanceSetting';

export function useActivateAttendanceSetting() {
  const queryClient = useQueryClient();

  return useMutation<AttendanceSetting, NormalizedApiError, number>({
    mutationFn: activateAttendanceSetting,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
    },
  });
}
