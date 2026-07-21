import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, error, style, ...textInputProps },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            borderColor: error ? theme.danger : theme.border,
            color: theme.textPrimary,
            backgroundColor: theme.surface,
          },
          style,
        ]}
        {...textInputProps}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
  },
});
