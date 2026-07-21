import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AttendanceFilterBar, type AttendanceListMode } from '@/components/attendance/AttendanceFilterBar';
import { AttendanceListItem } from '@/components/attendance/AttendanceListItem';
import { AttendanceListSkeleton } from '@/components/attendance/AttendanceListSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendances, useAttendancesToday } from '@/hooks/useAttendances';
import { useClassroomOptions } from '@/hooks/useClassroomOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTheme } from '@/hooks/use-theme';
import type { Attendance, AttendanceFinalStatus } from '@/types/attendance';

export default function AttendanceListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<AttendanceListMode>('today');
  const [keyword, setKeyword] = useState('');
  const [subjectType, setSubjectType] = useState<'student' | 'teacher' | null>(null);
  const [status, setStatus] = useState<AttendanceFinalStatus | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword);

  const classroomOptionsQuery = useClassroomOptions();

  const sharedFilters = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      subject_type: subjectType ?? undefined,
      status: status ?? undefined,
      classroom_id: classroomId ?? undefined,
    }),
    [debouncedKeyword, subjectType, status, classroomId],
  );

  const todayQuery = useAttendancesToday(sharedFilters);
  const allQuery = useAttendances({
    ...sharedFilters,
    start_date: startDate ?? undefined,
    end_date: endDate ?? undefined,
  });

  const activeQuery = mode === 'today' ? todayQuery : allQuery;
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
  } = activeQuery;

  const attendances = useMemo<Attendance[]>(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={attendances}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <AttendanceFilterBar
            mode={mode}
            onModeChange={setMode}
            keyword={keyword}
            onKeywordChange={setKeyword}
            subjectType={subjectType}
            onSubjectTypeChange={setSubjectType}
            status={status}
            onStatusChange={setStatus}
            classroomId={classroomId}
            onClassroomIdChange={setClassroomId}
            classroomOptions={classroomOptionsQuery.data ?? []}
            showClassroomFilter={user?.role === 'admin'}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        }
        renderItem={({ item }) => (
          <AttendanceListItem
            attendance={item}
            onPress={() => router.push(`/(app)/attendance/${item.id}`)}
          />
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
            <AttendanceListSkeleton />
          ) : isError ? (
            <ErrorState
              title="Gagal memuat absensi"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="Belum ada data absensi"
              message="Tidak ada data yang cocok dengan filter saat ini."
            />
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
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
