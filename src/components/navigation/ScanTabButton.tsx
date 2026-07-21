import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

/**
 * Tombol tab "Scan" dibuat menonjol (mengambang di atas tab bar, gradient
 * hijau seperti splash screen) supaya jadi aksi utama yang paling mudah
 * dijangkau, alih-alih tab biasa berukuran sama dengan yang lain.
 */
export function ScanTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  const isSelected = accessibilityState?.selected;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Scan"
      accessibilityState={accessibilityState}
      style={styles.wrapper}>
      <LinearGradient
        colors={isSelected ? ['#15B36B', '#02783F'] : ['#0FA85C', '#02783F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <ScanLine color="#FFFFFF" size={28} strokeWidth={2.25} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#02783F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
