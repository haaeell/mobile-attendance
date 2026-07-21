import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge, type StatusBadgeTone } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useHomeroomAttendances } from '@/hooks/useHomeroomAttendances';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong } from '@/utils/formatters';
import type { HomeroomAttendanceRow, HomeroomAttendanceStatus } from '@/types/homeroom';

const STATUS_TONE: Record<HomeroomAttendanceStatus, StatusBadgeTone> = {
  present: 'success',
  late: 'warning',
  permission: 'info',
  sick: 'info',
  dispensation: 'info',
  alpha: 'danger',
  not_recorded: 'neutral',
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HomeroomAttendancesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [date, setDate] = useState(todayIsoDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showOnlyNotPresent, setShowOnlyNotPresent] = useState(false);

  const { data, isPending, isError, error, refetch, isRefetching } = useHomeroomAttendances(date);

  const rows = useMemo(() => {
    const list = data ?? [];

    if (!showOnlyNotPresent) {
      return list;
    }

    return list.filter((row) => row.status === 'alpha' || row.status === 'not_recorded');
  }, [data, showOnlyNotPresent]);

  const isToday = date === todayIsoDate();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(row) => String(row.student.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {isToday ? 'Kehadiran Hari Ini' : 'Riwayat Absensi'}
            </Text>

            <Pressable
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsDatePickerOpen(true)}>
              <Text style={[styles.dateButtonText, { color: theme.textPrimary }]}>
                {formatDateLong(date)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowOnlyNotPresent((value) => !value)}
              style={[
                styles.filterChip,
                {
                  borderColor: showOnlyNotPresent ? theme.primary : theme.border,
                  backgroundColor: showOnlyNotPresent ? theme.primary : theme.surface,
                },
              ]}>
              <Text
                style={[
                  styles.filterChipText,
                  { color: showOnlyNotPresent ? '#FFFFFF' : theme.textPrimary },
                ]}>
                Hanya Siswa Belum Hadir
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <AttendanceRow
            row={item}
            onPress={() =>
              router.push({
                pathname: '/(app)/homeroom/update-status',
                params: { studentId: String(item.student.id), date },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
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
              title="Gagal memuat kehadiran"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="Belum ada data"
              message="Tidak ada data kehadiran yang cocok untuk tanggal ini."
            />
          )
        }
      />

      {isDatePickerOpen ? (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setIsDatePickerOpen(false);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            setDate(selectedDate.toISOString().slice(0, 10));
          }}
        />
      ) : null}
    </View>
  );
}

function AttendanceRow({ row, onPress }: { row: HomeroomAttendanceRow; onPress: () => void }) {
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
          {row.student.name}
        </Text>
        <StatusBadge label={row.status_label} tone={STATUS_TONE[row.status]} />
      </View>
      <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
        NIS {row.student.nis}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  dateButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  filterChipText: {
    fontSize: 12,
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
});
