import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Attendance, AttendanceFilters } from '@/types/attendance';

export async function getAttendances(
  filters: AttendanceFilters & { page?: number },
): Promise<ApiPaginatedResponse<Attendance>> {
  const response = await apiClient.get<ApiPaginatedResponse<Attendance>>('/attendances', {
    params: filters,
  });

  return response.data;
}

export async function getAttendancesToday(
  filters: Omit<AttendanceFilters, 'date' | 'start_date' | 'end_date'> & { page?: number },
): Promise<ApiPaginatedResponse<Attendance>> {
  const response = await apiClient.get<ApiPaginatedResponse<Attendance>>('/attendances/today', {
    params: filters,
  });

  return response.data;
}

export async function getAttendanceDetail(id: number): Promise<Attendance> {
  const response = await apiClient.get<ApiSuccessResponse<Attendance>>(`/attendances/${id}`);

  return response.data.data;
}
