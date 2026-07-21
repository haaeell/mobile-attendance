import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Holiday, HolidayFilters, HolidayPayload } from '@/types/holiday';

export async function getHolidays(
  filters: HolidayFilters & { page?: number },
): Promise<ApiPaginatedResponse<Holiday>> {
  const response = await apiClient.get<ApiPaginatedResponse<Holiday>>('/holidays', {
    params: filters,
  });

  return response.data;
}

export async function getHoliday(id: number): Promise<Holiday> {
  const response = await apiClient.get<ApiSuccessResponse<Holiday>>(`/holidays/${id}`);

  return response.data.data;
}

export async function createHoliday(payload: HolidayPayload): Promise<Holiday> {
  const response = await apiClient.post<ApiSuccessResponse<Holiday>>('/holidays', payload);

  return response.data.data;
}

export async function updateHoliday(id: number, payload: HolidayPayload): Promise<Holiday> {
  const response = await apiClient.put<ApiSuccessResponse<Holiday>>(`/holidays/${id}`, payload);

  return response.data.data;
}

export async function deleteHoliday(id: number): Promise<void> {
  await apiClient.delete(`/holidays/${id}`);
}
