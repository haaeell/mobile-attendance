import { Stack } from 'expo-router';

/**
 * Layout untuk area setelah login. Navigasi tab/drawer yang sesungguhnya
 * akan ditentukan saat fitur-fitur di dalamnya mulai dikerjakan.
 */
export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil' }} />
      <Stack.Screen name="attendance/index" options={{ title: 'Absensi' }} />
      <Stack.Screen name="homeroom/index" options={{ title: 'Wali Kelas' }} />
      <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
    </Stack>
  );
}
