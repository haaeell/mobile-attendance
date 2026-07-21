import { useMutation } from '@tanstack/react-query';

import { printStudentBarcodes } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';
import type { BinaryFileResult } from '@/api/barcodes';

export function usePrintStudentBarcodes() {
  return useMutation<BinaryFileResult, NormalizedApiError, { classroomId?: number; studentIds?: number[] }>({
    mutationFn: printStudentBarcodes,
    retry: false,
  });
}
