import { Stack } from 'expo-router';

export default function AdminTeachersStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Guru' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Guru' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Guru' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Guru' }} />
    </Stack>
  );
}
