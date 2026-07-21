import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bulkGenerateStudentBarcodes } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';

export function useBulkGenerateStudentBarcodes() {
  const queryClient = useQueryClient();

  return useMutation<number, NormalizedApiError, { student_ids?: number[]; classroom_id?: number }>({
    mutationFn: bulkGenerateStudentBarcodes,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
    },
  });
}
