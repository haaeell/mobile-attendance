import { Stack } from 'expo-router';

export default function AdminClassroomsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Kelas' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Kelas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Kelas' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Kelas' }} />
    </Stack>
  );
}
