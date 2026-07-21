/**
 * Peta error_code dari backend (lihat App\Enums\ScanResult) ke pesan
 * Bahasa Indonesia yang ramah pengguna untuk ditampilkan di layar scan.
 */
export const SCAN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_BARCODE: 'Barcode tidak ditemukan. Pastikan kartu/barcode valid.',
  INACTIVE_BARCODE: 'Barcode ini sudah tidak aktif. Hubungi admin.',
  INACTIVE_SUBJECT: 'Pemilik barcode ini sedang tidak aktif.',
  HOLIDAY: 'Hari ini hari libur, absensi tidak diperlukan.',
  SCHEDULE_NOT_CONFIGURED: 'Jadwal absensi belum diatur untuk hari ini.',
  TOO_EARLY: 'Belum waktunya absen masuk.',
  CHECK_IN_CLOSED: 'Waktu absen masuk sudah ditutup.',
  CHECKOUT_NOT_ALLOWED: 'Belum waktunya pulang.',
  ALREADY_COMPLETED: 'Sudah tercatat masuk dan pulang hari ini.',
  SCAN_FAILED: 'Scan gagal diproses. Silakan coba lagi.',
};

export function mapScanErrorMessage(errorCode: string | null | undefined, fallback: string): string {
  if (!errorCode) {
    return fallback;
  }

  return SCAN_ERROR_MESSAGES[errorCode] ?? fallback;
}
