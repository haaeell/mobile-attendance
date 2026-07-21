import { Stack } from 'expo-router';

export default function AdminAcademicYearsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Tahun Ajaran' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Tahun Ajaran' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Tahun Ajaran' }} />
    </Stack>
  );
}
