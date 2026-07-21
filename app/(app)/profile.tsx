import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect ke login ditangani otomatis oleh guard di
      // app/(app)/_layout.tsx begitu isAuthenticated menjadi false.
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>

        <View style={styles.badgeRow}>
          <StatusBadge label={user.role_label} tone="info" />
          <StatusBadge
            label={user.is_active ? 'Aktif' : 'Tidak Aktif'}
            tone={user.is_active ? 'success' : 'danger'}
          />
          {user.is_homeroom_teacher ? <StatusBadge label="Wali Kelas" tone="warning" /> : null}
        </View>

        {user.homeroom_classroom ? (
          <Text style={[styles.classroom, { color: theme.textSecondary }]}>
            Wali kelas {user.homeroom_classroom.name}
          </Text>
        ) : null}
      </View>

      <AppButton title="Keluar" variant="danger" onPress={handleLogout} loading={isLoggingOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  classroom: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});
