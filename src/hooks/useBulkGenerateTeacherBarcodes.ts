import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bulkGenerateTeacherBarcodes } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';

export function useBulkGenerateTeacherBarcodes() {
  const queryClient = useQueryClient();

  return useMutation<number, NormalizedApiError, { teacher_ids?: number[] }>({
    mutationFn: bulkGenerateTeacherBarcodes,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['barcodes'] });
    },
  });
}
