import { apiClient } from '@/api/client';
import type { ApiSuccessResponse } from '@/types/api';
import type { DashboardData } from '@/types/dashboard';

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardData>>('/dashboard');

  return response.data.data;
}
