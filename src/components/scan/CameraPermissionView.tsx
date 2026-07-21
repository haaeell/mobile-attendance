import { Camera, Settings } from 'lucide-react-native';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CameraPermissionViewProps {
  canAskAgain: boolean;
  onRequestPermission: () => void;
}

/**
 * Ditampilkan bila izin kamera ditolak. Tidak pernah membuat aplikasi
 * crash — hanya penjelasan dan jalan keluar (minta lagi / buka pengaturan).
 */
export function CameraPermissionView({ canAskAgain, onRequestPermission }: CameraPermissionViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Izin Kamera Diperlukan</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        Aplikasi memerlukan akses kamera untuk memindai QR code absensi. Tanpa izin ini, fitur scan
        tidak dapat digunakan.
      </Text>

      {canAskAgain ? (
        <AppButton title="Izinkan Kamera" icon={Camera} onPress={onRequestPermission} />
      ) : (
        <AppButton title="Buka Pengaturan" icon={Settings} onPress={() => Linking.openSettings()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});
