import { Stack } from 'expo-router';

export default function AdminStudentsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Siswa' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Siswa' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail Siswa' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Siswa' }} />
    </Stack>
  );
}
