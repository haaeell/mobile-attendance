import { Stack } from 'expo-router';

/**
 * Stack internal untuk tab Wali Kelas, supaya navigasi antar halaman (siswa,
 * kehadiran, update status) bisa push seperti biasa (header ditangani di
 * sini, bukan lagi oleh Tabs).
 */
export default function HomeroomStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Wali Kelas' }} />
      <Stack.Screen name="students" options={{ title: 'Siswa Kelas' }} />
      <Stack.Screen name="attendances" options={{ title: 'Kehadiran Kelas' }} />
      <Stack.Screen name="update-status" options={{ title: 'Update Status' }} />
    </Stack>
  );
}
