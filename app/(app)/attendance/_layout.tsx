import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

/**
 * Stack internal untuk tab Absensi, supaya navigasi daftar -> detail bisa
 * push seperti biasa (header sudah ditangani di sini, bukan lagi oleh Tabs).
 */
export default function AttendanceStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Absensi' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Absensi' }} />
    </Stack>
  );
}
