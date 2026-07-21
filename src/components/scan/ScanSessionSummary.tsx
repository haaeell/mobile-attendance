import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/utils/formatters';
import type { ScanSessionEntry } from '@/types/scan';

export interface ScanSessionSummaryProps {
  successCount: number;
  history: ScanSessionEntry[];
}

export function ScanSessionSummary({ successCount, history }: ScanSessionSummaryProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.countRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          Total scan berhasil sesi ini
        </Text>
        <Text style={[styles.countValue, { color: theme.success }]}>{successCount}</Text>
      </View>

      {history.length > 0 ? (
        <View style={styles.list}>
          {history.map((entry) => (
            <View
              key={entry.id}
              style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {entry.outcome === 'success' ? (
                <>
                  <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {entry.data.name}
                  </Text>
                  <StatusBadge
                    label={entry.data.scan_type === 'check_in' ? 'Masuk' : 'Pulang'}
                    tone="success"
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.itemName, { color: theme.danger }]} numberOfLines={1}>
                    {entry.message}
                  </Text>
                  <StatusBadge label="Gagal" tone="danger" />
                </>
              )}
              <Text style={[styles.itemTime, { color: theme.textSecondary }]}>
                {formatRelativeTime(new Date(entry.scannedAt))}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  countLabel: {
    fontSize: 13,
  },
  countValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  itemTime: {
    fontSize: 11,
  },
});
