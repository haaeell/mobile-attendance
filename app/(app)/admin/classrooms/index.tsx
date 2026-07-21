import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useAcademicYearOptions } from '@/hooks/useAcademicYearOptions';
import { useClassrooms } from '@/hooks/useClassrooms';
import { useTheme } from '@/hooks/use-theme';
import type { Classroom } from '@/types/classroom';

export default function AdminClassroomsListScreen() {
  const theme = useTheme();
  const router = useRouter();

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
  } = useClassrooms({ academic_year_id: academicYearId ?? undefined });

  const classrooms = useMemo<Classroom[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const selectedAcademicYearLabel =
    academicYearOptionsQuery.data?.find((option) => option.id === academicYearId)?.name ?? 'Semua Tahun Ajaran';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={classrooms}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton title="+ Tambah Kelas" onPress={() => router.push('/(app)/admin/classrooms/create')} />

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
          <ClassroomListItem item={item} onPress={() => router.push(`/(app)/admin/classrooms/${item.id}`)} />
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
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat kelas"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada kelas" message="Tidak ada data yang cocok dengan filter saat ini." />
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

function ClassroomListItem({ item, onPress }: { item: Classroom; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={styles.itemHeaderRow}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <StatusBadge
          label={item.is_active ? 'Aktif' : 'Tidak Aktif'}
          tone={item.is_active ? 'success' : 'danger'}
        />
      </View>
      <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
        {item.grade_level}
        {item.major ? ` • ${item.major}` : ''}
        {item.academic_year?.name ? ` • ${item.academic_year.name}` : ''}
      </Text>
      <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
        Wali Kelas: {item.homeroom_teacher?.name ?? 'Belum ditentukan'}
      </Text>
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
    gap: Spacing.xs / 2,
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
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
