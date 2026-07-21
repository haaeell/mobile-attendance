import type { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack/types';
import { ChevronLeft } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIDE_WIDTH = 40;

/**
 * Header custom untuk semua layar non-akar tab: kiri tombol kembali (ikon
 * saja, hanya muncul bila ada layar sebelumnya), tengah nama menu, kanan
 * logo sekolah. Dipasang lewat `screenOptions={{ header: AppHeader }}` di
 * setiap Stack bersarang supaya konsisten tanpa perlu diulang per layar.
 */
export function AppHeader({ back, options, navigation }: NativeStackHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderBottomColor: theme.border, paddingTop: insets.top },
      ]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {back ? (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={10}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Kembali">
              <ChevronLeft color={theme.textPrimary} size={24} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {options.title ?? ''}
        </Text>

        <View style={[styles.side, styles.sideRight]}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: Spacing.sm,
  },
  side: {
    width: SIDE_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: SIDE_WIDTH,
    height: SIDE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
  },
});
