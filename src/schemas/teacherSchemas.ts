import { z } from 'zod';

const baseTeacherSchema = z.object({
  teacher_number: z.string().min(1, 'Nomor induk guru wajib diisi').max(50, 'Nomor induk guru maksimal 50 karakter'),
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
  gender: z.enum(['male', 'female'], { message: 'Jenis kelamin wajib dipilih' }),
  phone: z.string().max(30, 'Nomor telepon maksimal 30 karakter').optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
});

export type TeacherFormValues = z.infer<typeof baseTeacherSchema>;

/**
 * Password wajib diisi (min. 8 karakter) hanya saat membuat akun baru;
 * saat edit, password opsional — kosongkan bila tidak ingin mengubahnya.
 */
export function buildTeacherSchema(isCreate: boolean) {
  return baseTeacherSchema.superRefine((values, ctx) => {
    if (isCreate && !values.password) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password wajib diisi' });
    } else if (values.password && values.password.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password minimal 8 karakter' });
    }

    if (values.password) {
      if (values.password !== values.password_confirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['password_confirmation'],
          message: 'Konfirmasi password tidak sama',
        });
      }
    } else if (isCreate && !values.password_confirmation) {
      ctx.addIssue({
        code: 'custom',
        path: ['password_confirmation'],
        message: 'Konfirmasi password wajib diisi',
      });
    }
  });
}
