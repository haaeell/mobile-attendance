import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { BarcodeStatus } from '@/types/student';
import type { Teacher, TeacherFilters, TeacherPayload } from '@/types/teacher';

export async function getTeachers(
  filters: TeacherFilters & { page?: number },
): Promise<ApiPaginatedResponse<Teacher>> {
  const response = await apiClient.get<ApiPaginatedResponse<Teacher>>('/teachers', {
    params: filters,
  });

  return response.data;
}

export interface TeacherOption {
  id: number;
  name: string;
}

const MAX_OPTION_PAGES = 20;

/**
 * Backend memaginasi GET /teachers dan tidak menerima per_page kustom, jadi
 * seluruh halaman diambil di sini agar picker wali kelas mencakup semua guru
 * aktif (dibatasi MAX_OPTION_PAGES sebagai jaring pengaman).
 */
export async function getAllTeacherOptions(): Promise<TeacherOption[]> {
  const options: TeacherOption[] = [];
  let page = 1;

  for (let i = 0; i < MAX_OPTION_PAGES; i++) {
    const response = await apiClient.get<ApiPaginatedResponse<Teacher>>('/teachers', {
      params: { page, is_active: true },
    });

    options.push(...response.data.data.map((teacher) => ({ id: teacher.id, name: teacher.name })));

    if (response.data.meta.current_page >= response.data.meta.last_page) {
      break;
    }

    page += 1;
  }

  return options;
}

export async function getTeacher(id: number): Promise<Teacher> {
  const response = await apiClient.get<ApiSuccessResponse<Teacher>>(`/teachers/${id}`);

  return response.data.data;
}

export async function createTeacher(payload: TeacherPayload): Promise<Teacher> {
  const response = await apiClient.post<ApiSuccessResponse<Teacher>>('/teachers', payload);

  return response.data.data;
}

export async function updateTeacher(id: number, payload: TeacherPayload): Promise<Teacher> {
  const response = await apiClient.put<ApiSuccessResponse<Teacher>>(`/teachers/${id}`, payload);

  return response.data.data;
}

export async function deleteTeacher(id: number): Promise<void> {
  await apiClient.delete(`/teachers/${id}`);
}

export async function updateTeacherStatus(id: number, isActive: boolean): Promise<Teacher> {
  const response = await apiClient.patch<ApiSuccessResponse<Teacher>>(`/teachers/${id}/status`, {
    is_active: isActive,
  });

  return response.data.data;
}

export async function regenerateTeacherBarcode(id: number): Promise<Teacher> {
  const response = await apiClient.post<ApiSuccessResponse<Teacher>>(`/teachers/${id}/barcode/regenerate`);

  return response.data.data;
}

export async function updateTeacherBarcodeStatus(
  id: number,
  barcodeStatus: BarcodeStatus,
): Promise<Teacher> {
  const response = await apiClient.patch<ApiSuccessResponse<Teacher>>(`/teachers/${id}/barcode/status`, {
    barcode_status: barcodeStatus,
  });

  return response.data.data;
}
