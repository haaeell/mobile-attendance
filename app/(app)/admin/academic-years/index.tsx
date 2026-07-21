import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useActivateAcademicYear } from '@/hooks/useActivateAcademicYear';
import { useDeleteAcademicYear } from '@/hooks/useDeleteAcademicYear';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { AcademicYear } from '@/types/academicYear';

export default function AdminAcademicYearsListScreen() {
  const theme = useTheme();
  const router = useRouter();

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
  } = useAcademicYears();

  const activateMutation = useActivateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();

  const academicYears = useMemo<AcademicYear[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const showError = (apiError: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', apiError.message || fallback);
  };

  const handleActivate = (academicYear: AcademicYear) => {
    Alert.alert(
      'Aktifkan Tahun Ajaran',
      `Hanya satu tahun ajaran yang dapat aktif. Mengaktifkan "${academicYear.name}" akan menonaktifkan tahun ajaran lain yang sedang aktif. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Aktifkan',
          onPress: () => {
            activateMutation.mutate(academicYear.id, {
              onError: (mutationError) => showError(mutationError, 'Gagal mengaktifkan tahun ajaran.'),
            });
          },
        },
      ],
    );
  };

  const handleDelete = (academicYear: AcademicYear) => {
    Alert.alert(
      'Hapus Tahun Ajaran',
      `Yakin ingin menghapus tahun ajaran "${academicYear.name}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(academicYear.id, {
              onError: (mutationError) => showError(mutationError, 'Gagal menghapus tahun ajaran.'),
            });
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={academicYears}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <AppButton
            title="+ Tambah Tahun Ajaran"
            onPress={() => router.push('/(app)/admin/academic-years/create')}
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.itemHeaderRow}>
              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <StatusBadge
                label={item.is_active ? 'Aktif' : 'Tidak Aktif'}
                tone={item.is_active ? 'success' : 'neutral'}
              />
            </View>
            <Text style={[styles.subLine, { color: theme.textSecondary }]}>
              {formatDateLong(item.start_date)} s/d {formatDateLong(item.end_date)}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Edit"
                  variant="secondary"
                  onPress={() => router.push(`/(app)/admin/academic-years/edit/${item.id}`)}
                />
              </View>
              {!item.is_active ? (
                <View style={styles.actionButton}>
                  <AppButton
                    title="Aktifkan"
                    variant="secondary"
                    onPress={() => handleActivate(item)}
                    loading={activateMutation.isPending}
                  />
                </View>
              ) : null}
              <View style={styles.actionButton}>
                <AppButton
                  title="Hapus"
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
              title="Gagal memuat tahun ajaran"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada tahun ajaran" message="Tambahkan tahun ajaran baru untuk memulai." />
          )
        }
      />
    </View>
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
    fontSize: 15,
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
