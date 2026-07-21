import { useQuery } from '@tanstack/react-query';

import { getAllAcademicYearOptions } from '@/api/academicYears';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hanya admin yang punya akses ke GET /academic-years.
 */
export function useAcademicYearOptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['academic-years', 'options'],
    queryFn: getAllAcademicYearOptions,
    enabled: isAdmin,
    staleTime: 5 * 60_000,
  });
}
