import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function AdminBarcodesStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'QR Code' }} />
      <Stack.Screen name="students/index" options={{ title: 'QR Code Siswa' }} />
      <Stack.Screen name="students/[id]" options={{ title: 'QR Code Siswa' }} />
      <Stack.Screen name="teachers/index" options={{ title: 'QR Code Guru' }} />
      <Stack.Screen name="teachers/[id]" options={{ title: 'QR Code Guru' }} />
    </Stack>
  );
}
