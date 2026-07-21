import { useRouter } from 'expo-router';
import { CalendarClock, ClipboardEdit, Users } from 'lucide-react-native';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useHomeroomClassroom } from '@/hooks/useHomeroomClassroom';
import { useTheme } from '@/hooks/use-theme';
import type { ClassroomStatusSummary } from '@/types/dashboard';

const SUMMARY_ITEMS: { key: keyof ClassroomStatusSummary; label: string }[] = [
  { key: 'present', label: 'Hadir' },
  { key: 'late', label: 'Terlambat' },
  { key: 'permission', label: 'Izin' },
  { key: 'sick', label: 'Sakit' },
  { key: 'dispensation', label: 'Dispensasi' },
  { key: 'alpha', label: 'Alpha' },
  { key: 'not_recorded', label: 'Belum Tercatat' },
];

export default function HomeroomIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isPending, isError, error, refetch, isRefetching } = useHomeroomClassroom();

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={100} />
        <View style={{ height: Spacing.md }} />
        <Skeleton height={160} />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat data kelas"
        message={error?.message ?? 'Silakan coba lagi.'}
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Bukan Wali Kelas"
        message="Anda bukan wali kelas aktif pada kelas mana pun."
      />
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.classroomName, { color: theme.textPrimary }]}>{data.name}</Text>
        <Text style={[styles.subLine, { color: theme.textSecondary }]}>
          {data.grade_level}
          {data.major ? ` • ${data.major}` : ''}
        </Text>
        {data.academic_year ? (
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>
            Tahun Ajaran {data.academic_year.name}
          </Text>
        ) : null}
        {data.homeroom_teacher ? (
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>
            Wali Kelas: {data.homeroom_teacher.name}
          </Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ringkasan Hari Ini</Text>
        <View style={styles.summaryGrid}>
          {SUMMARY_ITEMS.map((item) => (
            <View key={item.key} style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                {data.today_summary[item.key]}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton title="Siswa Kelas" icon={Users} onPress={() => router.push('/(app)/homeroom/students')} />
        <AppButton
          title="Kehadiran & Riwayat"
          icon={CalendarClock}
          variant="secondary"
          onPress={() => router.push('/(app)/homeroom/attendances')}
        />
        <AppButton
          title="Update Status Siswa"
          icon={ClipboardEdit}
          variant="secondary"
          onPress={() => router.push('/(app)/homeroom/update-status')}
        />
      </View>
    </ScrollView>
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
  classroomName: {
    fontSize: 20,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryItem: {
    minWidth: 80,
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
});
