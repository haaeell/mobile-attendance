import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildTeacherSchema, type TeacherFormValues } from '@/schemas/teacherSchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import type { NormalizedApiError } from '@/types/api';
import type { TeacherGender, TeacherPayload } from '@/types/teacher';

const GENDER_OPTIONS: { label: string; value: TeacherGender }[] = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

export interface TeacherFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TeacherFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: TeacherPayload) => Promise<void>;
}

function toPayload(values: TeacherFormValues): TeacherPayload {
  const payload: TeacherPayload = {
    teacher_number: values.teacher_number,
    name: values.name,
    email: values.email,
    gender: values.gender,
    phone: values.phone || null,
    address: values.address || null,
  };

  if (values.password) {
    payload.password = values.password;
    payload.password_confirmation = values.password_confirmation;
  }

  return payload;
}

export function TeacherForm({ mode, defaultValues, submitLabel, isSubmitting, onSubmit }: TeacherFormProps) {
  const theme = useTheme();
  const isCreate = mode === 'create';

  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const schema = useMemo(() => buildTeacherSchema(isCreate), [isCreate]);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacher_number: '',
      name: '',
      email: '',
      gender: 'male',
      phone: '',
      address: '',
      password: '',
      password_confirmation: '',
      ...defaultValues,
    },
  });

  const gender = watch('gender');
  const selectedGenderLabel = GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? 'Pilih jenis kelamin';

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      const apiError = error as NormalizedApiError;
      const hasFieldErrors = applyServerErrors(setError, apiError);

      if (!hasFieldErrors) {
        Alert.alert('Gagal', apiError.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  });

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="teacher_number"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nomor Induk Guru"
            placeholder="Nomor induk guru"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.teacher_number?.message}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nama"
            placeholder="Nama lengkap guru"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Email"
            placeholder="nama@sekolah.test"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        )}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Jenis Kelamin</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsGenderModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: theme.textPrimary }]}>{selectedGenderLabel}</Text>
        </Pressable>
      </View>

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nomor Telepon"
            placeholder="Nomor telepon (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
            keyboardType="phone-pad"
          />
        )}
      />

      <Controller
        control={control}
        name="address"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Alamat"
            placeholder="Alamat (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.address?.message}
            multiline
            numberOfLines={3}
            style={styles.addressInput}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label={isCreate ? 'Password' : 'Password Baru (opsional)'}
            placeholder={isCreate ? 'Minimal 8 karakter' : 'Kosongkan jika tidak ingin mengubah password'}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            rightElement={
              <Pressable
                onPress={() => setIsPasswordVisible((visible) => !visible)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'}>
                <Text style={[styles.toggleText, { color: theme.primary }]}>
                  {isPasswordVisible ? 'Sembunyikan' : 'Lihat'}
                </Text>
              </Pressable>
            }
          />
        )}
      />

      <Controller
        control={control}
        name="password_confirmation"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label={isCreate ? 'Konfirmasi Password' : 'Konfirmasi Password Baru'}
            placeholder="Ulangi password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password_confirmation?.message}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />

      <AppButton title={submitLabel} onPress={submit} loading={isSubmitting} />

      <SelectModal
        visible={isGenderModalOpen}
        title="Pilih Jenis Kelamin"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        allowClear={false}
        onSelect={(value) => {
          if (value) {
            setValue('gender', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsGenderModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 15,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: Spacing.xs,
  },
});
