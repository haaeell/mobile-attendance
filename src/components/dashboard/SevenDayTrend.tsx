import { StyleSheet, Text, View } from 'react-native';

import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateShort, formatPercentage } from '@/utils/formatters';
import type { SevenDayStatEntry } from '@/types/dashboard';

export interface SevenDayTrendProps {
  data: SevenDayStatEntry[];
}

const BAR_MAX_HEIGHT = 80;

/**
 * Visualisasi batang sederhana persentase kehadiran 7 hari terakhir, tanpa
 * dependency library chart eksternal.
 */
export function SevenDayTrend({ data }: SevenDayTrendProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, CardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.row}>
        {data.map((entry) => {
          const barHeight = Math.max(4, (entry.attendance_percentage / 100) * BAR_MAX_HEIGHT);
          const barColor =
            entry.attendance_percentage >= 90
              ? theme.success
              : entry.attendance_percentage >= 75
                ? theme.warning
                : theme.danger;

          return (
            <View key={entry.date} style={styles.column}>
              <Text style={[styles.percentage, { color: theme.textSecondary }]}>
                {formatPercentage(entry.attendance_percentage)}
              </Text>
              <View style={[styles.track, { height: BAR_MAX_HEIGHT, backgroundColor: theme.border }]}>
                <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
              </View>
              <Text style={[styles.dayLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {formatDateShort(entry.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  percentage: {
    fontSize: 10,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});
