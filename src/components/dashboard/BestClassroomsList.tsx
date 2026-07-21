import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPercentage } from '@/utils/formatters';
import type { BestClassroomEntry } from '@/types/dashboard';

export interface BestClassroomsListProps {
  classrooms: BestClassroomEntry[];
}

const MEDAL_COLORS = ['#D4AF37', '#A8A9AD', '#B8752B'];

export function BestClassroomsList({ classrooms }: BestClassroomsListProps) {
  const theme = useTheme();

  if (classrooms.length === 0) {
    return <EmptyState title="Belum ada data" message="Kelas dengan kehadiran terbaik akan muncul di sini." />;
  }

  return (
    <View style={styles.list}>
      {classrooms.map((classroom, index) => (
        <View key={classroom.id} style={[styles.item, CardShadow, { backgroundColor: theme.surface }]}>
          <View style={[styles.rank, { backgroundColor: MEDAL_COLORS[index] ?? theme.primary }]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
            {classroom.name}
          </Text>
          <Text style={[styles.percentage, { color: theme.success }]}>
            {formatPercentage(classroom.attendance_percentage)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rank: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
});
