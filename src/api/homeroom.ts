import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Attendance } from '@/types/attendance';
import type { HomeroomAttendanceRow, HomeroomClassroomData, UpdateHomeroomStatusPayload } from '@/types/homeroom';
import type { Student } from '@/types/student';

export async function getHomeroomClassroom(): Promise<HomeroomClassroomData | null> {
  const response = await apiClient.get<ApiSuccessResponse<HomeroomClassroomData | null>>(
    '/homeroom/classroom',
  );

  return response.data.data;
}

export async function getHomeroomStudents(page?: number): Promise<ApiPaginatedResponse<Student>> {
  const response = await apiClient.get<ApiPaginatedResponse<Student>>('/homeroom/students', {
    params: { page },
  });

  return response.data;
}

export async function getHomeroomAttendances(date?: string): Promise<HomeroomAttendanceRow[]> {
  const response = await apiClient.get<ApiSuccessResponse<HomeroomAttendanceRow[]>>(
    '/homeroom/attendances',
    { params: { date } },
  );

  return response.data.data;
}

export async function updateHomeroomAttendanceStatus(
  payload: UpdateHomeroomStatusPayload,
): Promise<Attendance> {
  const formData = new FormData();
  formData.append('student_id', String(payload.student_id));
  formData.append('date', payload.date);
  formData.append('status', payload.status);

  if (payload.notes) {
    formData.append('notes', payload.notes);
  }

  if (payload.sick_letter) {
    // React Native's FormData menerima objek `{ uri, name, type }` sebagai
    // representasi file — bukan Blob seperti di web.
    formData.append('sick_letter', payload.sick_letter as unknown as Blob);
  }

  const response = await apiClient.post<ApiSuccessResponse<Attendance>>(
    '/homeroom/attendances/status',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data.data;
}
