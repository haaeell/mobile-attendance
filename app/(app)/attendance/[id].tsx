import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge, type StatusBadgeTone } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useAttendanceDetail } from '@/hooks/useAttendanceDetail';
import { useTheme } from '@/hooks/use-theme';
import { formatDateLong, formatTime } from '@/utils/formatters';
import type { AttendanceFinalStatus } from '@/types/attendance';

const STATUS_TONE: Record<AttendanceFinalStatus, StatusBadgeTone> = {
  present: 'success',
  late: 'warning',
  permission: 'info',
  sick: 'info',
  dispensation: 'info',
  alpha: 'danger',
};

export default function AttendanceDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const attendanceId = Number(id);
  const { data, isPending, isError, error, refetch } = useAttendanceDetail(attendanceId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={140} />
        <View style={{ height: Spacing.md }} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Gagal memuat detail absensi"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  const isStudent = data.subject_type === 'student';

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>
            {data.subject?.name ?? 'Tidak diketahui'}
          </Text>
          <StatusBadge label={data.final_status_label} tone={STATUS_TONE[data.final_status]} />
        </View>
        <Text style={[styles.subLine, { color: theme.textSecondary }]}>
          {isStudent ? 'Siswa' : 'Guru'} • {isStudent ? 'NIS' : 'NIP'} {data.subject?.identifier ?? '-'}
        </Text>
        {data.subject?.classroom ? (
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>
            Kelas {data.subject.classroom.name}
          </Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <DetailRow label="Tanggal" value={formatDateLong(data.attendance_date)} />
        <DetailRow
          label="Jam Masuk"
          value={data.check_in_at ? formatTime(data.check_in_at) : 'Belum tercatat'}
        />
        <DetailRow
          label="Jam Pulang"
          value={data.check_out_at ? formatTime(data.check_out_at) : 'Belum tercatat'}
        />
        <DetailRow label="Keterlambatan" value={`${data.late_minutes} menit`} />
        <DetailRow label="Sumber" value={data.source_label} />
        {data.notes ? <DetailRow label="Keterangan" value={data.notes} /> : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Petugas Scan</Text>
        <DetailRow label="Scan Masuk" value={data.check_in_scanned_by ?? '-'} />
        <DetailRow label="Scan Pulang" value={data.check_out_scanned_by ?? '-'} />
        {data.manually_updated_by ? (
          <DetailRow label="Diubah Manual Oleh" value={data.manually_updated_by} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
