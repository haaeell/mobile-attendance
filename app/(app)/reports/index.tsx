import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { FileSpreadsheet, FileText, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AttendanceListItem } from '@/components/attendance/AttendanceListItem';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendanceReport } from '@/hooks/useAttendanceReport';
import { useClassroomOptions } from '@/hooks/useClassroomOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExportAttendanceReportExcel, useExportAttendanceReportPdf } from '@/hooks/useExportAttendanceReport';
import { useTheme } from '@/hooks/use-theme';
import { formatDateShort, formatPercentage } from '@/utils/formatters';
import { saveArrayBufferToCacheFile, shareFile } from '@/utils/fileDownload';
import type { Attendance, AttendanceFinalStatus } from '@/types/attendance';
import type { NormalizedApiError } from '@/types/api';
import type { AttendanceReportFilters } from '@/types/report';

type DateMode = 'date' | 'range';

const SUBJECT_TYPE_OPTIONS: { label: string; value: 'student' | 'teacher' | null }[] = [
  { label: 'Semua', value: null },
  { label: 'Siswa', value: 'student' },
  { label: 'Guru', value: 'teacher' },
];

const STATUS_OPTIONS: { label: string; value: AttendanceFinalStatus | null }[] = [
  { label: 'Semua', value: null },
  { label: 'Hadir', value: 'present' },
  { label: 'Terlambat', value: 'late' },
  { label: 'Izin', value: 'permission' },
  { label: 'Sakit', value: 'sick' },
  { label: 'Dispensasi', value: 'dispensation' },
  { label: 'Alpha', value: 'alpha' },
];

