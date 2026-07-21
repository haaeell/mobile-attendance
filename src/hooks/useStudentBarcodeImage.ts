import { useQuery } from '@tanstack/react-query';

import { getStudentBarcodeImage } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';

export function useStudentBarcodeImage(studentId: number) {
  return useQuery<ArrayBuffer, NormalizedApiError>({
    queryKey: ['barcodes', 'students', 'image', studentId],
    queryFn: () => getStudentBarcodeImage(studentId),
    enabled: Number.isFinite(studentId),
    staleTime: 60_000,
  });
}
