import { useMutation } from '@tanstack/react-query';

import { printTeacherBarcodes } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';
import type { BinaryFileResult } from '@/api/barcodes';

export function usePrintTeacherBarcodes() {
  return useMutation<BinaryFileResult, NormalizedApiError, { teacherIds?: number[] }>({
    mutationFn: printTeacherBarcodes,
    retry: false,
  });
}
