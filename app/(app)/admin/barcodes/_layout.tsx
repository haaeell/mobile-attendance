import { Stack } from 'expo-router';

export default function AdminBarcodesStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Barcode' }} />
      <Stack.Screen name="students/index" options={{ title: 'Barcode Siswa' }} />
      <Stack.Screen name="students/[id]" options={{ title: 'Barcode Siswa' }} />
      <Stack.Screen name="teachers/index" options={{ title: 'Barcode Guru' }} />
      <Stack.Screen name="teachers/[id]" options={{ title: 'Barcode Guru' }} />
    </Stack>
  );
}
