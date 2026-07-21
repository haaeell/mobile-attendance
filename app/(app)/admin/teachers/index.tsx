import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge, type StatusBadgeTone } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTeachers } from '@/hooks/useTeachers';
import { useTheme } from '@/hooks/use-theme';
import type { Teacher } from '@/types/teacher';

const BARCODE_STATUS_TONE: Record<'active' | 'inactive', StatusBadgeTone> = {
  active: 'success',
  inactive: 'neutral',
};

export default function AdminTeachersListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

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
  } = useTeachers({ search: debouncedSearch || undefined });

  const teachers = useMemo<Teacher[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={teachers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton title="+ Tambah Guru" onPress={() => router.push('/(app)/admin/teachers/create')} />

            <AppInput
              placeholder="Cari nama atau nomor induk guru..."
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        }
        renderItem={({ item }) => (
          <TeacherListItem item={item} onPress={() => router.push(`/(app)/admin/teachers/${item.id}`)} />
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
              title="Gagal memuat guru"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="Belum ada guru"
              message="Tidak ada data yang cocok dengan pencarian saat ini."
            />
          )
        }
      />
    </View>
  );
}

function TeacherListItem({ item, onPress }: { item: Teacher; onPress: () => void }) {
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
        NIP {item.teacher_number} • {item.email}
      </Text>
      <View style={styles.itemFooterRow}>
        <StatusBadge label={item.barcode_status_label} tone={BARCODE_STATUS_TONE[item.barcode_status]} />
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
