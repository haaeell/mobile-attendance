import { apiClient } from '@/api/client';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';
import type { Classroom } from '@/types/auth';
import type { ClassroomOption } from '@/types/attendance';
import type {
  Classroom as ClassroomDetail,
  ClassroomFilters,
  ClassroomPayload,
} from '@/types/classroom';

interface ClassroomListItem {
  id: number;
  name: string;
}

const MAX_PAGES = 20;

/**
 * Backend memaginasi GET /classrooms (default 15/halaman) dan tidak
 * menerima parameter per_page kustom, jadi seluruh halaman diambil di sini
 * agar filter kelas mencakup semua kelas (dibatasi MAX_PAGES sebagai jaring
 * pengaman). Hanya admin yang punya akses ke endpoint ini.
 */
export async function getAllClassroomOptions(): Promise<ClassroomOption[]> {
  const options: ClassroomOption[] = [];
  let page = 1;

  for (let i = 0; i < MAX_PAGES; i++) {
    const response = await apiClient.get<ApiPaginatedResponse<ClassroomListItem>>('/classrooms', {
      params: { page },
    });

    options.push(...response.data.data.map((classroom) => ({ id: classroom.id, name: classroom.name })));

    if (response.data.meta.current_page >= response.data.meta.last_page) {
      break;
    }

    page += 1;
  }

  return options;
}

/**
 * Sama seperti {@link getAllClassroomOptions}, tapi mengembalikan field
 * lengkap (termasuk `academic_year_id`) supaya form siswa bisa memfilter
 * pilihan kelas berdasarkan tahun ajaran yang dipilih.
 */
export async function getAllClassroomsDetailed(): Promise<Classroom[]> {
  const classrooms: Classroom[] = [];
  let page = 1;

  for (let i = 0; i < MAX_PAGES; i++) {
    const response = await apiClient.get<ApiPaginatedResponse<Classroom>>('/classrooms', {
      params: { page },
    });

    classrooms.push(...response.data.data);

    if (response.data.meta.current_page >= response.data.meta.last_page) {
      break;
    }

    page += 1;
  }

  return classrooms;
}

export async function getClassrooms(
  filters: ClassroomFilters & { page?: number },
): Promise<ApiPaginatedResponse<ClassroomDetail>> {
  const response = await apiClient.get<ApiPaginatedResponse<ClassroomDetail>>('/classrooms', {
    params: filters,
  });

  return response.data;
}

export async function getClassroom(id: number): Promise<ClassroomDetail> {
  const response = await apiClient.get<ApiSuccessResponse<ClassroomDetail>>(`/classrooms/${id}`);

  return response.data.data;
}

export async function createClassroom(payload: ClassroomPayload): Promise<ClassroomDetail> {
  const response = await apiClient.post<ApiSuccessResponse<ClassroomDetail>>('/classrooms', payload);

  return response.data.data;
}

export async function updateClassroom(id: number, payload: ClassroomPayload): Promise<ClassroomDetail> {
  const response = await apiClient.put<ApiSuccessResponse<ClassroomDetail>>(`/classrooms/${id}`, payload);

  return response.data.data;
}

export async function deleteClassroom(id: number): Promise<void> {
  await apiClient.delete(`/classrooms/${id}`);
}

/**
 * `teacherId: null` melepas wali kelas (backend menerima `teacher_id: null`
 * secara eksplisit untuk unassign).
 */
export async function updateClassroomHomeroomTeacher(
  id: number,
  teacherId: number | null,
): Promise<ClassroomDetail> {
  const response = await apiClient.put<ApiSuccessResponse<ClassroomDetail>>(
    `/classrooms/${id}/homeroom-teacher`,
    { teacher_id: teacherId },
  );

  return response.data.data;
}
