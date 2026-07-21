import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Ikon di sisi kiri input (lucide-react-native), murni visual. */
  icon?: LucideIcon;
  /** Elemen opsional di sisi kanan input, mis. tombol show/hide password. */
  rightElement?: ReactNode;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, error, icon: Icon, rightElement, style, ...textInputProps },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? theme.danger : theme.border,
            backgroundColor: theme.surface,
          },
        ]}>
        {Icon ? (
          <View style={styles.leftIcon}>
            <Icon size={18} color={theme.textSecondary} />
          </View>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary }, !Icon && styles.inputNoIcon, style]}
          {...textInputProps}
        />
        {rightElement}
      </View>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingRight: Spacing.sm,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
    fontSize: 16,
  },
  inputNoIcon: {
    paddingLeft: Spacing.md,
  },
  error: {
    fontSize: 13,
  },
});
