import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppInput } from '@/components/AppInput';
import { SelectModal } from '@/components/SelectModal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateShort } from '@/utils/formatters';
import type { AttendanceFinalStatus, ClassroomOption } from '@/types/attendance';

export type AttendanceListMode = 'today' | 'all';

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

export interface AttendanceFilterBarProps {
  mode: AttendanceListMode;
  onModeChange: (mode: AttendanceListMode) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  subjectType: 'student' | 'teacher' | null;
  onSubjectTypeChange: (value: 'student' | 'teacher' | null) => void;
  status: AttendanceFinalStatus | null;
  onStatusChange: (value: AttendanceFinalStatus | null) => void;
  classroomId: number | null;
  onClassroomIdChange: (value: number | null) => void;
  classroomOptions: ClassroomOption[];
  showClassroomFilter: boolean;
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (value: string | null) => void;
  onEndDateChange: (value: string | null) => void;
}

export function AttendanceFilterBar({
  mode,
  onModeChange,
  keyword,
  onKeywordChange,
  subjectType,
  onSubjectTypeChange,
  status,
  onStatusChange,
  classroomId,
  onClassroomIdChange,
  classroomOptions,
  showClassroomFilter,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: AttendanceFilterBarProps) {
  const theme = useTheme();
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const selectedClassroomLabel =
    classroomOptions.find((option) => option.id === classroomId)?.name ?? 'Semua Kelas';

  return (
    <View style={styles.container}>
      <View style={[styles.segmented, { borderColor: theme.border }]}>
        <SegmentButton label="Hari Ini" active={mode === 'today'} onPress={() => onModeChange('today')} />
        <SegmentButton label="Semua" active={mode === 'all'} onPress={() => onModeChange('all')} />
      </View>

      <AppInput
        placeholder="Cari nama..."
        value={keyword}
        onChangeText={onKeywordChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <ChipRow
        options={SUBJECT_TYPE_OPTIONS}
        selected={subjectType}
        onSelect={onSubjectTypeChange}
      />

      <ChipRow options={STATUS_OPTIONS} selected={status} onSelect={onStatusChange} />

      <View style={styles.rowWrap}>
        {showClassroomFilter ? (
          <Pressable
            style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => setIsClassroomModalOpen(true)}>
            <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
              {selectedClassroomLabel}
            </Text>
          </Pressable>
        ) : null}

        {mode === 'all' ? (
          <>
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
          </>
        ) : null}
      </View>

      <SelectModal
        visible={isClassroomModalOpen}
        title="Pilih Kelas"
        options={classroomOptions.map((option) => ({ label: option.name, value: option.id }))}
        selectedValue={classroomId}
        onSelect={onClassroomIdChange}
        onClose={() => setIsClassroomModalOpen(false)}
        clearLabel="Semua Kelas"
      />

      {datePickerTarget ? (
        <DateTimePicker
          value={
            datePickerTarget === 'start'
              ? startDate
                ? new Date(startDate)
                : new Date()
              : endDate
                ? new Date(endDate)
                : new Date()
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
              onStartDateChange(isoDate);
            } else {
              onEndDateChange(isoDate);
            }
          }}
        />
      ) : null}
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.segmentButton, active && { backgroundColor: theme.primary }]}
      onPress={onPress}>
      <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : theme.textSecondary }]}>
        {label}
      </Text>
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

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
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
});
