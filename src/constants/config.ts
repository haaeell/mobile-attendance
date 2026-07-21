/**
 * Konfigurasi environment terpusat. Semua akses ke `process.env.EXPO_PUBLIC_*`
 * di seluruh aplikasi HARUS melalui modul ini, bukan langsung, supaya ada satu
 * titik validasi dan satu sumber kebenaran.
 */

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

function assertApiUrl(value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL belum diset. Salin .env.example menjadi .env dan isi dengan alamat ' +
        'backend (gunakan alamat IP LAN komputer Anda, BUKAN "localhost"/"127.0.0.1" — HP fisik ' +
        'tidak bisa mengakses localhost milik komputer pengembang).',
    );
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(value)) {
    console.warn(
      '[config] EXPO_PUBLIC_API_URL menunjuk ke localhost/127.0.0.1. Ini hanya akan berfungsi di ' +
        'emulator/simulator pada mesin yang sama, TIDAK akan berfungsi di HP fisik. Gunakan alamat ' +
        'IP LAN komputer Anda, contoh: http://192.168.1.10:8000/api',
    );
  }

  return value.replace(/\/+$/, '');
}

export const API_URL = assertApiUrl(rawApiUrl);

export const API_TIMEOUT_MS = 15_000;

export const IS_DEV = __DEV__;
