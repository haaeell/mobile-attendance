import { Stack } from 'expo-router';

export default function AdminAttendanceSettingsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Pengaturan Jadwal Absensi' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Jadwal' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Jadwal' }} />
    </Stack>
  );
}
