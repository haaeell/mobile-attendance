import { Stack } from 'expo-router';

import { AppHeader } from '@/components/navigation/AppHeader';

/**
 * Stack internal untuk tab Lainnya, supaya Profil (dan menu lain di masa
 * depan) bisa di-push dengan header + tombol kembali standar.
 */
export default function MoreStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Lainnya' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil' }} />
    </Stack>
  );
}
