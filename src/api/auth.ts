import { apiClient } from '@/api/client';
import type { ApiSuccessResponse } from '@/types/api';
import type { AuthenticatedUser, LoginResponseData } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
  device_name: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponseData> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponseData>>('/auth/login', payload);

  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function me(): Promise<AuthenticatedUser> {
  const response = await apiClient.get<ApiSuccessResponse<AuthenticatedUser>>('/auth/me');

  return response.data.data;
}
