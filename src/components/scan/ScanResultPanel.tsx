import { CircleCheck, CircleX, ScanLine } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { StatusBadge } from '@/components/StatusBadge';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
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

/**
 * Kartu "alert" custom pengganti Alert.alert bawaan — muncul dengan animasi
 * fade + scale setiap kali status scan berubah, supaya terasa seperti
 * notifikasi modern alih-alih teks statis.
 */
export function ScanResultPanel({ result, onScanNext, autoResumeSeconds }: ScanResultPanelProps) {
  const theme = useTheme();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [result.kind, anim]);

  if (result.kind === 'idle') {
    return null;
  }

  const animatedStyle = {
    opacity: anim,
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
    ],
  };

  if (result.kind === 'processing') {
    return (
      <Animated.View style={[styles.panel, CardShadow, { backgroundColor: theme.surface }, animatedStyle]}>
        <View style={[styles.iconBadge, { backgroundColor: `${theme.primary}1A` }]}>
          <ActivityIndicator color={theme.primary} />
        </View>
        <Text style={[styles.processingText, { color: theme.textSecondary }]}>
          Memproses scan, mohon tunggu...
        </Text>
      </Animated.View>
    );
  }

  if (result.kind === 'error') {
    return (
      <Animated.View style={[styles.panel, CardShadow, { backgroundColor: theme.surface }, animatedStyle]}>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${theme.danger}1A` }]}>
            <CircleX color={theme.danger} size={26} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.danger }]}>Scan Gagal</Text>
            <Text style={[styles.errorMessage, { color: theme.textPrimary }]}>{result.message}</Text>
          </View>
        </View>
        <ScanNextButton onScanNext={onScanNext} autoResumeSeconds={autoResumeSeconds} />
      </Animated.View>
    );
  }

  const { data } = result;
  const scanTypeLabel = data.scan_type === 'check_in' ? 'Scan Masuk' : 'Scan Pulang';
  const subjectLabel = data.subject_type === 'student' ? 'Siswa' : 'Guru';
  const identifierLabel = data.subject_type === 'student' ? 'NIS' : 'NIP';

  return (
    <Animated.View style={[styles.panel, CardShadow, { backgroundColor: theme.surface }, animatedStyle]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: `${theme.success}1A` }]}>
          <CircleCheck color={theme.success} size={26} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.success }]}>Scan Berhasil</Text>
          <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
            {data.name}
          </Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge label={scanTypeLabel} tone="success" />
        <StatusBadge label={data.status_label} tone={statusTone(data.status)} />
      </View>

      <Text style={[styles.subLine, { color: theme.textSecondary }]}>
        {subjectLabel} • {identifierLabel} {data.identifier}
        {data.classroom ? ` • ${data.classroom.name}` : ''}
      </Text>

      <View style={styles.detailGrid}>
        <DetailItem label="Jam" value={data.time ? formatWallClockTime(data.time) : '-'} />
        <DetailItem label="Menit Terlambat" value={String(data.late_minutes)} />
      </View>

      <ScanNextButton onScanNext={onScanNext} autoResumeSeconds={autoResumeSeconds} />
    </Animated.View>
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

  return <AppButton title={title} icon={ScanLine} onPress={onScanNext} />;
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 15,
    fontWeight: '600',
  },
  badgeRow: {
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
