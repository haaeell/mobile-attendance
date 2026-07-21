import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge, type StatusBadgeTone } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useClassroomOptions } from '@/hooks/useClassroomOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useStudents } from '@/hooks/useStudents';
import { useTheme } from '@/hooks/use-theme';
import type { Student } from '@/types/student';

export default function AdminStudentsListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);

  const debouncedKeyword = useDebouncedValue(keyword);
  const classroomOptionsQuery = useClassroomOptions();

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
  } = useStudents({
    keyword: debouncedKeyword || undefined,
    classroom_id: classroomId ?? undefined,
  });

  const students = useMemo<Student[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const selectedClassroomLabel =
    classroomOptionsQuery.data?.find((option) => option.id === classroomId)?.name ?? 'Semua Kelas';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton title="+ Tambah Siswa" onPress={() => router.push('/(app)/admin/students/create')} />

            <AppInput
              placeholder="Cari nama, NIS, atau NISN..."
              value={keyword}
              onChangeText={setKeyword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            <Pressable
              style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsClassroomModalOpen(true)}>
              <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                {selectedClassroomLabel}
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <StudentListItem item={item} onPress={() => router.push(`/(app)/admin/students/${item.id}`)} />
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
              title="Gagal memuat siswa"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="Belum ada siswa"
              message="Tidak ada data yang cocok dengan pencarian/filter saat ini."
            />
          )
        }
      />

      <SelectModal
        visible={isClassroomModalOpen}
        title="Pilih Kelas"
        options={(classroomOptionsQuery.data ?? []).map((option) => ({
          label: option.name,
          value: option.id,
        }))}
        selectedValue={classroomId}
        onSelect={setClassroomId}
        onClose={() => setIsClassroomModalOpen(false)}
        clearLabel="Semua Kelas"
      />
    </View>
  );
}

const STATUS_TONE: Record<'active' | 'inactive', StatusBadgeTone> = {
  active: 'success',
  inactive: 'neutral',
};

function StudentListItem({ item, onPress }: { item: Student; onPress: () => void }) {
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
        NIS {item.nis}
        {item.classroom ? ` • ${item.classroom.name}` : ''}
      </Text>
      <View style={styles.itemFooterRow}>
        <StatusBadge label={item.barcode_status_label} tone={STATUS_TONE[item.barcode_status]} />
      </View>
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
  itemFooterRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs / 2,
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
