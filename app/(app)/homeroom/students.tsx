import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useHomeroomStudents } from '@/hooks/useHomeroomStudents';
import { useTheme } from '@/hooks/use-theme';
import type { Student } from '@/types/student';

export default function HomeroomStudentsScreen() {
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
  } = useHomeroomStudents();

  const students = useMemo<Student[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/homeroom/update-status',
                params: { studentId: String(item.id) },
              })
            }
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
              NIS {item.nis}
              {item.nisn ? ` • NISN ${item.nisn}` : ''}
            </Text>
            {item.parent_name ? (
              <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
                Wali: {item.parent_name}
              </Text>
            ) : null}
          </Pressable>
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
              <Skeleton height={70} />
              <Skeleton height={70} />
              <Skeleton height={70} />
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat siswa"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada siswa" message="Tidak ada siswa di kelas yang Anda ampu." />
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
    gap: Spacing.xs / 2,
  },
  name: {
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
