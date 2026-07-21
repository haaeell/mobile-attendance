import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYearOptions } from '@/hooks/useAcademicYearOptions';
import { useClassroomsDetailed } from '@/hooks/useClassroomsDetailed';
import { useTheme } from '@/hooks/use-theme';
import { studentSchema, type StudentFormValues } from '@/schemas/studentSchemas';
import { applyServerErrors } from '@/utils/applyServerErrors';
import type { NormalizedApiError } from '@/types/api';
import type { StudentGender, StudentPayload } from '@/types/student';

const GENDER_OPTIONS: { label: string; value: StudentGender }[] = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

export interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: StudentPayload) => Promise<void>;
}

function toPayload(values: StudentFormValues): StudentPayload {
  return {
    academic_year_id: values.academic_year_id,
    classroom_id: values.classroom_id,
    nis: values.nis,
    nisn: values.nisn || null,
    name: values.name,
    gender: values.gender,
    birth_place: values.birth_place || null,
    birth_date: values.birth_date || null,
    parent_name: values.parent_name || null,
    parent_phone: values.parent_phone || null,
    address: values.address || null,
  };
}

export function StudentForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: StudentFormProps) {
  const theme = useTheme();

  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const academicYearOptionsQuery = useAcademicYearOptions();
  const classroomsQuery = useClassroomsDetailed();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      academic_year_id: 0,
      classroom_id: 0,
      nis: '',
      nisn: '',
      name: '',
      gender: 'male',
      birth_place: '',
      birth_date: '',
      parent_name: '',
      parent_phone: '',
      address: '',
      ...defaultValues,
    },
  });

  const academicYearId = watch('academic_year_id');
  const classroomId = watch('classroom_id');
  const gender = watch('gender');
  const birthDate = watch('birth_date');

  const academicYearOptions = useMemo(
    () => (academicYearOptionsQuery.data ?? []).map((year) => ({ label: year.name, value: year.id })),
    [academicYearOptionsQuery.data],
  );

  const classroomOptions = useMemo(
    () =>
      (classroomsQuery.data ?? [])
        .filter((classroom) => !academicYearId || classroom.academic_year_id === academicYearId)
        .map((classroom) => ({ label: classroom.name, value: classroom.id })),
    [classroomsQuery.data, academicYearId],
  );

  const selectedAcademicYearLabel =
    academicYearOptions.find((option) => option.value === academicYearId)?.label ?? 'Pilih tahun ajaran';
  const selectedClassroomLabel =
    classroomOptions.find((option) => option.value === classroomId)?.label ?? 'Pilih kelas';
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

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Kelas</Text>
        <Pressable
          style={[
            styles.selectButton,
            { borderColor: errors.classroom_id ? theme.danger : theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setIsClassroomModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: classroomId ? theme.textPrimary : theme.textSecondary }]}>
            {selectedClassroomLabel}
          </Text>
        </Pressable>
        {errors.classroom_id ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.classroom_id.message}</Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="nis"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="NIS"
            placeholder="Nomor Induk Siswa"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.nis?.message}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="nisn"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="NISN"
            placeholder="Nomor Induk Siswa Nasional (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.nisn?.message}
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
            placeholder="Nama lengkap siswa"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
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
        name="birth_place"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Tempat Lahir"
            placeholder="Tempat lahir (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.birth_place?.message}
          />
        )}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tanggal Lahir</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsDatePickerOpen(true)}>
          <Text style={[styles.selectButtonText, { color: birthDate ? theme.textPrimary : theme.textSecondary }]}>
            {birthDate || 'Pilih tanggal lahir (opsional)'}
          </Text>
        </Pressable>
      </View>

      <Controller
        control={control}
        name="parent_name"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nama Orang Tua/Wali"
            placeholder="Nama orang tua/wali (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.parent_name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="parent_phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppInput
            label="Nomor Telepon Orang Tua/Wali"
            placeholder="Nomor telepon (opsional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.parent_phone?.message}
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
            setValue('classroom_id', 0, { shouldValidate: false });
          }
        }}
        onClose={() => setIsAcademicYearModalOpen(false)}
      />

      <SelectModal
        visible={isClassroomModalOpen}
        title="Pilih Kelas"
        options={classroomOptions}
        selectedValue={classroomId || null}
        allowClear={false}
        onSelect={(value) => {
          if (value != null) {
            setValue('classroom_id', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsClassroomModalOpen(false)}
      />

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

      {isDatePickerOpen ? (
        <DateTimePicker
          value={birthDate ? new Date(birthDate) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setIsDatePickerOpen(false);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            setValue('birth_date', selectedDate.toISOString().slice(0, 10), { shouldValidate: true });
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
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
