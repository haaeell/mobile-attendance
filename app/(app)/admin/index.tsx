import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MENU_ITEMS: { title: string; subtitle: string; href: Href }[] = [
  { title: 'Siswa', subtitle: 'Kelola data siswa, kelas, dan barcode', href: '/(app)/admin/students' },
  { title: 'Guru', subtitle: 'Kelola akun guru, status, dan barcode', href: '/(app)/admin/teachers' },
  {
    title: 'Kelas',
    subtitle: 'Kelola data kelas dan penentuan wali kelas',
    href: '/(app)/admin/classrooms',
  },
  {
    title: 'Tahun Ajaran',
    subtitle: 'Kelola tahun ajaran dan aktivasi',
    href: '/(app)/admin/academic-years',
  },
  {
    title: 'Pengaturan Jadwal Absensi',
    subtitle: 'Atur jadwal absensi siswa dan guru',
    href: '/(app)/admin/attendance-settings',
  },
  { title: 'Hari Libur', subtitle: 'Kelola hari libur sekolah', href: '/(app)/admin/holidays' },
  {
    title: 'Barcode',
    subtitle: 'Lihat, unduh, cetak massal, dan terbitkan ulang barcode',
    href: '/(app)/admin/barcodes',
  },
];

export default function AdminIndexScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => router.push(item.href)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
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
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs / 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
  },
});
