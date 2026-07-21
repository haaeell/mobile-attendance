import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTeacherBarcodeStatus } from '@/api/teachers';
import type { NormalizedApiError } from '@/types/api';
import type { BarcodeStatus } from '@/types/student';
import type { Teacher } from '@/types/teacher';

export function useUpdateTeacherBarcodeStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Teacher, NormalizedApiError, BarcodeStatus>({
    mutationFn: (barcodeStatus) => updateTeacherBarcodeStatus(id, barcodeStatus),
    retry: false,
    onSuccess: (teacher) => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'list'] });
      queryClient.setQueryData(['teachers', 'detail', id], teacher);
    },
  });
}
