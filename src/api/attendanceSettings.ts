import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type {
  AttendanceSetting,
  AttendanceSettingFilters,
  AttendanceSettingPayload,
} from '@/types/attendanceSetting';

export async function getAttendanceSettings(
  filters: AttendanceSettingFilters & { page?: number },
): Promise<ApiPaginatedResponse<AttendanceSetting>> {
  const response = await apiClient.get<ApiPaginatedResponse<AttendanceSetting>>('/attendance-settings', {
    params: filters,
  });

  return response.data;
}

export async function getAttendanceSetting(id: number): Promise<AttendanceSetting> {
  const response = await apiClient.get<ApiSuccessResponse<AttendanceSetting>>(`/attendance-settings/${id}`);

  return response.data.data;
}

export async function createAttendanceSetting(
  payload: AttendanceSettingPayload,
): Promise<AttendanceSetting> {
  const response = await apiClient.post<ApiSuccessResponse<AttendanceSetting>>(
    '/attendance-settings',
    payload,
  );

  return response.data.data;
}

export async function updateAttendanceSetting(
  id: number,
  payload: AttendanceSettingPayload,
): Promise<AttendanceSetting> {
  const response = await apiClient.put<ApiSuccessResponse<AttendanceSetting>>(
    `/attendance-settings/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteAttendanceSetting(id: number): Promise<void> {
  await apiClient.delete(`/attendance-settings/${id}`);
}

export async function activateAttendanceSetting(id: number): Promise<AttendanceSetting> {
  const response = await apiClient.patch<ApiSuccessResponse<AttendanceSetting>>(
    `/attendance-settings/${id}/activate`,
  );

  return response.data.data;
}
