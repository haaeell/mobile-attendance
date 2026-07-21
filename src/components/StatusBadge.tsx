import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatusBadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
}

/**
 * Badge status generik (mis. untuk status kehadiran: Hadir/Terlambat/Alpha).
 * Pemetaan status -> tone dilakukan oleh pemanggil, bukan di sini, supaya
 * komponen ini tetap dasar dan dipakai ulang untuk konteks lain.
 */
export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const theme = useTheme();

  const toneColor = {
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.primary,
    neutral: theme.textSecondary,
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: `${toneColor}1F`, borderColor: toneColor }]}>
      <Text style={[styles.label, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
