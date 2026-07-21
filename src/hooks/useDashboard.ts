import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/api/dashboard';
import type { NormalizedApiError } from '@/types/api';
import type { DashboardData } from '@/types/dashboard';

export const dashboardQueryKey = ['dashboard'] as const;

export function useDashboard() {
  return useQuery<DashboardData, NormalizedApiError>({
    queryKey: dashboardQueryKey,
    queryFn: getDashboard,
  });
}
