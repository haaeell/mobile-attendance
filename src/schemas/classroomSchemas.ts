import { z } from 'zod';

export const classroomSchema = z.object({
  academic_year_id: z.number().int().positive({ message: 'Tahun ajaran wajib dipilih' }),
  name: z.string().min(1, 'Nama kelas wajib diisi').max(255, 'Nama kelas maksimal 255 karakter'),
  grade_level: z.string().min(1, 'Tingkat kelas wajib diisi').max(20, 'Tingkat kelas maksimal 20 karakter'),
  major: z.string().max(255, 'Jurusan maksimal 255 karakter').optional(),
  is_active: z.boolean(),
});

export type ClassroomFormValues = z.infer<typeof classroomSchema>;
