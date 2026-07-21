import { create as createAxiosClient, type AxiosError } from 'axios';

import { API_TIMEOUT_MS, API_URL } from '@/constants/config';
import { getToken, removeToken } from '@/services/authStorage';
import type { ApiErrorResponse, NormalizedApiError } from '@/types/api';

/**
 * Dipanggil setiap kali server membalas 401 (token tidak valid/kedaluwarsa).
 * Modul lain (mis. AuthContext, saat autentikasi dikerjakan pada tahap
 * berikutnya) bisa mendaftarkan listener di sini untuk mis. mengarahkan
 * pengguna kembali ke layar login.
 */
type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export const apiClient = createAxiosClient({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      await removeToken();
      unauthorizedListeners.forEach((listener) => listener());
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedApiError {
  const status = error.response?.status ?? null;
  const body = error.response?.data;

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED' && /timeout/i.test(error.message);

    return {
      message: isTimeout
        ? 'Permintaan waktu habis (timeout). Periksa koneksi internet Anda dan coba lagi.'
        : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      status: null,
      errorCode: isTimeout ? 'TIMEOUT' : null,
      errors: null,
      isNetworkError: true,
    };
  }

  return {
    message: body?.message ?? 'Terjadi kesalahan yang tidak diketahui.',
    status,
    errorCode: body?.error_code ?? null,
    errors: body?.errors ?? null,
    isNetworkError: false,
  };
}
