import { Stack } from 'expo-router';

export default function AdminHolidaysStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Hari Libur' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Hari Libur' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Hari Libur' }} />
    </Stack>
  );
}
