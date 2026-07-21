import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({ title = 'Belum ada data', message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});
