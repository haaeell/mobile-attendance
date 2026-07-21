import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { BarcodeStatus, Student, StudentFilters, StudentPayload } from '@/types/student';

export async function getStudents(
  filters: StudentFilters & { page?: number },
): Promise<ApiPaginatedResponse<Student>> {
  const response = await apiClient.get<ApiPaginatedResponse<Student>>('/students', {
    params: filters,
  });

  return response.data;
}

export async function getStudent(id: number): Promise<Student> {
  const response = await apiClient.get<ApiSuccessResponse<Student>>(`/students/${id}`);

  return response.data.data;
}

export async function createStudent(payload: StudentPayload): Promise<Student> {
  const response = await apiClient.post<ApiSuccessResponse<Student>>('/students', payload);

  return response.data.data;
}

export async function updateStudent(id: number, payload: StudentPayload): Promise<Student> {
  const response = await apiClient.put<ApiSuccessResponse<Student>>(`/students/${id}`, payload);

  return response.data.data;
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(`/students/${id}`);
}

export async function updateStudentStatus(id: number, isActive: boolean): Promise<Student> {
  const response = await apiClient.patch<ApiSuccessResponse<Student>>(`/students/${id}/status`, {
    is_active: isActive,
  });

  return response.data.data;
}

export async function regenerateStudentBarcode(id: number): Promise<Student> {
  const response = await apiClient.post<ApiSuccessResponse<Student>>(`/students/${id}/barcode/regenerate`);

  return response.data.data;
}

export async function updateStudentBarcodeStatus(
  id: number,
  barcodeStatus: BarcodeStatus,
): Promise<Student> {
  const response = await apiClient.patch<ApiSuccessResponse<Student>>(`/students/${id}/barcode/status`, {
    barcode_status: barcodeStatus,
  });

  return response.data.data;
}
