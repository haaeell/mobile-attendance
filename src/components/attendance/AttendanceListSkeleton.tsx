import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';
import { Spacing } from '@/constants/theme';

export function AttendanceListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <Skeleton key={key} height={84} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
});
