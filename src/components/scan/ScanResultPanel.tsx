import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ScanSuccessData } from '@/types/scan';

/**
 * `data.time` dari backend sudah berupa jam lokal Asia/Jakarta ("HH:mm:ss"),
 * bukan timestamp lengkap — cukup diformat ulang tanpa parsing ulang lewat
 * `Date`, supaya tidak ada risiko pergeseran zona waktu.
 */
function formatWallClockTime(time: string): string {
  return `${time.slice(0, 5)} WIB`;
}

export type ScanResultState =
  | { kind: 'idle' }
  | { kind: 'processing' }
  | { kind: 'success'; data: ScanSuccessData }
  | { kind: 'error'; message: string; errorCode: string | null };

export interface ScanResultPanelProps {
  result: ScanResultState;
  onScanNext: () => void;
  autoResumeSeconds: number | null;
}

function statusTone(status: ScanSuccessData['status']): 'success' | 'warning' | 'info' | 'danger' {
  switch (status) {
    case 'present':
      return 'success';
    case 'late':
      return 'warning';
    case 'permission':
    case 'sick':
    case 'dispensation':
      return 'info';
    case 'alpha':
      return 'danger';
    default:
      return 'info';
  }
}

export function ScanResultPanel({ result, onScanNext, autoResumeSeconds }: ScanResultPanelProps) {
  const theme = useTheme();

  if (result.kind === 'idle') {
    return null;
  }

  if (result.kind === 'processing') {
    return (
      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.processingText, { color: theme.textSecondary }]}>
          Memproses scan, mohon tunggu...
        </Text>
      </View>
    );
  }

  if (result.kind === 'error') {
    return (
      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.danger }]}>
        <StatusBadge label="Gagal" tone="danger" />
        <Text style={[styles.errorMessage, { color: theme.textPrimary }]}>{result.message}</Text>
        <ScanNextButton onScanNext={onScanNext} autoResumeSeconds={autoResumeSeconds} />
      </View>
    );
  }

  const { data } = result;
  const scanTypeLabel = data.scan_type === 'check_in' ? 'Scan Masuk' : 'Scan Pulang';
  const subjectLabel = data.subject_type === 'student' ? 'Siswa' : 'Guru';
  const identifierLabel = data.subject_type === 'student' ? 'NIS' : 'NIP';

  return (
    <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.success }]}>
      <View style={styles.headerRow}>
        <StatusBadge label={scanTypeLabel} tone="success" />
        <StatusBadge label={data.status_label} tone={statusTone(data.status)} />
      </View>

      <Text style={[styles.name, { color: theme.textPrimary }]}>{data.name}</Text>
      <Text style={[styles.subLine, { color: theme.textSecondary }]}>
        {subjectLabel} • {identifierLabel} {data.identifier}
        {data.classroom ? ` • ${data.classroom.name}` : ''}
      </Text>

      <View style={styles.detailGrid}>
        <DetailItem label="Jam" value={data.time ? formatWallClockTime(data.time) : '-'} />
        <DetailItem label="Menit Terlambat" value={String(data.late_minutes)} />
      </View>

      <ScanNextButton onScanNext={onScanNext} autoResumeSeconds={autoResumeSeconds} />
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function ScanNextButton({
  onScanNext,
  autoResumeSeconds,
}: {
  onScanNext: () => void;
  autoResumeSeconds: number | null;
}) {
  const title =
    autoResumeSeconds !== null ? `Scan Berikutnya (${autoResumeSeconds}s)` : 'Scan Berikutnya';

  return <AppButton title={title} onPress={onScanNext} />;
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  processingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  detailItem: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
