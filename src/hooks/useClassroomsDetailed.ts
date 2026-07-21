import { useQuery } from '@tanstack/react-query';

import { getAllClassroomsDetailed } from '@/api/classrooms';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hanya admin yang punya akses ke GET /classrooms.
 */
export function useClassroomsDetailed() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['classrooms', 'detailed'],
    queryFn: getAllClassroomsDetailed,
    enabled: isAdmin,
    staleTime: 5 * 60_000,
  });
}
