import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function AdminAttendanceSettingsStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Pengaturan Jadwal Absensi' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Jadwal' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Jadwal' }} />
    </Stack>
  );
}
