import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateStudentBarcodeStatus } from '@/api/students';
import type { NormalizedApiError } from '@/types/api';
import type { BarcodeStatus, Student } from '@/types/student';

export function useUpdateStudentBarcodeStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Student, NormalizedApiError, BarcodeStatus>({
    mutationFn: (barcodeStatus) => updateStudentBarcodeStatus(id, barcodeStatus),
    retry: false,
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['students', 'list'] });
      queryClient.setQueryData(['students', 'detail', id], student);
    },
  });
}
