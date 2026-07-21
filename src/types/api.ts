/**
 * Bentuk response standar backend (lihat App\Support\ApiResponse di sisi
 * server): selalu ada `success`, lalu salah satu dari `data` / `errors`.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Error yang sudah dinormalisasi oleh API client — inilah bentuk yang
 * ditangkap oleh pemanggil (bukan AxiosError mentah).
 */
export interface NormalizedApiError {
  message: string;
  status: number | null;
  errorCode: string | null;
  errors: Record<string, string[]> | null;
  isNetworkError: boolean;
}
