import { useMutation } from '@tanstack/react-query';

import { scanBarcode } from '@/api/scan';
import type { NormalizedApiError } from '@/types/api';
import type { ScanRequestPayload, ScanSuccessData } from '@/types/scan';

/**
 * `retry: false` disengaja — instruksi eksplisit: jangan retry mutation
 * scan secara otomatis (setiap percobaan harus atas aksi pengguna/scan
 * fisik berikutnya, bukan retry silent yang bisa memicu duplikasi niat).
 */
export function useScanMutation() {
  return useMutation<ScanSuccessData, NormalizedApiError, ScanRequestPayload>({
    mutationFn: scanBarcode,
    retry: false,
  });
}
