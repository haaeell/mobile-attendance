import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorName } from '@/constants/theme';

export interface SummaryCardProps {
  label: string;
  value: string | number;
  tone?: Extract<ThemeColorName, 'primary' | 'success' | 'warning' | 'danger'>;
  caption?: string;
  icon?: LucideIcon;
}

/**
 * Kartu ringkasan generik (ikon + angka besar + label), dipakai untuk jumlah
 * siswa/guru/kelas dan statistik kehadiran. Reusable di luar dashboard.
 */
export function SummaryCard({ label, value, tone = 'primary', caption, icon: Icon }: SummaryCardProps) {
  const theme = useTheme();
  const accentColor = theme[tone];

  return (
    <View style={[styles.card, CardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {Icon ? (
        <View style={[styles.iconBadge, { backgroundColor: `${accentColor}1A` }]}>
          <Icon color={accentColor} size={20} />
        </View>
      ) : null}
      <Text style={[styles.value, { color: theme.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
      {caption ? (
        <Text style={[styles.caption, { color: accentColor }]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs / 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs / 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.xs / 2,
  },
});
