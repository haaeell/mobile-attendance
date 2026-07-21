import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraPermissionView } from '@/components/scan/CameraPermissionView';
import { ScanFrameOverlay } from '@/components/scan/ScanFrameOverlay';
import { ScanResultPanel, type ScanResultState } from '@/components/scan/ScanResultPanel';
import { ScanSessionSummary } from '@/components/scan/ScanSessionSummary';
import { LoadingView } from '@/components/LoadingView';
import { Radius, Spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useScanMutation } from '@/hooks/useScanMutation';
import { useScanSession } from '@/hooks/useScanSession';
import { useTheme } from '@/hooks/use-theme';
import { mapScanErrorMessage } from '@/constants/scanErrorMessages';
import { getDeviceName } from '@/utils/device';

const AUTO_RESUME_SECONDS = 5;
const BARCODE_TYPES = ['code128', 'qr'] as const;

export default function ScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { isConnected } = useNetworkStatus();
  const { successCount, history, recordSuccess, recordError } = useScanSession();
  const scanMutation = useScanMutation();

  const [torchOn, setTorchOn] = useState(false);
  const [result, setResult] = useState<ScanResultState>({ kind: 'idle' });
  const [autoResumeSeconds, setAutoResumeSeconds] = useState<number | null>(null);
  // Dipakai untuk render (dim frame, lepas handler kamera).
  const [isLocked, setIsLocked] = useState(false);

  // Ref sinkron untuk mencegah request ganda — dibaca di dalam event handler
  // saja (bukan saat render), karena state React bisa terlambat ter-update
  // untuk mengimbangi callback kamera yang terpicu sangat cepat/berturutan.
  const isLockedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startAutoResumeCountdown = useCallback(
    (onDone: () => void) => {
      clearCountdown();
      setAutoResumeSeconds(AUTO_RESUME_SECONDS);

      countdownRef.current = setInterval(() => {
        setAutoResumeSeconds((seconds) => {
          if (seconds === null || seconds <= 1) {
            clearCountdown();
            onDone();
            return null;
          }

          return seconds - 1;
        });
      }, 1000);
    },
    [clearCountdown],
  );

  useEffect(() => clearCountdown, [clearCountdown]);

  const resumeScanning = useCallback(() => {
    clearCountdown();
    isLockedRef.current = false;
    setIsLocked(false);
    setAutoResumeSeconds(null);
    setResult({ kind: 'idle' });
  }, [clearCountdown]);

  const handleBarcodeScanned = useCallback(
    (scanningResult: BarcodeScanningResult) => {
      if (isLockedRef.current) {
        return;
      }

      isLockedRef.current = true;
      setIsLocked(true);
      setResult({ kind: 'processing' });

      const barcode = scanningResult.data;
      const deviceIdentifier = getDeviceName();

      if (!isConnected) {
        const message = 'Tidak ada koneksi internet. Data belum tersimpan — coba lagi setelah online.';
        setResult({ kind: 'error', message, errorCode: null });
        recordError(message, null);
        startAutoResumeCountdown(resumeScanning);
        return;
      }

      scanMutation.mutate(
        { barcode, device_identifier: deviceIdentifier },
        {
          onSuccess: (data) => {
            setResult({ kind: 'success', data });
            recordSuccess(data);
            startAutoResumeCountdown(resumeScanning);
          },
          onError: (err) => {
            const message = err.isNetworkError
              ? `${err.message} Data belum tersimpan.`
              : mapScanErrorMessage(err.errorCode, err.message);

            setResult({ kind: 'error', message, errorCode: err.errorCode });
            recordError(message, err.errorCode);
            startAutoResumeCountdown(resumeScanning);
          },
        },
      );
    },
    [isConnected, recordError, recordSuccess, resumeScanning, scanMutation, startAutoResumeCountdown],
  );

  if (!permission) {
    return <LoadingView message="Menyiapkan kamera..." />;
  }

  if (!permission.granted) {
    return (
      <CameraPermissionView canAskAgain={permission.canAskAgain} onRequestPermission={requestPermission} />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={isLocked ? undefined : handleBarcodeScanned}
        />
        <ScanFrameOverlay active={!isLocked} />

        <View style={styles.topBar}>
          <View
            style={[
              styles.connectionBadge,
              { backgroundColor: isConnected ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.9)' },
            ]}>
            <Text style={styles.connectionText}>{isConnected ? 'Online' : 'Offline'}</Text>
          </View>

          <Pressable
            onPress={() => setTorchOn((value) => !value)}
            style={[styles.torchButton, { backgroundColor: torchOn ? theme.primary : 'rgba(0,0,0,0.5)' }]}
            accessibilityRole="button"
            accessibilityLabel={torchOn ? 'Matikan flash' : 'Nyalakan flash'}>
            <Text style={styles.torchText}>{torchOn ? 'Flash Aktif' : 'Flash'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={[styles.bottomSheet, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bottomSheetContent}>
        {result.kind !== 'idle' ? (
          <ScanResultPanel result={result} onScanNext={resumeScanning} autoResumeSeconds={autoResumeSeconds} />
        ) : (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Arahkan kamera ke barcode Code 128 atau QR pada kartu.
          </Text>
        )}

        <ScanSessionSummary successCount={successCount} history={history} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraWrapper: {
    height: '45%',
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  connectionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.full,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  torchButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.full,
  },
  torchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSheet: {
    flex: 1,
  },
  bottomSheetContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
});
