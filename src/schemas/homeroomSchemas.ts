import { z } from 'zod';

export const updateHomeroomStatusSchema = z.object({
  studentId: z.number().int().positive({ message: 'Siswa wajib dipilih' }),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  status: z.enum(['permission', 'sick', 'dispensation'], {
    message: 'Status wajib dipilih',
  }),
  notes: z.string().max(1000, 'Keterangan maksimal 1000 karakter').optional(),
});

export type UpdateHomeroomStatusFormValues = z.infer<typeof updateHomeroomStatusSchema>;
