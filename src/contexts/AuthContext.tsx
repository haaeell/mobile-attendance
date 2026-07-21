import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { login as loginApi, logout as logoutApi, me as meApi } from '@/api/auth';
import { onUnauthorized } from '@/api/client';
import { getToken, removeToken, setToken } from '@/services/authStorage';
import type { AuthenticatedUser } from '@/types/auth';
import { getDeviceName } from '@/utils/device';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Sedang memuat sesi awal (auto login) saat aplikasi pertama dibuka. */
  isInitializing: boolean;
  /** Sedang memproses permintaan login. */
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto login: bila ada token tersimpan di SecureStore, validasi ke server
  // lewat GET /auth/me. Bila token sudah tidak valid/kedaluwarsa, interceptor
  // di api/client.ts akan menghapusnya otomatis (lihat handler 401 di bawah).
  useEffect(() => {
    let isActive = true;

    (async () => {
      const storedToken = await getToken();

      if (!storedToken) {
        if (isActive) setIsInitializing(false);
        return;
      }

      try {
        const profile = await meApi();

        if (isActive) {
          setTokenState(storedToken);
          setUser(profile);
        }
      } catch {
        if (isActive) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (isActive) setIsInitializing(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  // Token expired/invalid saat request APAPUN (bukan hanya saat init) akan
  // memicu ini lewat onUnauthorized di api/client.ts, sehingga sesi lokal
  // ikut dianggap habis dan rute terproteksi otomatis redirect ke login.
  useEffect(() => {
    return onUnauthorized(() => {
      setTokenState(null);
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoggingIn(true);

    try {
      const result = await loginApi({ email, password, device_name: getDeviceName() });
      await setToken(result.token);

      try {
        const profile = await meApi();
        setTokenState(result.token);
        setUser(profile);
      } catch (profileError) {
        // Token tersimpan tapi profil gagal diambil — jangan sisakan sesi
        // setengah jadi, bersihkan lagi supaya state tetap konsisten.
        await removeToken();
        throw profileError;
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Tetap anggap logout berhasil secara lokal walau request ke server
      // gagal (mis. tidak ada koneksi) — token lokal tetap harus dihapus.
    } finally {
      await removeToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isInitializing,
      isLoggingIn,
      login,
      logout,
    }),
    [user, token, isInitializing, isLoggingIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }

  return context;
}
