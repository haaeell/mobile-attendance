import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = (message: string) => z.string().regex(TIME_REGEX, message);

export const attendanceSettingSchema = z
  .object({
    academic_year_id: z.number().int().positive({ message: 'Tahun ajaran wajib dipilih' }),
    subject_type: z.enum(['student', 'teacher'], { message: 'Jenis jadwal wajib dipilih' }),
    effective_date: z.string().optional(),
    check_in_start: timeField('Jam mulai absen masuk wajib diisi'),
    on_time_limit: timeField('Batas tepat waktu wajib diisi'),
    late_limit: z.string().optional(),
    check_in_close: timeField('Jam tutup absen masuk wajib diisi'),
    check_out_start: timeField('Jam mulai absen pulang wajib diisi'),
    check_out_end: z.string().optional(),
    allow_early_checkout: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.on_time_limit < values.check_in_start) {
      ctx.addIssue({
        code: 'custom',
        path: ['on_time_limit'],
        message: 'Batas tepat waktu harus setelah atau sama dengan jam mulai absen masuk',
      });
    }

    if (values.late_limit) {
      if (!TIME_REGEX.test(values.late_limit)) {
        ctx.addIssue({ code: 'custom', path: ['late_limit'], message: 'Format jam batas terlambat tidak valid' });
      } else if (values.late_limit < values.on_time_limit) {
        ctx.addIssue({
          code: 'custom',
          path: ['late_limit'],
          message: 'Batas terlambat harus setelah atau sama dengan batas tepat waktu',
        });
      }
    }

    if (values.check_in_close < values.on_time_limit) {
      ctx.addIssue({
        code: 'custom',
        path: ['check_in_close'],
        message: 'Jam tutup absen masuk harus setelah atau sama dengan batas tepat waktu',
      });
    }

    if (values.check_out_end) {
      if (!TIME_REGEX.test(values.check_out_end)) {
        ctx.addIssue({ code: 'custom', path: ['check_out_end'], message: 'Format jam selesai absen pulang tidak valid' });
      } else if (values.check_out_end <= values.check_out_start) {
        ctx.addIssue({
          code: 'custom',
          path: ['check_out_end'],
          message: 'Jam selesai absen pulang harus setelah jam mulai absen pulang',
        });
      }
    }
  });

export type AttendanceSettingFormValues = z.infer<typeof attendanceSettingSchema>;
