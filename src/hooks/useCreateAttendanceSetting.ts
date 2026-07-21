import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAttendanceSetting } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSetting, AttendanceSettingPayload } from '@/types/attendanceSetting';

export function useCreateAttendanceSetting() {
  const queryClient = useQueryClient();

  return useMutation<AttendanceSetting, NormalizedApiError, AttendanceSettingPayload>({
    mutationFn: createAttendanceSetting,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
    },
  });
}
