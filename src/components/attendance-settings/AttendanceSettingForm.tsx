import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Save } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYearOptions } from '@/hooks/useAcademicYearOptions';
import { useTheme } from '@/hooks/use-theme';
import {
  attendanceSettingSchema,
  type AttendanceSettingFormValues,
} from '@/schemas/attendanceSettingSchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSettingPayload, AttendanceSubjectType } from '@/types/attendanceSetting';

const SUBJECT_TYPE_OPTIONS: { label: string; value: AttendanceSubjectType }[] = [
  { label: 'Siswa', value: 'student' },
  { label: 'Guru', value: 'teacher' },
];

type TimeFieldName =
  | 'check_in_start'
  | 'on_time_limit'
  | 'late_limit'
  | 'check_in_close'
  | 'check_out_start'
  | 'check_out_end';

const TIME_FIELD_LABELS: Record<TimeFieldName, string> = {
  check_in_start: 'Jam Mulai Absen Masuk',
  on_time_limit: 'Batas Tepat Waktu',
  late_limit: 'Batas Terlambat (opsional)',
  check_in_close: 'Jam Tutup Absen Masuk',
  check_out_start: 'Jam Mulai Absen Pulang',
  check_out_end: 'Jam Selesai Absen Pulang (opsional)',
};

function timeStringToDate(time: string | undefined): Date {
  const base = new Date();

  if (!time) {
    return base;
  }

  const [hours, minutes] = time.split(':').map(Number);
  base.setHours(hours || 0, minutes || 0, 0, 0);

  return base;
}

function dateToTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export interface AttendanceSettingFormProps {
  defaultValues?: Partial<AttendanceSettingFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: AttendanceSettingPayload) => Promise<void>;
}

function toPayload(values: AttendanceSettingFormValues): AttendanceSettingPayload {
  return {
    academic_year_id: values.academic_year_id,
    subject_type: values.subject_type,
    effective_date: values.effective_date || null,
    check_in_start: values.check_in_start,
    on_time_limit: values.on_time_limit,
    late_limit: values.late_limit || null,
    check_in_close: values.check_in_close,
    check_out_start: values.check_out_start,
    check_out_end: values.check_out_end || null,
    allow_early_checkout: values.allow_early_checkout,
  };
}

