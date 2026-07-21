import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.cardRow}>
        <Skeleton height={96} radius={Radius.lg} style={styles.flexCard} />
        <Skeleton height={96} radius={Radius.lg} style={styles.flexCard} />
        <Skeleton height={96} radius={Radius.lg} style={styles.flexCard} />
      </View>
      <Skeleton height={120} radius={Radius.lg} />
      <Skeleton height={120} radius={Radius.lg} />
      <Skeleton height={140} radius={Radius.lg} />
      <Skeleton height={160} radius={Radius.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flexCard: {
    flex: 1,
  },
});
