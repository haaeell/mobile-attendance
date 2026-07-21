import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { holidaySchema, type HolidayFormValues } from '@/schemas/holidaySchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { HolidayAppliesTo, HolidayPayload } from '@/types/holiday';

const APPLIES_TO_OPTIONS: { label: string; value: HolidayAppliesTo }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Siswa', value: 'student' },
  { label: 'Guru', value: 'teacher' },
];

export interface HolidayFormProps {
  defaultValues?: Partial<HolidayFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: HolidayPayload) => Promise<void>;
}

function toPayload(values: HolidayFormValues): HolidayPayload {
  return {
    name: values.name,
    start_date: values.start_date,
    end_date: values.end_date,
    applies_to: values.applies_to,
    description: values.description || null,
  };
}

export function HolidayForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: HolidayFormProps) {
  const theme = useTheme();
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);
  const [isAppliesToModalOpen, setIsAppliesToModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      applies_to: 'all',
      description: '',
      ...defaultValues,
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const appliesTo = watch('applies_to');

  const selectedAppliesToLabel =
    APPLIES_TO_OPTIONS.find((option) => option.value === appliesTo)?.label ?? 'Pilih cakupan';

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
            label="Nama Hari Libur"
            placeholder="Contoh: Libur Hari Raya"
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

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Berlaku Untuk</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsAppliesToModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: theme.textPrimary }]}>{selectedAppliesToLabel}</Text>
        </Pressable>
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Keterangan"
            placeholder="Keterangan (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
            multiline
            numberOfLines={3}
            style={styles.descriptionInput}
          />
        )}
      />

      <AppButton title={submitLabel} onPress={submit} loading={isSubmitting} />

      <SelectModal
        visible={isAppliesToModalOpen}
        title="Berlaku Untuk"
        options={APPLIES_TO_OPTIONS}
        selectedValue={appliesTo}
        allowClear={false}
        onSelect={(value) => {
          if (value) {
            setValue('applies_to', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsAppliesToModalOpen(false)}
      />

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
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
