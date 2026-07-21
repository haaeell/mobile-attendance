import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, GraduationCap, LogIn, LogOut, Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { AttendanceStatBreakdown } from '@/components/dashboard/AttendanceStatBreakdown';
import { BestClassroomsList } from '@/components/dashboard/BestClassroomsList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardScanCta } from '@/components/dashboard/DashboardScanCta';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { RecentScansList } from '@/components/dashboard/RecentScansList';
import { SevenDayTrend } from '@/components/dashboard/SevenDayTrend';
import { ErrorState } from '@/components/ErrorState';
import { StatusBadge } from '@/components/StatusBadge';
import { SummaryCard } from '@/components/SummaryCard';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useDashboard } from '@/hooks/useDashboard';
import { formatTime } from '@/utils/formatters';
import { isAdminDashboard } from '@/types/dashboard';

/**
 * Glow dekoratif kuning lembut di belakang header + CTA scan — dibuat
 * sebagai overlay semi-transparan (bukan warna solid) supaya terlihat
 * seperti wash/opacity tipis yang memudar total ke transparan, bukan blok
 * warna kuning yang mencolok.
 */
const GLOW_COLORS = {
  light: [
    'rgba(250,204,21,0.16)',
    'rgba(250,204,21,0.09)',
    'rgba(250,204,21,0.03)',
    'rgba(250,204,21,0)',
  ] as const,
  dark: [
    'rgba(250,204,21,0.12)',
    'rgba(250,204,21,0.06)',
    'rgba(250,204,21,0.02)',
    'rgba(250,204,21,0)',
  ] as const,
};

export default function DashboardScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch, isRefetching } = useDashboard();
  const isAdmin = user?.role === 'admin';

  const handleQuickScan = () => router.push('/(app)/scan');

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
      }>
      <LinearGradient
        colors={scheme === 'dark' ? GLOW_COLORS.dark : GLOW_COLORS.light}
        locations={[0, 0.45, 0.75, 1]}
        style={styles.glow}>
        <DashboardHeader
          userName={user?.name ?? ''}
          subtitle={
            isAdmin
              ? 'Kelola absensi dengan mudah dan akurat.'
              : 'Pantau kehadiran dengan mudah dan akurat.'
          }
        />

        {isAdmin ? (
          <View style={styles.scanCtaWrapper}>
            <DashboardScanCta onPress={handleQuickScan} />
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        {isPending ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat dashboard"
            message={error?.message ?? 'Silakan coba lagi.'}
            onRetry={refetch}
          />
        ) : data && isAdminDashboard(data) ? (
          <View style={styles.sections}>
            <View style={styles.cardRow}>
              <SummaryCard label="Siswa" value={data.totals.students} tone="primary" icon={Users} />
              <SummaryCard label="Guru" value={data.totals.teachers} tone="success" icon={GraduationCap} />
              <SummaryCard label="Kelas" value={data.totals.classrooms} tone="warning" icon={Building2} />
            </View>

            <Section title="Kehadiran Hari Ini">
              <View style={styles.stack}>
                <AttendanceStatBreakdown title="Siswa" stats={data.today.student} />
                <AttendanceStatBreakdown title="Guru" stats={data.today.teacher} />
              </View>
            </Section>

            <Section title="Statistik 7 Hari Terakhir">
              <SevenDayTrend data={data.seven_day_statistics} />
            </Section>

            <Section title="Kelas Terbaik">
              <BestClassroomsList classrooms={data.best_classrooms} />
            </Section>

            <Section title="Scan Terbaru">
              <RecentScansList scans={data.latest_scans.slice(0, 5)} />
            </Section>
          </View>
        ) : data ? (
          <View style={styles.sections}>
            <Section title="Kehadiran Saya Hari Ini">
              {data.own_attendance ? (
                <View
                  style={[
                    styles.ownAttendance,
                    CardShadow,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}>
                  <StatusBadge
                    label={data.own_attendance.final_status_label}
                    tone={data.own_attendance.final_status === 'present' ? 'success' : 'warning'}
                  />
                  <View style={styles.ownAttendanceGrid}>
                    <View style={styles.ownAttendanceCell}>
                      <View style={[styles.ownAttendanceIconBadge, { backgroundColor: `${theme.success}1A` }]}>
                        <LogIn color={theme.success} size={18} />
                      </View>
                      <View>
                        <Text style={[styles.ownAttendanceLabel, { color: theme.textSecondary }]}>Masuk</Text>
                        <Text style={[styles.ownAttendanceValue, { color: theme.textPrimary }]}>
                          {data.own_attendance.check_in_at
                            ? formatTime(data.own_attendance.check_in_at)
                            : '-'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ownAttendanceCell}>
                      <View style={[styles.ownAttendanceIconBadge, { backgroundColor: `${theme.primary}1A` }]}>
                        <LogOut color={theme.primary} size={18} />
                      </View>
                      <View>
                        <Text style={[styles.ownAttendanceLabel, { color: theme.textSecondary }]}>Pulang</Text>
                        <Text style={[styles.ownAttendanceValue, { color: theme.textPrimary }]}>
                          {data.own_attendance.check_out_at
                            ? formatTime(data.own_attendance.check_out_at)
                            : '-'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.ownAttendance,
                    CardShadow,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}>
                  <StatusBadge label="Belum Tercatat" tone="neutral" />
                </View>
              )}
            </Section>

            {data.homeroom_summary ? (
              <Section title={`Ringkasan Kelas ${data.homeroom_summary.classroom.name}`}>
                <AttendanceStatBreakdown
                  title={data.homeroom_summary.classroom.name}
                  stats={{
                    ...data.homeroom_summary.summary,
                    total: Object.values(data.homeroom_summary.summary).reduce((a, b) => a + b, 0),
                  }}
                />
              </Section>
            ) : null}

            <Section title="Scan Terbaru">
              <RecentScansList scans={data.latest_scans.slice(0, 5)} />
            </Section>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: theme.primary }]} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.xl,
  },
  glow: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl * 1.5,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  scanCtaWrapper: {
    paddingHorizontal: Spacing.lg,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  sections: {
    gap: Spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stack: {
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    borderRadius: Radius.full,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ownAttendance: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  ownAttendanceGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  ownAttendanceCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ownAttendanceIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownAttendanceLabel: {
    fontSize: 12,
  },
  ownAttendanceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
