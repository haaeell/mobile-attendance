import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil, Power, PowerOff, RefreshCw, Trash2 } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useDeleteTeacher } from '@/hooks/useDeleteTeacher';
import { useRegenerateTeacherBarcode } from '@/hooks/useRegenerateTeacherBarcode';
import { useTeacher } from '@/hooks/useTeacher';
import { useUpdateTeacherBarcodeStatus } from '@/hooks/useUpdateTeacherBarcodeStatus';
import { useUpdateTeacherStatus } from '@/hooks/useUpdateTeacherStatus';
import { useTheme } from '@/hooks/use-theme';
import type { NormalizedApiError } from '@/types/api';

const GENDER_LABEL: Record<'male' | 'female', string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
};

export default function AdminTeacherDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacherId = Number(id);

  const { data: teacher, isPending, isError, error, refetch } = useTeacher(teacherId);
  const updateStatusMutation = useUpdateTeacherStatus(teacherId);
  const deleteTeacherMutation = useDeleteTeacher();
  const regenerateBarcodeMutation = useRegenerateTeacherBarcode(teacherId);
  const updateBarcodeStatusMutation = useUpdateTeacherBarcodeStatus(teacherId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={140} />
        <View style={{ height: Spacing.md }} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (isError || !teacher) {
    return (
      <ErrorState
        title="Gagal memuat data guru"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  const showError = (apiError: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', apiError.message || fallback);
  };

  const handleToggleStatus = () => {
    const nextIsActive = !teacher.is_active;

    Alert.alert(
      nextIsActive ? 'Aktifkan Guru' : 'Nonaktifkan Guru',
      `Yakin ingin ${nextIsActive ? 'mengaktifkan' : 'menonaktifkan'} guru ${teacher.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            updateStatusMutation.mutate(nextIsActive, {
              onError: (mutationError) => showError(mutationError, 'Gagal memperbarui status guru.'),
            });
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert('Hapus Guru', `Yakin ingin menghapus guru ${teacher.name}? Tindakan ini tidak dapat dibatalkan.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteTeacherMutation.mutate(teacherId, {
            onSuccess: () => {
              Alert.alert('Berhasil', 'Guru berhasil dihapus.', [{ text: 'OK', onPress: () => router.back() }]);
            },
            onError: (mutationError) => showError(mutationError, 'Gagal menghapus guru.'),
          });
        },
      },
    ]);
  };

  const handleRegenerateBarcode = () => {
    Alert.alert(
      'Terbitkan Ulang QR Code',
      'QR code lama akan langsung tidak berlaku dan digantikan dengan QR code baru. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terbitkan',
          onPress: () => {
            regenerateBarcodeMutation.mutate(undefined, {
              onError: (mutationError) => showError(mutationError, 'Gagal menerbitkan ulang QR code.'),
            });
          },
        },
      ],
    );
  };

  const handleToggleBarcodeStatus = () => {
    const nextStatus = teacher.barcode_status === 'active' ? 'inactive' : 'active';

    Alert.alert(
      'Ubah Status QR Code',
      `Yakin ingin mengubah status QR code menjadi ${nextStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            updateBarcodeStatusMutation.mutate(nextStatus, {
              onError: (mutationError) => showError(mutationError, 'Gagal mengubah status QR code.'),
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
          <Text style={[styles.name, { color: theme.textPrimary }]}>{teacher.name}</Text>
          <StatusBadge
            label={teacher.is_active ? 'Aktif' : 'Tidak Aktif'}
            tone={teacher.is_active ? 'success' : 'danger'}
          />
        </View>
        <Text style={[styles.subLine, { color: theme.textSecondary }]}>NIP {teacher.teacher_number}</Text>
        <Text style={[styles.subLine, { color: theme.textSecondary }]}>{teacher.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Data Pribadi</Text>
        <DetailRow label="Jenis Kelamin" value={GENDER_LABEL[teacher.gender]} />
        <DetailRow label="Nomor Telepon" value={teacher.phone ?? '-'} />
        <DetailRow label="Alamat" value={teacher.address ?? '-'} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>QR Code</Text>
          <StatusBadge
            label={teacher.barcode_status_label}
            tone={teacher.barcode_status === 'active' ? 'success' : 'neutral'}
          />
        </View>
        <DetailRow label="Nilai QR Code" value={teacher.barcode_value ?? '-'} />
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Edit Guru"
          icon={Pencil}
          onPress={() => router.push(`/(app)/admin/teachers/edit/${teacherId}`)}
        />
        <AppButton
          title={teacher.is_active ? 'Nonaktifkan Guru' : 'Aktifkan Guru'}
          icon={teacher.is_active ? PowerOff : Power}
          variant="secondary"
          onPress={handleToggleStatus}
          loading={updateStatusMutation.isPending}
        />
        <AppButton
          title="Terbitkan Ulang QR Code"
          icon={RefreshCw}
          variant="secondary"
          onPress={handleRegenerateBarcode}
          loading={regenerateBarcodeMutation.isPending}
        />
        <AppButton
          title={teacher.barcode_status === 'active' ? 'Nonaktifkan QR Code' : 'Aktifkan QR Code'}
          icon={teacher.barcode_status === 'active' ? PowerOff : Power}
          variant="secondary"
          onPress={handleToggleBarcodeStatus}
          loading={updateBarcodeStatusMutation.isPending}
        />
        <AppButton
          title="Hapus Guru"
          icon={Trash2}
          variant="danger"
          onPress={handleDelete}
          loading={deleteTeacherMutation.isPending}
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
