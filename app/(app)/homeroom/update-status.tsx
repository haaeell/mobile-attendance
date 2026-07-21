import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, ImagePlus, Save } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useHomeroomStudents } from '@/hooks/useHomeroomStudents';
import { useUpdateHomeroomStatus } from '@/hooks/useUpdateHomeroomStatus';
import { useTheme } from '@/hooks/use-theme';
import { updateHomeroomStatusSchema, type UpdateHomeroomStatusFormValues } from '@/schemas/homeroomSchemas';
import type { NormalizedApiError } from '@/types/api';
import type { HomeroomUpdatableStatus } from '@/types/homeroom';

const STATUS_OPTIONS: { label: string; value: HomeroomUpdatableStatus }[] = [
  { label: 'Izin', value: 'permission' },
  { label: 'Sakit', value: 'sick' },
  { label: 'Dispensasi', value: 'dispensation' },
];

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function HomeroomUpdateStatusScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ studentId?: string; date?: string }>();

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [sickLetter, setSickLetter] = useState<PickedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const studentsQuery = useHomeroomStudents();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = studentsQuery;
  const updateStatusMutation = useUpdateHomeroomStatus();

  // Roster biasanya kecil (satu kelas), jadi ambil semua halaman supaya
  // picker siswa menampilkan seluruh siswa kelas, bukan hanya halaman pertama.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const studentOptions = useMemo(
    () =>
      (studentsQuery.data?.pages.flatMap((page) => page.data) ?? []).map((student) => ({
        label: `${student.name} (${student.nis})`,
        value: student.id,
      })),
    [studentsQuery.data],
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateHomeroomStatusFormValues>({
    resolver: zodResolver(updateHomeroomStatusSchema),
    defaultValues: {
      studentId: params.studentId ? Number(params.studentId) : 0,
      date: params.date ?? todayIsoDate(),
      status: 'permission',
      notes: '',
    },
  });

  const status = watch('status');
  const isSickLetterRequired = status === 'sick';

  const validateAndSetFile = (file: PickedFile) => {
    setFileError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      setFileError('Tipe file harus PDF, JPG, JPEG, atau PNG.');
      return;
    }

    if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('Ukuran file maksimal 5 MB.');
      return;
    }

    setSickLetter(file);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    validateAndSetFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
      size: asset.size,
    });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan akses galeri foto untuk melampirkan surat sakit.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const name = asset.fileName ?? asset.uri.split('/').pop() ?? 'foto.jpg';
    validateAndSetFile({
      uri: asset.uri,
      name,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    });
  };

  const removeFile = () => {
    setSickLetter(null);
    setFileError(null);
  };

  const onSubmit = handleSubmit((values) => {
    if (values.status === 'sick' && !sickLetter) {
      setFileError('Surat sakit wajib dilampirkan untuk status sakit.');
      return;
    }

    Alert.alert('Konfirmasi', 'Simpan perubahan status kehadiran siswa ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Simpan',
        onPress: () => {
          updateStatusMutation.mutate(
            {
              student_id: values.studentId,
              date: values.date,
              status: values.status,
              notes: values.notes || null,
              sick_letter: sickLetter
                ? { uri: sickLetter.uri, name: sickLetter.name, type: sickLetter.mimeType }
                : null,
            },
            {
              onSuccess: () => {
                Alert.alert('Berhasil', 'Status kehadiran berhasil diperbarui.', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              },
              onError: (error: NormalizedApiError) => {
                if (error.status === 403) {
                  Alert.alert('Akses Ditolak', error.message || 'Anda tidak berwenang melakukan aksi ini.');
                  return;
                }

                Alert.alert('Gagal', error.message || 'Gagal memperbarui status kehadiran.');
              },
            },
          );
        },
      },
    ]);
  });

  const selectedStudentLabel =
    studentOptions.find((option) => option.value === watch('studentId'))?.label ?? 'Pilih siswa';
  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Pilih status';

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Siswa</Text>
        <Controller
          control={control}
          name="studentId"
          render={({ field: { value } }) => (
            <Pressable
              style={[styles.selectButton, { borderColor: errors.studentId ? theme.danger : theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsStudentModalOpen(true)}>
              <Text style={[styles.selectButtonText, { color: value ? theme.textPrimary : theme.textSecondary }]}>
                {selectedStudentLabel}
              </Text>
            </Pressable>
          )}
        />
        {errors.studentId ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errors.studentId.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Tanggal</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { value } }) => (
            <Pressable
              style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsDatePickerOpen(true)}>
              <Text style={[styles.selectButtonText, { color: theme.textPrimary }]}>{value}</Text>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Status</Text>
        <Pressable
          style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setIsStatusModalOpen(true)}>
          <Text style={[styles.selectButtonText, { color: theme.textPrimary }]}>{selectedStatusLabel}</Text>
        </Pressable>
      </View>

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <AppInput
            label="Keterangan"
            icon={FileText}
            placeholder="Keterangan (opsional)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            error={errors.notes?.message}
          />
        )}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Surat Sakit{isSickLetterRequired ? ' (wajib)' : ' (opsional)'}
        </Text>

        {sickLetter ? (
          <View style={[styles.filePreview, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.fileName, { color: theme.textPrimary }]} numberOfLines={1}>
              {sickLetter.name}
            </Text>
            {sickLetter.size ? (
              <Text style={[styles.fileSize, { color: theme.textSecondary }]}>
                {formatFileSize(sickLetter.size)}
              </Text>
            ) : null}
            <Pressable onPress={removeFile} hitSlop={8}>
              <Text style={[styles.removeFileText, { color: theme.danger }]}>Hapus</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.fileButtonsRow}>
            <View style={styles.fileButton}>
              <AppButton title="Pilih Dokumen (PDF)" icon={FileText} variant="secondary" onPress={pickDocument} />
            </View>
            <View style={styles.fileButton}>
              <AppButton title="Pilih Foto" icon={ImagePlus} variant="secondary" onPress={pickImage} />
            </View>
          </View>
        )}

        {fileError ? <Text style={[styles.errorText, { color: theme.danger }]}>{fileError}</Text> : null}
      </View>

      <AppButton title="Simpan" icon={Save} onPress={onSubmit} loading={updateStatusMutation.isPending} />

      <SelectModal
        visible={isStudentModalOpen}
        title="Pilih Siswa"
        options={studentOptions}
        selectedValue={watch('studentId') || null}
        allowClear={false}
        onSelect={(value) => {
          if (value != null) {
            setValue('studentId', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsStudentModalOpen(false)}
      />

      <SelectModal
        visible={isStatusModalOpen}
        title="Pilih Status"
        options={STATUS_OPTIONS}
        selectedValue={status}
        allowClear={false}
        onSelect={(value) => {
          if (value) {
            setValue('status', value, { shouldValidate: true });
          }
        }}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {isDatePickerOpen ? (
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateTimePicker
              value={new Date(value)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setIsDatePickerOpen(false);

                if (event.type !== 'set' || !selectedDate) {
                  return;
                }

                onChange(selectedDate.toISOString().slice(0, 10));
              }}
            />
          )}
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
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  fileButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fileButton: {
    flex: 1,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
  },
  removeFileText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
