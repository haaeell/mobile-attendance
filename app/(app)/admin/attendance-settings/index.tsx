import { useRouter } from 'expo-router';
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYearOptions } from '@/hooks/useAcademicYearOptions';
import { useActivateAttendanceSetting } from '@/hooks/useActivateAttendanceSetting';
import { useAttendanceSettings } from '@/hooks/useAttendanceSettings';
import { useDeleteAttendanceSetting } from '@/hooks/useDeleteAttendanceSetting';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceSetting, AttendanceSubjectType } from '@/types/attendanceSetting';

export default function AdminAttendanceSettingsListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [subjectType, setSubjectType] = useState<AttendanceSubjectType>('student');
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);

  const academicYearOptionsQuery = useAcademicYearOptions();

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAttendanceSettings({ subject_type: subjectType, academic_year_id: academicYearId ?? undefined });

  const activateMutation = useActivateAttendanceSetting();
  const deleteMutation = useDeleteAttendanceSetting();

  const settings = useMemo<AttendanceSetting[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const selectedAcademicYearLabel =
    academicYearOptionsQuery.data?.find((option) => option.id === academicYearId)?.name ?? 'Semua Tahun Ajaran';

  const showError = (apiError: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', apiError.message || fallback);
  };

  const handleActivate = (setting: AttendanceSetting) => {
    Alert.alert(
      'Aktifkan Jadwal',
      'Jadwal lain dengan tahun ajaran, jenis, dan tanggal berlaku yang sama akan dinonaktifkan. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Aktifkan',
          onPress: () => {
            activateMutation.mutate(setting.id, {
              onError: (mutationError) => showError(mutationError, 'Gagal mengaktifkan jadwal.'),
            });
          },
        },
      ],
    );
  };

  const handleDelete = (setting: AttendanceSetting) => {
    Alert.alert('Hapus Jadwal', 'Yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(setting.id, {
            onError: (mutationError) => showError(mutationError, 'Gagal menghapus jadwal.'),
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={settings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton
              title="Tambah Jadwal"
              icon={Plus}
              onPress={() =>
                router.push({ pathname: '/(app)/admin/attendance-settings/create', params: { subjectType } })
              }
            />

            <View style={[styles.segmented, { borderColor: theme.border }]}>
              <SegmentButton label="Siswa" active={subjectType === 'student'} onPress={() => setSubjectType('student')} />
              <SegmentButton label="Guru" active={subjectType === 'teacher'} onPress={() => setSubjectType('teacher')} />
            </View>

            <Pressable
              style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsAcademicYearModalOpen(true)}>
              <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                {selectedAcademicYearLabel}
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.itemHeaderRow}>
              <Text style={[styles.name, { color: theme.textPrimary }]}>
                {item.effective_date ? formatDateLong(item.effective_date) : 'Berlaku sejak dibuat'}
              </Text>
              <StatusBadge
                label={item.is_active ? 'Aktif' : 'Tidak Aktif'}
                tone={item.is_active ? 'success' : 'neutral'}
              />
            </View>
            <Text style={[styles.subLine, { color: theme.textSecondary }]}>
              Masuk {item.check_in_start.slice(0, 5)}–{item.check_in_close.slice(0, 5)} • Pulang{' '}
              {item.check_out_start.slice(0, 5)}
              {item.check_out_end ? `–${item.check_out_end.slice(0, 5)}` : ''}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Edit"
                  icon={Pencil}
                  variant="secondary"
                  onPress={() => router.push(`/(app)/admin/attendance-settings/edit/${item.id}`)}
                />
              </View>
              {!item.is_active ? (
                <View style={styles.actionButton}>
                  <AppButton
                    title="Aktifkan"
                    icon={CircleCheck}
                    variant="secondary"
                    onPress={() => handleActivate(item)}
                    loading={activateMutation.isPending}
                  />
                </View>
              ) : null}
              <View style={styles.actionButton}>
                <AppButton
                  title="Hapus"
                  icon={Trash2}
                  variant="danger"
                  onPress={() => handleDelete(item)}
                  loading={deleteMutation.isPending}
                />
              </View>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={theme.primary} />
          ) : null
        }
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: Spacing.sm }}>
              <Skeleton height={100} />
              <Skeleton height={100} />
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat jadwal"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada jadwal" message="Tambahkan jadwal absensi baru untuk memulai." />
          )
        }
      />

      <SelectModal
        visible={isAcademicYearModalOpen}
        title="Pilih Tahun Ajaran"
        options={(academicYearOptionsQuery.data ?? []).map((option) => ({
          label: option.name,
          value: option.id,
        }))}
        selectedValue={academicYearId}
        onSelect={setAcademicYearId}
        onClose={() => setIsAcademicYearModalOpen(false)}
        clearLabel="Semua Tahun Ajaran"
      />
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.segmentButton, active && { backgroundColor: theme.primary }]}
      onPress={onPress}>
      <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  item: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
