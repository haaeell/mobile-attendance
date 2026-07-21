import { StyleSheet, Text, View } from 'react-native';

import type { StatusBadgeTone } from '@/components/StatusBadge';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AttendanceStatsToday } from '@/types/dashboard';

const CELLS: { key: keyof AttendanceStatsToday; label: string; tone: StatusBadgeTone }[] = [
  { key: 'present', label: 'Hadir', tone: 'success' },
  { key: 'late', label: 'Terlambat', tone: 'warning' },
  { key: 'permission', label: 'Izin', tone: 'info' },
  { key: 'sick', label: 'Sakit', tone: 'info' },
  { key: 'dispensation', label: 'Dispensasi', tone: 'info' },
  { key: 'alpha', label: 'Alpha', tone: 'danger' },
  { key: 'not_recorded', label: 'Belum Tercatat', tone: 'neutral' },
];

export interface AttendanceStatBreakdownProps {
  title: string;
  stats: AttendanceStatsToday;
}

/**
 * Rincian statistik kehadiran hari ini (siswa/guru) dalam bentuk grid kecil
 * yang lebih mudah dipindai matanya dibanding badge sebaris.
 */
export function AttendanceStatBreakdown({ title, stats }: AttendanceStatBreakdownProps) {
  const theme = useTheme();

  const toneColor: Record<StatusBadgeTone, string> = {
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.primary,
    neutral: theme.textSecondary,
  };

  return (
    <View style={[styles.container, CardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.total, { color: theme.textSecondary }]}>Total {stats.total}</Text>
      </View>
      <View style={styles.grid}>
        {CELLS.map(({ key, label, tone }) => (
          <View key={key} style={styles.cell}>
            <View style={styles.cellHeader}>
              <View style={[styles.dot, { backgroundColor: toneColor[tone] }]} />
              <Text style={[styles.cellValue, { color: theme.textPrimary }]}>{stats[key]}</Text>
            </View>
            <Text style={[styles.cellLabel, { color: theme.textSecondary }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  total: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '25%',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs / 4,
  },
  cellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  cellValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  cellLabel: {
    fontSize: 11,
  },
});
