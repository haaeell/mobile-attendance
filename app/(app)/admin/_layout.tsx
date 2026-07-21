import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

/**
 * Stack internal untuk tab Data Master, supaya navigasi antar modul (mis.
 * siswa, guru) bisa push seperti biasa (header ditangani di sini, bukan
 * lagi oleh Tabs).
 */
export default function AdminStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Data Master' }} />
      <Stack.Screen name="students" options={{ headerShown: false }} />
      <Stack.Screen name="teachers" options={{ headerShown: false }} />
      <Stack.Screen name="classrooms" options={{ headerShown: false }} />
      <Stack.Screen name="academic-years" options={{ headerShown: false }} />
      <Stack.Screen name="attendance-settings" options={{ headerShown: false }} />
      <Stack.Screen name="holidays" options={{ headerShown: false }} />
      <Stack.Screen name="barcodes" options={{ headerShown: false }} />
    </Stack>
  );
}
