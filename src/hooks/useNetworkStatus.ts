import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Status koneksi jaringan saat ini. Berguna untuk menampilkan indikator
 * offline sebelum request ke API dilakukan.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
  }, []);

  return { isConnected };
}
