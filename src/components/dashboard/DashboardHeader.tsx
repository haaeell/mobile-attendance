import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getTimeBasedGreeting } from '@/utils/formatters';

export interface DashboardHeaderProps {
  userName: string;
  subtitle: string;
  /** Sementara dekoratif — belum ada endpoint notifikasi di backend. */
  hasUnreadNotification?: boolean;
  onNotificationPress?: () => void;
}

/**
 * Konten header (logo, sapaan) saja — tanpa background sendiri, supaya
 * glow gradient kuning dikelola oleh layar pemanggil (lihat dashboard.tsx)
 * dan bisa melebar sampai menutupi kartu di bawah header ini juga.
 */
export function DashboardHeader({
  userName,
  subtitle,
  hasUnreadNotification = false,
  onNotificationPress,
}: DashboardHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.brandRow}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        <View style={styles.brandText}>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>SMA Islam Andalusia</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>Sistem Absensi Sekolah</Text>
        </View>

        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifikasi"
          style={[styles.notificationButton, { backgroundColor: theme.background }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.primary} />
          {hasUnreadNotification ? (
            <View
              style={[styles.notificationDot, { backgroundColor: theme.danger, borderColor: theme.background }]}
            />
          ) : null}
        </Pressable>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={[styles.greeting, { color: theme.textPrimary }]}>
          {getTimeBasedGreeting()}, <Text style={{ color: theme.primary }}>{userName}</Text>
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
  },
  brandText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
  },
  appTagline: {
    fontSize: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  greetingBlock: {
    gap: Spacing.xs / 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
});