export function AttendanceSettingForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: AttendanceSettingFormProps) {
  const theme = useTheme();
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  const [isSubjectTypeModalOpen, setIsSubjectTypeModalOpen] = useState(false);
  const [isEffectiveDatePickerOpen, setIsEffectiveDatePickerOpen] = useState(false);
  const [timePickerField, setTimePickerField] = useState<TimeFieldName | null>(null);

  const academicYearOptionsQuery = useAcademicYearOptions();

  const {
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<AttendanceSettingFormValues>({
    resolver: zodResolver(attendanceSettingSchema),
    defaultValues: {
      academic_year_id: 0,
      subject_type: 'student',
      effective_date: '',
      check_in_start: '06:30',
      on_time_limit: '07:00',
      late_limit: '',
      check_in_close: '08:00',
      check_out_start: '15:00',
      check_out_end: '',
      allow_early_checkout: false,
      ...defaultValues,
    },
  });

  const values = watch();

  const academicYearOptions = useMemo(
    () => (academicYearOptionsQuery.data ?? []).map((year) => ({ label: year.name, value: year.id })),
    [academicYearOptionsQuery.data],
  );

  const selectedAcademicYearLabel =
    academicYearOptions.find((option) => option.value === values.academic_year_id)?.label ?? 'Pilih tahun ajaran';
  const selectedSubjectTypeLabel =
    SUBJECT_TYPE_OPTIONS.find((option) => option.value === values.subject_type)?.label ?? 'Pilih jenis jadwal';

  const ruleExplanation = useMemo(() => buildRuleExplanation(values), [values]);

  const submit = handleSubmit(async (formValues) => {
    try {
      await onSubmit(toPayload(formValues));
    } catch (error) {
      const apiError = error as NormalizedApiError;
      const hasFieldErrors = applyServerErrors(setError, apiError);

      if (!hasFieldErrors) {
        Alert.alert('Gagal', apiError.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  });

  const renderTimeField = (name: TimeFieldName) => (
    <View style={styles.field} key={name}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{TIME_FIELD_LABELS[name]}</Text>
      <Pressable
        style={[
          styles.selectButton,
          { borderColor: errors[name] ? theme.danger : theme.border, backgroundColor: theme.surface },
        ]}
        onPress={() => setTimePickerField(name)}>
        <Text style={[styles.selectButtonText, { color: values[name] ? theme.textPrimary : theme.textSecondary }]}>
          {values[name] || 'Pilih jam'}
        </Text>
      </Pressable>
      {errors[name] ? <Text style={[styles.errorText, { color: theme.danger }]}>{errors[name]?.message}</Text> : null}
    </View>
  );

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
          <Text
            style={[
              styles.selectButtonText,
              { color: values.academic_year_id ? theme.textPrimary : theme.textSecondary },
            ]}>
            {selectedAcademicYearLabel}
          </Text>
        </Pressable>
        {errors.academic_year_id ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.academic_year_id.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Jenis Jadwal</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsSubjectTypeModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: theme.textPrimary }]}>{selectedSubjectTypeLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tanggal Berlaku (opsional)</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsEffectiveDatePickerOpen(true)}>
          <Text
            style={[
              styles.selectButtonText,
              { color: values.effective_date ? theme.textPrimary : theme.textSecondary },
            ]}>
            {values.effective_date ? formatDateLong(values.effective_date) : 'Berlaku sejak dibuat'}
          </Text>
        </Pressable>
      </View>

      {renderTimeField('check_in_start')}
      {renderTimeField('on_time_limit')}
      {renderTimeField('late_limit')}
      {renderTimeField('check_in_close')}
      {renderTimeField('check_out_start')}
      {renderTimeField('check_out_end')}

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Izinkan Pulang Lebih Awal</Text>
        <Switch
          value={values.allow_early_checkout}
          onValueChange={(value) => setValue('allow_early_checkout', value)}
          trackColor={{ true: theme.primary }}
        />
      </View>

      <View style={[styles.explanationBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Text style={[styles.explanationTitle, { color: theme.textPrimary }]}>Penjelasan Aturan</Text>
        <Text style={[styles.explanationText, { color: theme.textSecondary }]}>{ruleExplanation}</Text>
      </View>

      <AppButton title={submitLabel} icon={Save} onPress={submit} loading={isSubmitting} />

      <SelectModal
        visible={isAcademicYearModalOpen}
        title="Pilih Tahun Ajaran"
        options={academicYearOptions}
        selectedValue={values.academic_year_id || null}
        allowClear={false}
        onSelect={(value) => {
          if (value != null) {
            setValue('academic_year_id', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsAcademicYearModalOpen(false)}
      />

      <SelectModal
        visible={isSubjectTypeModalOpen}
        title="Pilih Jenis Jadwal"
        options={SUBJECT_TYPE_OPTIONS}
        selectedValue={values.subject_type}
        allowClear={false}
        onSelect={(value) => {
          if (value) {
            setValue('subject_type', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsSubjectTypeModalOpen(false)}
      />

      {isEffectiveDatePickerOpen ? (
        <DateTimePicker
          value={values.effective_date ? new Date(values.effective_date) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setIsEffectiveDatePickerOpen(false);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            setValue('effective_date', selectedDate.toISOString().slice(0, 10), { shouldValidate: true });
          }}
        />
      ) : null}

      {timePickerField ? (
        <DateTimePicker
          value={timeStringToDate(values[timePickerField])}
          mode="time"
          is24Hour
          display="default"
          onChange={(event, selectedDate) => {
            const field = timePickerField;
            setTimePickerField(null);

            if (event.type !== 'set' || !selectedDate || !field) {
              return;
            }

            setValue(field, dateToTimeString(selectedDate), { shouldValidate: true });
          }}
        />
      ) : null}
    </ScrollView>
  );
}

function buildRuleExplanation(values: AttendanceSettingFormValues): string {
  const subjectLabel = values.subject_type === 'teacher' ? 'Guru' : 'Siswa';
  const parts: string[] = [];

  parts.push(
    `${subjectLabel} yang absen masuk antara ${values.check_in_start || '-'} sampai ${values.on_time_limit || '-'} akan dianggap Hadir (tepat waktu).`,
  );

  const lateEnd = values.late_limit || values.check_in_close;
  parts.push(`Antara ${values.on_time_limit || '-'} sampai ${lateEnd || '-'} akan dianggap Terlambat.`);

  parts.push(`Setelah ${values.check_in_close || '-'}, absen masuk ditutup dan dianggap Alpha bila belum absen.`);

  parts.push(
    values.check_out_end
      ? `Absen pulang dapat dilakukan mulai ${values.check_out_start || '-'} sampai ${values.check_out_end}.`
      : `Absen pulang dapat dilakukan mulai ${values.check_out_start || '-'} tanpa batas akhir.`,
  );

  parts.push(
    values.allow_early_checkout
      ? 'Pulang lebih awal dari jam mulai absen pulang diizinkan.'
      : 'Pulang lebih awal dari jam mulai absen pulang tidak diizinkan.',
  );

  return parts.join(' ');
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
  explanationBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
