import { useRouter, type Href } from 'expo-router';
import { ChevronRight, Database, GraduationCap, UserCircle, type LucideIcon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isHomeroomTeacher = !isAdmin && user?.is_homeroom_teacher === true;

  const menuItems: { title: string; subtitle: string; icon: LucideIcon; href: Href }[] = [
    { title: 'Profil', subtitle: 'Data akun dan keluar', icon: UserCircle, href: '/(app)/more/profile' },
    ...(isAdmin
      ? [
          {
            title: 'Data Master',
            subtitle: 'Siswa, guru, kelas, tahun ajaran, dan lainnya',
            icon: Database,
            href: '/(app)/admin' as Href,
          },
        ]
      : []),
    ...(isHomeroomTeacher
      ? [
          {
            title: 'Wali Kelas',
            subtitle: 'Kelola kelas yang Anda ampu',
            icon: GraduationCap,
            href: '/(app)/homeroom' as Href,
          },
        ]
      : []),
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      {menuItems.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => router.push(item.href)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
            <item.icon color={theme.primary} size={22} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
          </View>
          <ChevronRight color={theme.textSecondary} size={20} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
  },
});
