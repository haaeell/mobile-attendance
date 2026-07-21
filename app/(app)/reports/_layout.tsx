import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

export default function ReportsStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Laporan' }} />
    </Stack>
  );
}
