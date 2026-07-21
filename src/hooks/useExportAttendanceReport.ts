import { useMutation } from '@tanstack/react-query';

import type { BinaryFileResult } from '@/api/barcodes';
import { exportAttendanceReportExcel, exportAttendanceReportPdf } from '@/api/reports';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceReportFilters } from '@/types/report';

export function useExportAttendanceReportExcel() {
  return useMutation<BinaryFileResult, NormalizedApiError, AttendanceReportFilters>({
    mutationFn: exportAttendanceReportExcel,
    retry: false,
  });
}

export function useExportAttendanceReportPdf() {
  return useMutation<BinaryFileResult, NormalizedApiError, AttendanceReportFilters>({
    mutationFn: exportAttendanceReportPdf,
    retry: false,
  });
}
