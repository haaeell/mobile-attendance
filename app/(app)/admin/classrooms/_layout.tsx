import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function AdminClassroomsStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Kelas' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Kelas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Kelas' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Kelas' }} />
    </Stack>
  );
}
