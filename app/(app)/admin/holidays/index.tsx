import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useDeleteHoliday } from '@/hooks/useDeleteHoliday';
import { useHolidays } from '@/hooks/useHolidays';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong } from '@/utils/formatters';
import type { NormalizedApiError } from '@/types/api';
import type { Holiday, HolidayAppliesTo } from '@/types/holiday';

const APPLIES_TO_OPTIONS: { label: string; value: HolidayAppliesTo | null }[] = [
  { label: 'Semua', value: null },
  { label: 'Cakupan: Semua', value: 'all' },
  { label: 'Siswa', value: 'student' },
  { label: 'Guru', value: 'teacher' },
];

export default function AdminHolidaysListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [appliesTo, setAppliesTo] = useState<HolidayAppliesTo | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

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
  } = useHolidays({
    applies_to: appliesTo ?? undefined,
    start_date: startDate ?? undefined,
    end_date: endDate ?? undefined,
  });

  const deleteMutation = useDeleteHoliday();

  const holidays = useMemo<Holiday[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const showError = (apiError: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', apiError.message || fallback);
  };

  const handleDelete = (holiday: Holiday) => {
    Alert.alert('Hapus Hari Libur', `Yakin ingin menghapus "${holiday.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(holiday.id, {
            onError: (mutationError) => showError(mutationError, 'Gagal menghapus hari libur.'),
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={holidays}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppButton title="+ Tambah Hari Libur" onPress={() => router.push('/(app)/admin/holidays/create')} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {APPLIES_TO_OPTIONS.map((option) => {
                const isActive = option.value === appliesTo;

                return (
                  <Pressable
                    key={option.label}
                    onPress={() => setAppliesTo(option.value)}
                    style={[
                      styles.chip,
                      {
                        borderColor: isActive ? theme.primary : theme.border,
                        backgroundColor: isActive ? theme.primary : theme.surface,
                      },
                    ]}>
                    <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : theme.textPrimary }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.rowWrap}>
              <Pressable
                style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setDatePickerTarget('start')}>
                <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                  Dari: {startDate ? formatDateLong(startDate) : '-'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setDatePickerTarget('end')}>
                <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                  Sampai: {endDate ? formatDateLong(endDate) : '-'}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.itemHeaderRow}>
              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <StatusBadge label={item.applies_to_label} tone="info" />
            </View>
            <Text style={[styles.subLine, { color: theme.textSecondary }]}>
              {formatDateLong(item.start_date)}
              {item.end_date !== item.start_date ? ` s/d ${formatDateLong(item.end_date)}` : ''}
            </Text>
            {item.description ? (
              <Text style={[styles.subLine, { color: theme.textSecondary }]}>{item.description}</Text>
            ) : null}
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Edit"
                  variant="secondary"
                  onPress={() => router.push(`/(app)/admin/holidays/edit/${item.id}`)}
                />
              </View>
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
              <Skeleton height={90} />
              <Skeleton height={90} />
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat hari libur"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada hari libur" message="Tidak ada data yang cocok dengan filter saat ini." />
          )
        }
      />

      {datePickerTarget ? (
        <DateTimePicker
          value={
            (datePickerTarget === 'start' ? startDate && new Date(startDate) : endDate && new Date(endDate)) ||
            new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setDatePickerTarget(null);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            const isoDate = selectedDate.toISOString().slice(0, 10);

            if (datePickerTarget === 'start') {
              setStartDate(isoDate);
            } else {
              setEndDate(isoDate);
            }
          }}
        />
      ) : null}
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
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  item: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
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
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
