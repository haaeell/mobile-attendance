import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/LoadingView';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Entry point router: tunggu proses auto login selesai, lalu arahkan sesuai
 * status login.
 */
export default function Index() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingView message="Memuat sesi..." />;
  }

  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}
