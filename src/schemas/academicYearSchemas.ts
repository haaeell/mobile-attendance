import { z } from 'zod';

export const academicYearSchema = z
  .object({
    name: z.string().min(1, 'Nama tahun ajaran wajib diisi').max(255, 'Nama maksimal 255 karakter'),
    start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
    end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  })
  .refine((values) => !values.start_date || !values.end_date || values.end_date > values.start_date, {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['end_date'],
  });

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
