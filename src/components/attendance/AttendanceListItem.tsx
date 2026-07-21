import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, type StatusBadgeTone } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateShort, formatTime } from '@/utils/formatters';
import type { Attendance, AttendanceFinalStatus } from '@/types/attendance';

const STATUS_TONE: Record<AttendanceFinalStatus, StatusBadgeTone> = {
  present: 'success',
  late: 'warning',
  permission: 'info',
  sick: 'info',
  dispensation: 'info',
  alpha: 'danger',
};

export interface AttendanceListItemProps {
  attendance: Attendance;
  onPress: () => void;
}

export function AttendanceListItem({ attendance, onPress }: AttendanceListItemProps) {
  const theme = useTheme();
  const isStudent = attendance.subject_type === 'student';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {attendance.subject?.name ?? 'Tidak diketahui'}
        </Text>
        <StatusBadge label={attendance.final_status_label} tone={STATUS_TONE[attendance.final_status]} />
      </View>

      <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
        {isStudent ? 'Siswa' : 'Guru'}
        {attendance.subject?.classroom ? ` • ${attendance.subject.classroom.name}` : ''}
        {' • '}
        {formatDateShort(attendance.attendance_date)}
      </Text>

      <View style={styles.footerRow}>
        <Text style={[styles.time, { color: theme.textSecondary }]}>
          Masuk {attendance.check_in_at ? formatTime(attendance.check_in_at) : '-'}
          {'  •  '}
          Pulang {attendance.check_out_at ? formatTime(attendance.check_out_at) : '-'}
        </Text>
        {attendance.late_minutes > 0 ? (
          <Text style={[styles.lateMinutes, { color: theme.warning }]}>
            +{attendance.late_minutes} menit
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs / 2,
  },
  headerRow: {
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs / 2,
  },
  time: {
    fontSize: 12,
  },
  lateMinutes: {
    fontSize: 12,
    fontWeight: '700',
  },
});
