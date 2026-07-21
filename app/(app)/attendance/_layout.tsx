import { Stack } from 'expo-router';

/**
 * Stack internal untuk tab Absensi, supaya navigasi daftar -> detail bisa
 * push seperti biasa (header sudah ditangani di sini, bukan lagi oleh Tabs).
 */
export default function AttendanceStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Absensi' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Absensi' }} />
    </Stack>
  );
}
