import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useDeleteStudent } from '@/hooks/useDeleteStudent';
import { useRegenerateStudentBarcode } from '@/hooks/useRegenerateStudentBarcode';
import { useStudent } from '@/hooks/useStudent';
import { useUpdateStudentBarcodeStatus } from '@/hooks/useUpdateStudentBarcodeStatus';
import { useUpdateStudentStatus } from '@/hooks/useUpdateStudentStatus';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';

const GENDER_LABEL: Record<'male' | 'female', string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
};

export default function AdminStudentDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const studentId = Number(id);

  const { data: student, isPending, isError, error, refetch } = useStudent(studentId);
  const updateStatusMutation = useUpdateStudentStatus(studentId);
  const deleteStudentMutation = useDeleteStudent();
  const regenerateBarcodeMutation = useRegenerateStudentBarcode(studentId);
  const updateBarcodeStatusMutation = useUpdateStudentBarcodeStatus(studentId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={140} />
        <View style={{ height: Spacing.md }} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (isError || !student) {
    return (
      <ErrorState
        title="Gagal memuat data siswa"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  const showError = (error: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', error.message || fallback);
  };

  const handleToggleStatus = () => {
    const nextIsActive = !student.is_active;

    Alert.alert(
      nextIsActive ? 'Aktifkan Siswa' : 'Nonaktifkan Siswa',
      `Yakin ingin ${nextIsActive ? 'mengaktifkan' : 'menonaktifkan'} siswa ${student.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            updateStatusMutation.mutate(nextIsActive, {
              onError: (mutationError) => showError(mutationError, 'Gagal memperbarui status siswa.'),
            });
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert('Hapus Siswa', `Yakin ingin menghapus siswa ${student.name}? Tindakan ini tidak dapat dibatalkan.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteStudentMutation.mutate(studentId, {
            onSuccess: () => {
              Alert.alert('Berhasil', 'Siswa berhasil dihapus.', [{ text: 'OK', onPress: () => router.back() }]);
            },
            onError: (mutationError) => showError(mutationError, 'Gagal menghapus siswa.'),
          });
        },
      },
    ]);
  };

  const handleRegenerateBarcode = () => {
    Alert.alert(
      'Terbitkan Ulang Barcode',
      'Barcode lama akan langsung tidak berlaku dan digantikan dengan barcode baru. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terbitkan',
          onPress: () => {
            regenerateBarcodeMutation.mutate(undefined, {
              onError: (mutationError) => showError(mutationError, 'Gagal menerbitkan ulang barcode.'),
            });
          },
        },
      ],
    );
  };

  const handleToggleBarcodeStatus = () => {
    const nextStatus = student.barcode_status === 'active' ? 'inactive' : 'active';

    Alert.alert(
      'Ubah Status Barcode',
      `Yakin ingin mengubah status barcode menjadi ${nextStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            updateBarcodeStatusMutation.mutate(nextStatus, {
              onError: (mutationError) => showError(mutationError, 'Gagal mengubah status barcode.'),
            });
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{student.name}</Text>
          <StatusBadge
            label={student.is_active ? 'Aktif' : 'Tidak Aktif'}
            tone={student.is_active ? 'success' : 'danger'}
          />
        </View>
        <Text style={[styles.subLine, { color: theme.textSecondary }]}>
          NIS {student.nis}
          {student.nisn ? ` • NISN ${student.nisn}` : ''}
        </Text>
        {student.classroom ? (
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>Kelas {student.classroom.name}</Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Data Pribadi</Text>
        <DetailRow label="Jenis Kelamin" value={GENDER_LABEL[student.gender]} />
        <DetailRow label="Tempat Lahir" value={student.birth_place ?? '-'} />
        <DetailRow
          label="Tanggal Lahir"
          value={student.birth_date ? formatDateLong(student.birth_date) : '-'}
        />
        <DetailRow label="Nama Orang Tua/Wali" value={student.parent_name ?? '-'} />
        <DetailRow label="Nomor Telepon" value={student.parent_phone ?? '-'} />
        <DetailRow label="Alamat" value={student.address ?? '-'} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Barcode</Text>
          <StatusBadge
            label={student.barcode_status_label}
            tone={student.barcode_status === 'active' ? 'success' : 'neutral'}
          />
        </View>
        <DetailRow label="Nilai Barcode" value={student.barcode_value ?? '-'} />
      </View>

      <View style={styles.actions}>
        <AppButton title="Edit Siswa" onPress={() => router.push(`/(app)/admin/students/edit/${studentId}`)} />
        <AppButton
          title={student.is_active ? 'Nonaktifkan Siswa' : 'Aktifkan Siswa'}
          variant="secondary"
          onPress={handleToggleStatus}
          loading={updateStatusMutation.isPending}
        />
        <AppButton
          title="Terbitkan Ulang Barcode"
          variant="secondary"
          onPress={handleRegenerateBarcode}
          loading={regenerateBarcodeMutation.isPending}
        />
        <AppButton
          title={student.barcode_status === 'active' ? 'Nonaktifkan Barcode' : 'Aktifkan Barcode'}
          variant="secondary"
          onPress={handleToggleBarcodeStatus}
          loading={updateBarcodeStatusMutation.isPending}
        />
        <AppButton
          title="Hapus Siswa"
          variant="danger"
          onPress={handleDelete}
          loading={deleteStudentMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    gap: Spacing.sm,
  },
});
