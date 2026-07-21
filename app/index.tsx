import { Redirect } from 'expo-router';

/**
 * Entry point router. Pengecekan sesi/auth sungguhan (redirect ke dashboard
 * bila sudah login) akan dikerjakan pada tahap berikutnya bersamaan dengan
 * fitur login. Untuk saat ini selalu arahkan ke layar login.
 */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
