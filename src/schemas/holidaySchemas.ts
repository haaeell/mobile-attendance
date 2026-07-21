import { z } from 'zod';

export const holidaySchema = z
  .object({
    name: z.string().min(1, 'Nama hari libur wajib diisi').max(255, 'Nama maksimal 255 karakter'),
    start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
    end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
    applies_to: z.enum(['all', 'student', 'teacher'], { message: 'Cakupan wajib dipilih' }),
    description: z.string().optional(),
  })
  .refine((values) => !values.start_date || !values.end_date || values.end_date >= values.start_date, {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['end_date'],
  });

export type HolidayFormValues = z.infer<typeof holidaySchema>;
