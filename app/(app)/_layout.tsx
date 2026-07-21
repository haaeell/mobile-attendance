import { Redirect, Tabs } from 'expo-router';
import { BarChart3, ClipboardList, House, MoreHorizontal, ScanLine } from 'lucide-react-native';

import { LoadingView } from '@/components/LoadingView';
import { ScanTabButton } from '@/components/navigation/ScanTabButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

/**
 * Layout area setelah login, sekaligus guard rute terproteksi: bila belum
 * login, redirect ke layar login.
 *
 * Bottom tab bar sengaja dibatasi 5 menu: Home, Absensi, Scan (menonjol),
 * Laporan, Lainnya. Data Master, Wali Kelas, dan Profil tetap route yang
 * valid (jadi bisa di-push dari menu Lainnya) tapi disembunyikan dari tab
 * bar (`href: null`) supaya tidak melebihi 5 tombol.
 */
export default function AppLayout() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const theme = useTheme();

  if (isInitializing) {
    return <LoadingView message="Memuat sesi..." />;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.textPrimary,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Absensi',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
          tabBarButton: ScanTabButton,
        }}
      />
      <Tabs.Screen
        name="reports/index"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Lainnya',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
      />

      {/* Route valid, tapi disembunyikan dari tab bar — diakses lewat menu Lainnya. */}
      <Tabs.Screen name="admin" options={{ headerShown: false, href: null }} />
      <Tabs.Screen name="homeroom" options={{ headerShown: false, href: null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', href: null }} />
    </Tabs>
  );
}
