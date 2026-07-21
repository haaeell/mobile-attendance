import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAttendanceSetting } from '@/api/attendanceSettings';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSetting, AttendanceSettingPayload } from '@/types/attendanceSetting';

export function useUpdateAttendanceSetting(id: number) {
  const queryClient = useQueryClient();

  return useMutation<AttendanceSetting, NormalizedApiError, AttendanceSettingPayload>({
    mutationFn: (payload) => updateAttendanceSetting(id, payload),
    retry: false,
    onSuccess: (setting) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
      queryClient.setQueryData(['attendance-settings', 'detail', id], setting);
    },
  });
}
