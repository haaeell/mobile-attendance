/**
 * Formatter tanggal & waktu Bahasa Indonesia. Dibungkus try/catch karena
 * dukungan `Intl` dengan locale non-default terkadang tidak lengkap pada
 * sebagian engine JS di Android — bila gagal, jatuh kembali ke nilai asli
 * daripada membuat layar crash.
 */

const LOCALE = 'id-ID';

export function formatDateLong(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    return new Intl.DateTimeFormat(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatDateShort(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    return new Intl.DateTimeFormat(LOCALE, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatTime(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    return `${new Intl.DateTimeFormat(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)} WIB`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Waktu relatif sederhana (mis. "5 menit lalu"), dipakai untuk daftar scan
 * terbaru. Untuk selisih lebih dari 24 jam, kembali ke tanggal+jam absolut.
 */
export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 0) {
    return formatTime(date);
  }
  if (diffSeconds < 60) {
    return 'Baru saja';
  }
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);

    return `${minutes} menit lalu`;
  }
  if (diffSeconds < 86_400) {
    const hours = Math.floor(diffSeconds / 3600);

    return `${hours} jam lalu`;
  }

  return `${formatDateShort(date)}, ${formatTime(date)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Sapaan berdasarkan jam saat ini (WIB): pagi/siang/sore/malam.
 */
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}
