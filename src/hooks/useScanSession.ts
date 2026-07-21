import { useCallback, useState } from 'react';

import type { ScanSessionEntry, ScanSuccessData } from '@/types/scan';

const MAX_HISTORY = 5;

/**
 * Statistik & riwayat sesi scan — murni state lokal di memori (bukan server
 * state, jadi tidak lewat TanStack Query, dan bukan sesi/identitas user jadi
 * tidak masuk AuthContext). Hilang begitu layar di-unmount/aplikasi ditutup.
 */
export function useScanSession() {
  const [successCount, setSuccessCount] = useState(0);
  const [history, setHistory] = useState<ScanSessionEntry[]>([]);

  const recordSuccess = useCallback((data: ScanSuccessData) => {
    setSuccessCount((count) => count + 1);
    setHistory((prev) => {
      const entry: ScanSessionEntry = {
        id: `${Date.now()}-${Math.random()}`,
        scannedAt: Date.now(),
        outcome: 'success',
        data,
      };

      return [entry, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  const recordError = useCallback((message: string, errorCode: string | null) => {
    setHistory((prev) => {
      const entry: ScanSessionEntry = {
        id: `${Date.now()}-${Math.random()}`,
        scannedAt: Date.now(),
        outcome: 'error',
        message,
        errorCode,
      };

      return [entry, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  return { successCount, history, recordSuccess, recordError };
}
