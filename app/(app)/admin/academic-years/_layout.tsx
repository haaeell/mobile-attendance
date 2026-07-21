import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function AdminAcademicYearsStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Tahun Ajaran' }} />
      <Stack.Screen name="create" options={{ title: 'Tambah Tahun Ajaran' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Tahun Ajaran' }} />
    </Stack>
  );
}
