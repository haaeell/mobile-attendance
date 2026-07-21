import { useQuery } from '@tanstack/react-query';

import { getAllClassroomOptions } from '@/api/classrooms';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hanya admin yang punya akses ke GET /classrooms — untuk role lain, query
 * tidak dijalankan sama sekali (bukan hanya disembunyikan di UI).
 */
export function useClassroomOptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['classrooms', 'options'],
    queryFn: getAllClassroomOptions,
    enabled: isAdmin,
    staleTime: 5 * 60_000,
  });
}
