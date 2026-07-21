import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function AdminHolidaysStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Hari Libur' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Hari Libur' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Hari Libur' }} />
    </Stack>
  );
}
