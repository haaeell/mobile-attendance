import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      {message ? <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  message: {
    fontSize: 14,
  },
});
