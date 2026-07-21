import { useQuery } from '@tanstack/react-query';

import { getAllTeacherOptions } from '@/api/teachers';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hanya admin yang punya akses ke GET /teachers.
 */
export function useTeacherOptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['teachers', 'options'],
    queryFn: getAllTeacherOptions,
    enabled: isAdmin,
    staleTime: 5 * 60_000,
  });
}
