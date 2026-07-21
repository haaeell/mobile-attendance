import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AdminBarcodesIndexScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => router.push('/(app)/admin/barcodes/students')}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
        ]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>QR Code Siswa</Text>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
          Lihat, unduh, cetak massal, dan terbitkan ulang QR code siswa
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(app)/admin/barcodes/teachers')}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
        ]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>QR Code Guru</Text>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
          Lihat, unduh, cetak massal, dan terbitkan ulang QR code guru
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
