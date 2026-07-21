import { z } from 'zod';

export const studentSchema = z.object({
  academic_year_id: z.number().int().positive({ message: 'Tahun ajaran wajib dipilih' }),
  classroom_id: z.number().int().positive({ message: 'Kelas wajib dipilih' }),
  nis: z.string().min(1, 'NIS wajib diisi').max(50, 'NIS maksimal 50 karakter'),
  nisn: z.string().max(50, 'NISN maksimal 50 karakter').optional(),
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  gender: z.enum(['male', 'female'], { message: 'Jenis kelamin wajib dipilih' }),
  birth_place: z.string().max(255, 'Tempat lahir maksimal 255 karakter').optional(),
  birth_date: z.string().optional(),
  parent_name: z.string().max(255, 'Nama orang tua/wali maksimal 255 karakter').optional(),
  parent_phone: z.string().max(30, 'Nomor telepon maksimal 30 karakter').optional(),
  address: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