export default function ReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [dateMode, setDateMode] = useState<DateMode>('date');
  const [date, setDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [datePickerTarget, setDatePickerTarget] = useState<'date' | 'start' | 'end' | null>(null);
  const [subjectType, setSubjectType] = useState<'student' | 'teacher' | null>(null);
  const [status, setStatus] = useState<AttendanceFinalStatus | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const debouncedKeyword = useDebouncedValue(keyword);
  const classroomOptionsQuery = useClassroomOptions();

  const filters = useMemo<AttendanceReportFilters>(
    () => ({
      date: dateMode === 'date' ? date ?? undefined : undefined,
      start_date: dateMode === 'range' ? startDate ?? undefined : undefined,
      end_date: dateMode === 'range' ? endDate ?? undefined : undefined,
      subject_type: subjectType ?? undefined,
      classroom_id: classroomId ?? undefined,
      status: status ?? undefined,
      keyword: debouncedKeyword || undefined,
    }),
    [dateMode, date, startDate, endDate, subjectType, classroomId, status, debouncedKeyword],
  );

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
  } = useAttendanceReport(filters);

  const exportExcelMutation = useExportAttendanceReportExcel();
  const exportPdfMutation = useExportAttendanceReportPdf();

  const summary = data?.pages[0]?.summary;
  const rows = useMemo<Attendance[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const selectedClassroomLabel =
    classroomOptionsQuery.data?.find((option) => option.id === classroomId)?.name ?? 'Semua Kelas';

  const handleExport = (kind: 'excel' | 'pdf') => {
    const mutation = kind === 'excel' ? exportExcelMutation : exportPdfMutation;

    mutation.mutate(filters, {
      onSuccess: async (result) => {
        try {
          const file = saveArrayBufferToCacheFile(result.data, result.filename);
          await shareFile(file, {
            mimeType:
              kind === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf',
            dialogTitle: 'Laporan Absensi',
          });
        } catch (shareError) {
          Alert.alert('Gagal', (shareError as Error).message ?? 'Gagal membuka file laporan.');
        }
      },
      onError: (apiError: NormalizedApiError) => {
        Alert.alert('Gagal', apiError.message || 'Gagal mengekspor laporan.');
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.segmented, { borderColor: theme.border }]}>
              <SegmentButton label="Tanggal" active={dateMode === 'date'} onPress={() => setDateMode('date')} />
              <SegmentButton label="Rentang Tanggal" active={dateMode === 'range'} onPress={() => setDateMode('range')} />
            </View>

            {dateMode === 'date' ? (
              <Pressable
                style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setDatePickerTarget('date')}>
                <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                  {date ? formatDateShort(date) : 'Semua tanggal'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.rowWrap}>
                <Pressable
                  style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={() => setDatePickerTarget('start')}>
                  <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                    Dari: {startDate ? formatDateShort(startDate) : '-'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={() => setDatePickerTarget('end')}>
                  <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                    Sampai: {endDate ? formatDateShort(endDate) : '-'}
                  </Text>
                </Pressable>
              </View>
            )}

            <AppInput
              icon={Search}
              placeholder="Cari nama..."
              value={keyword}
              onChangeText={setKeyword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            <ChipRow options={SUBJECT_TYPE_OPTIONS} selected={subjectType} onSelect={setSubjectType} />
            <ChipRow options={STATUS_OPTIONS} selected={status} onSelect={setStatus} />

            {user?.role === 'admin' ? (
              <Pressable
                style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setIsClassroomModalOpen(true)}>
                <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                  {selectedClassroomLabel}
                </Text>
              </Pressable>
            ) : null}

            {summary ? (
              <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>Ringkasan</Text>
                <View style={styles.summaryGrid}>
                  <SummaryItem label="Total" value={summary.total_records} theme={theme} />
                  <SummaryItem label="Hadir" value={summary.present} theme={theme} />
                  <SummaryItem label="Terlambat" value={summary.late} theme={theme} />
                  <SummaryItem label="Izin" value={summary.permission} theme={theme} />
                  <SummaryItem label="Sakit" value={summary.sick} theme={theme} />
                  <SummaryItem label="Dispensasi" value={summary.dispensation} theme={theme} />
                  <SummaryItem label="Alpha" value={summary.alpha} theme={theme} />
                </View>
                <Text style={[styles.subLine, { color: theme.textSecondary }]}>
                  Persentase kehadiran: {formatPercentage(summary.attendance_percentage)} • Total menit
                  terlambat: {summary.total_late_minutes}
                </Text>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Export Excel"
                  icon={FileSpreadsheet}
                  variant="secondary"
                  onPress={() => handleExport('excel')}
                  loading={exportExcelMutation.isPending}
                />
              </View>
              <View style={styles.actionButton}>
                <AppButton
                  title="Export PDF"
                  icon={FileText}
                  variant="secondary"
                  onPress={() => handleExport('pdf')}
                  loading={exportPdfMutation.isPending}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Detail</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AttendanceListItem attendance={item} onPress={() => router.push(`/(app)/attendance/${item.id}`)} />
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
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat laporan"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada data" message="Tidak ada data yang cocok dengan filter saat ini." />
          )
        }
      />

      <SelectModal
        visible={isClassroomModalOpen}
        title="Pilih Kelas"
        options={(classroomOptionsQuery.data ?? []).map((option) => ({ label: option.name, value: option.id }))}
        selectedValue={classroomId}
        onSelect={setClassroomId}
        onClose={() => setIsClassroomModalOpen(false)}
        clearLabel="Semua Kelas"
      />

      {datePickerTarget ? (
        <DateTimePicker
          value={
            (datePickerTarget === 'date'
              ? date && new Date(date)
              : datePickerTarget === 'start'
                ? startDate && new Date(startDate)
                : endDate && new Date(endDate)) || new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const target = datePickerTarget;
            setDatePickerTarget(null);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            const isoDate = selectedDate.toISOString().slice(0, 10);

            if (target === 'date') {
              setDate(isoDate);
            } else if (target === 'start') {
              setStartDate(isoDate);
            } else if (target === 'end') {
              setEndDate(isoDate);
            }
          }}
        />
      ) : null}
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable style={[styles.segmentButton, active && { backgroundColor: theme.primary }]} onPress={onPress}>
      <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function ChipRow<T extends string | null>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((option) => {
        const isActive = option.value === selected;

        return (
          <Pressable
            key={option.label}
            onPress={() => onSelect(option.value)}
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
  );
}

function SummaryItem({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
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
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
  summaryCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryItem: {
    minWidth: 70,
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
