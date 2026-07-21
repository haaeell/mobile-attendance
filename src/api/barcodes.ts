import { apiClient } from '@/api/client';
import type { ApiSuccessResponse } from '@/types/api';
import { parseFilenameFromContentDisposition } from '@/utils/fileDownload';

export interface BinaryFileResult {
  data: ArrayBuffer;
  filename: string;
}

export async function getStudentBarcodeImage(studentId: number): Promise<ArrayBuffer> {
  const response = await apiClient.get<ArrayBuffer>(`/barcodes/students/${studentId}/image`, {
    responseType: 'arraybuffer',
  });

  return response.data;
}

export async function getTeacherBarcodeImage(teacherId: number): Promise<ArrayBuffer> {
  const response = await apiClient.get<ArrayBuffer>(`/barcodes/teachers/${teacherId}/image`, {
    responseType: 'arraybuffer',
  });

  return response.data;
}

export async function printStudentBarcodes(params: {
  classroomId?: number;
  studentIds?: number[];
}): Promise<BinaryFileResult> {
  const response = await apiClient.get<ArrayBuffer>('/barcodes/students/print', {
    responseType: 'arraybuffer',
    params: { classroom_id: params.classroomId, student_ids: params.studentIds },
  });

  return {
    data: response.data,
    filename:
      parseFilenameFromContentDisposition(response.headers['content-disposition'] as string | undefined) ??
      'kartu-barcode-siswa.pdf',
  };
}

export async function printTeacherBarcodes(params: { teacherIds?: number[] }): Promise<BinaryFileResult> {
  const response = await apiClient.get<ArrayBuffer>('/barcodes/teachers/print', {
    responseType: 'arraybuffer',
    params: { teacher_ids: params.teacherIds },
  });

  return {
    data: response.data,
    filename:
      parseFilenameFromContentDisposition(response.headers['content-disposition'] as string | undefined) ??
      'kartu-barcode-guru.pdf',
  };
}

export async function bulkGenerateStudentBarcodes(payload: {
  student_ids?: number[];
  classroom_id?: number;
}): Promise<number> {
  const response = await apiClient.post<ApiSuccessResponse<{ regenerated: number }>>(
    '/barcodes/students/bulk-generate',
    payload,
  );

  return response.data.data.regenerated;
}

export async function bulkGenerateTeacherBarcodes(payload: { teacher_ids?: number[] }): Promise<number> {
  const response = await apiClient.post<ApiSuccessResponse<{ regenerated: number }>>(
    '/barcodes/teachers/bulk-generate',
    payload,
  );

  return response.data.data.regenerated;
}
