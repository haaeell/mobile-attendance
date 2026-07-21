import { apiClient } from '@/api/client';
import type { BinaryFileResult } from '@/api/barcodes';
import type { ApiSuccessResponse } from '@/types/api';
import type { AttendanceReportFilters, AttendanceReportPage } from '@/types/report';
import { parseFilenameFromContentDisposition } from '@/utils/fileDownload';

export async function getAttendanceReport(
  filters: AttendanceReportFilters & { page?: number },
): Promise<AttendanceReportPage> {
  const response = await apiClient.get<ApiSuccessResponse<AttendanceReportPage>>('/reports/attendance', {
    params: filters,
  });

  return response.data.data;
}

export async function exportAttendanceReportExcel(
  filters: AttendanceReportFilters,
): Promise<BinaryFileResult> {
  const response = await apiClient.get<ArrayBuffer>('/reports/attendance/export-excel', {
    responseType: 'arraybuffer',
    params: filters,
  });

  return {
    data: response.data,
    filename:
      parseFilenameFromContentDisposition(response.headers['content-disposition'] as string | undefined) ??
      'laporan-absensi.xlsx',
  };
}

export async function exportAttendanceReportPdf(filters: AttendanceReportFilters): Promise<BinaryFileResult> {
  const response = await apiClient.get<ArrayBuffer>('/reports/attendance/export-pdf', {
    responseType: 'arraybuffer',
    params: filters,
  });

  return {
    data: response.data,
    filename:
      parseFilenameFromContentDisposition(response.headers['content-disposition'] as string | undefined) ??
      'laporan-absensi.pdf',
  };
}
