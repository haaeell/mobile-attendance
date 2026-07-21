import { apiClient } from '@/api/client';
import type { ApiSuccessResponse } from '@/types/api';
import type { ScanRequestPayload, ScanSuccessData } from '@/types/scan';

export async function scanBarcode(payload: ScanRequestPayload): Promise<ScanSuccessData> {
  const response = await apiClient.post<ApiSuccessResponse<ScanSuccessData>>(
    '/attendance/scan',
    payload,
  );

  return response.data.data;
}
