import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateHomeroomAttendanceStatus } from '@/api/homeroom';
import type { Attendance } from '@/types/attendance';
import type { NormalizedApiError } from '@/types/api';
import type { UpdateHomeroomStatusPayload } from '@/types/homeroom';

/**
 * `retry: false` disengaja — ini mengirim file & mengubah data, tidak boleh
 * di-retry otomatis di belakang layar tanpa sepengetahuan pengguna.
 */
export function useUpdateHomeroomStatus() {
  const queryClient = useQueryClient();

  return useMutation<Attendance, NormalizedApiError, UpdateHomeroomStatusPayload>({
    mutationFn: updateHomeroomAttendanceStatus,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeroom', 'attendances'] });
      queryClient.invalidateQueries({ queryKey: ['homeroom', 'classroom'] });
    },
  });
}
