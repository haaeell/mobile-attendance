import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYearOptions } from '@/hooks/useAcademicYearOptions';
import { useTheme } from '@/hooks/use-theme';
import { classroomSchema, type ClassroomFormValues } from '@/schemas/classroomSchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import type { NormalizedApiError } from '@/types/api';
import type { ClassroomPayload } from '@/types/classroom';

export interface ClassroomFormProps {
  defaultValues?: Partial<ClassroomFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: ClassroomPayload) => Promise<void>;
}

function toPayload(values: ClassroomFormValues): ClassroomPayload {
  return {
    academic_year_id: values.academic_year_id,
    name: values.name,
    grade_level: values.grade_level,
    major: values.major || null,
    is_active: values.is_active,
  };
}

export function ClassroomForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: ClassroomFormProps) {
  const theme = useTheme();
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);

  const academicYearOptionsQuery = useAcademicYearOptions();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      academic_year_id: 0,
      name: '',
      grade_level: '',
      major: '',
      is_active: true,
      ...defaultValues,
    },
  });

  const academicYearId = watch('academic_year_id');
  const isActive = watch('is_active');

  const academicYearOptions = useMemo(
    () => (academicYearOptionsQuery.data ?? []).map((year) => ({ label: year.name, value: year.id })),
    [academicYearOptionsQuery.data],
  );

  const selectedAcademicYearLabel =
    academicYearOptions.find((option) => option.value === academicYearId)?.label ?? 'Pilih tahun ajaran';

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
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tahun Ajaran</Text>
        <Pressable
          style={[
            styles.selectButton,
            { borderColor: errors.academic_year_id ? theme.danger : theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setIsAcademicYearModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: academicYearId ? theme.textPrimary : theme.textSecondary }]}>
            {selectedAcademicYearLabel}
          </Text>
        </Pressable>
        {errors.academic_year_id ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.academic_year_id.message}</Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nama Kelas"
            placeholder="Contoh: X IPA 1"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="grade_level"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Tingkat Kelas"
            placeholder="Contoh: X, XI, XII"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.grade_level?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="major"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Jurusan"
            placeholder="Jurusan (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.major?.message}
          />
        )}
      />

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Kelas Aktif</Text>
        <Switch
          value={isActive}
          onValueChange={(value) => setValue('is_active', value)}
          trackColor={{ true: theme.primary }}
        />
      </View>

      <AppButton title={submitLabel} onPress={submit} loading={isSubmitting} />

      <SelectModal
        visible={isAcademicYearModalOpen}
        title="Pilih Tahun Ajaran"
        options={academicYearOptions}
        selectedValue={academicYearId || null}
        allowClear={false}
        onSelect={(value) => {
          if (value != null) {
            setValue('academic_year_id', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsAcademicYearModalOpen(false)}
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
  errorText: {
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
