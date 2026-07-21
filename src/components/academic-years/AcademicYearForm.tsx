import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { academicYearSchema, type AcademicYearFormValues } from '@/schemas/academicYearSchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYearPayload } from '@/types/academicYear';

export interface AcademicYearFormProps {
  defaultValues?: Partial<AcademicYearFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: AcademicYearPayload) => Promise<void>;
}

function toPayload(values: AcademicYearFormValues): AcademicYearPayload {
  return {
    name: values.name,
    start_date: values.start_date,
    end_date: values.end_date,
  };
}

export function AcademicYearForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: AcademicYearFormProps) {
  const theme = useTheme();
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      ...defaultValues,
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

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
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nama Tahun Ajaran"
            placeholder="Contoh: 2026/2027"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tanggal Mulai</Text>
        <Pressable
          style={[
            styles.selectButton,
            { borderColor: errors.start_date ? theme.danger : theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setDatePickerTarget('start')}>
          <Text style={[styles.selectButtonText, { color: startDate ? theme.textPrimary : theme.textSecondary }]}>
            {startDate ? formatDateLong(startDate) : 'Pilih tanggal mulai'}
          </Text>
        </Pressable>
        {errors.start_date ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.start_date.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tanggal Selesai</Text>
        <Pressable
          style={[
            styles.selectButton,
            { borderColor: errors.end_date ? theme.danger : theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setDatePickerTarget('end')}>
          <Text style={[styles.selectButtonText, { color: endDate ? theme.textPrimary : theme.textSecondary }]}>
            {endDate ? formatDateLong(endDate) : 'Pilih tanggal selesai'}
          </Text>
        </Pressable>
        {errors.end_date ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.end_date.message}</Text>
        ) : null}
      </View>

      <AppButton title={submitLabel} onPress={submit} loading={isSubmitting} />

      {datePickerTarget ? (
        <DateTimePicker
          value={
            (datePickerTarget === 'start' ? startDate && new Date(startDate) : endDate && new Date(endDate)) ||
            new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setDatePickerTarget(null);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            const isoDate = selectedDate.toISOString().slice(0, 10);

            if (datePickerTarget === 'start') {
              setValue('start_date', isoDate, { shouldValidate: true });
            } else {
              setValue('end_date', isoDate, { shouldValidate: true });
            }
          }}
        />
      ) : null}
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
});
