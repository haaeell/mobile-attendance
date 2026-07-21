import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { AcademicYear, AcademicYearPayload } from '@/types/academicYear';

export interface AcademicYearOption {
  id: number;
  name: string;
  is_active: boolean;
}

const MAX_PAGES = 20;

/**
 * Backend memaginasi GET /academic-years dan tidak menerima per_page kustom,
 * jadi seluruh halaman diambil di sini agar picker tahun ajaran mencakup
 * semua data (dibatasi MAX_PAGES sebagai jaring pengaman). Hanya admin yang
 * punya akses ke endpoint ini.
 */
export async function getAllAcademicYearOptions(): Promise<AcademicYearOption[]> {
  const options: AcademicYearOption[] = [];
  let page = 1;

  for (let i = 0; i < MAX_PAGES; i++) {
    const response = await apiClient.get<ApiPaginatedResponse<AcademicYearOption>>('/academic-years', {
      params: { page },
    });

    options.push(
      ...response.data.data.map((year) => ({ id: year.id, name: year.name, is_active: year.is_active })),
    );

    if (response.data.meta.current_page >= response.data.meta.last_page) {
      break;
    }

    page += 1;
  }

  return options;
}

export async function getAcademicYears(page?: number): Promise<ApiPaginatedResponse<AcademicYear>> {
  const response = await apiClient.get<ApiPaginatedResponse<AcademicYear>>('/academic-years', {
    params: { page },
  });

  return response.data;
}

export async function getAcademicYear(id: number): Promise<AcademicYear> {
  const response = await apiClient.get<ApiSuccessResponse<AcademicYear>>(`/academic-years/${id}`);

  return response.data.data;
}

export async function createAcademicYear(payload: AcademicYearPayload): Promise<AcademicYear> {
  const response = await apiClient.post<ApiSuccessResponse<AcademicYear>>('/academic-years', payload);

  return response.data.data;
}

export async function updateAcademicYear(id: number, payload: AcademicYearPayload): Promise<AcademicYear> {
  const response = await apiClient.put<ApiSuccessResponse<AcademicYear>>(`/academic-years/${id}`, payload);

  return response.data.data;
}

export async function deleteAcademicYear(id: number): Promise<void> {
  await apiClient.delete(`/academic-years/${id}`);
}

export async function activateAcademicYear(id: number): Promise<AcademicYear> {
  const response = await apiClient.patch<ApiSuccessResponse<AcademicYear>>(
    `/academic-years/${id}/activate`,
  );

  return response.data.data;
}
