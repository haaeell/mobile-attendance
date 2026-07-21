import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/utils/formatters';
import type { ScanLogEntry } from '@/types/attendance';

export interface RecentScansListProps {
  scans: ScanLogEntry[];
}

function isSuccessResult(result: string): boolean {
  return result.endsWith('_success');
}

export function RecentScansList({ scans }: RecentScansListProps) {
  const theme = useTheme();

  if (scans.length === 0) {
    return <EmptyState title="Belum ada scan" message="Aktivitas scan terbaru akan muncul di sini." />;
  }

  return (
    <View style={styles.list}>
      {scans.map((scan) => (
        <View key={scan.id} style={[styles.item, CardShadow, { backgroundColor: theme.surface }]}>
          <View style={styles.itemHeader}>
            <Text style={[styles.barcode, { color: theme.textPrimary }]}>{scan.barcode_masked}</Text>
            <StatusBadge
              label={scan.result_label}
              tone={isSuccessResult(scan.result) ? 'success' : 'danger'}
            />
          </View>
          <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
            {scan.message}
          </Text>
          <View style={styles.itemFooter}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {scan.scanner ? `Oleh ${scan.scanner}` : 'Petugas tidak diketahui'}
            </Text>
            {scan.scanned_at ? (
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                {formatRelativeTime(scan.scanned_at)}
              </Text>
            ) : null}
          </View>
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
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barcode: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  message: {
    fontSize: 13,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
  },
});
