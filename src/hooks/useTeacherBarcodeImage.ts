import { useQuery } from '@tanstack/react-query';

import { getTeacherBarcodeImage } from '@/api/barcodes';
import type { NormalizedApiError } from '@/types/api';

export function useTeacherBarcodeImage(teacherId: number) {
  return useQuery<ArrayBuffer, NormalizedApiError>({
    queryKey: ['barcodes', 'teachers', 'image', teacherId],
    queryFn: () => getTeacherBarcodeImage(teacherId),
    enabled: Number.isFinite(teacherId),
    staleTime: 60_000,
  });
}
