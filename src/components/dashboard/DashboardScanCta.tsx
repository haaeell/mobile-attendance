import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ScanLine } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';

export interface DashboardScanCtaProps {
  onPress: () => void;
}

/**
 * CTA utama dashboard — dibuat menonjol (gradient hijau, sama seperti tombol
 * tab Scan) supaya aksi paling sering dipakai (scan barcode) langsung
 * terlihat begitu buka aplikasi.
 */
export function DashboardScanCta({ onPress }: DashboardScanCtaProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Scan Sekarang">
      {({ pressed }) => (
        <LinearGradient
          colors={['#0FA85C', '#02783F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { opacity: pressed ? 0.9 : 1 }]}>
          <View style={styles.iconBadge}>
            <ScanLine color="#FFFFFF" size={26} strokeWidth={2.25} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Scan Sekarang</Text>
            <Text style={styles.subtitle}>Pindai barcode untuk absensi masuk/pulang</Text>
          </View>
          <ChevronRight color="#FFFFFF" size={20} />
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    shadowColor: '#02783F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
});
