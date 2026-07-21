import { CameraView, useCameraPermissions, type BarcodeScanningResult, type CameraType } from 'expo-camera';
import { Redirect } from 'expo-router';
import { Flashlight, FlashlightOff, SwitchCamera, Wifi, WifiOff } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraPermissionView } from '@/components/scan/CameraPermissionView';
import { ScanFrameOverlay } from '@/components/scan/ScanFrameOverlay';
import { ScanResultPanel, type ScanResultState } from '@/components/scan/ScanResultPanel';
import { ScanSessionSummary } from '@/components/scan/ScanSessionSummary';
import { LoadingView } from '@/components/LoadingView';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useScanMutation } from '@/hooks/useScanMutation';
import { useScanSession } from '@/hooks/useScanSession';
import { useTheme } from '@/hooks/use-theme';
import { mapScanErrorMessage } from '@/constants/scanErrorMessages';
import { getDeviceName } from '@/utils/device';

const AUTO_RESUME_SECONDS = 5;
const BARCODE_TYPES = ['qr'] as const;

export default function ScanScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const { isConnected } = useNetworkStatus();
  const { successCount, history, recordSuccess, recordError } = useScanSession();
  const scanMutation = useScanMutation();

  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
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

  // Fitur scan khusus admin — guru tidak melihat tab-nya, tapi tetap dijaga
  // di sini seandainya route ini dibuka lewat navigasi langsung.
  if (user && user.role !== 'admin') {
    return <Redirect href="/(app)/dashboard" />;
  }

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
          facing={facing}
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={isLocked ? undefined : handleBarcodeScanned}
        />
        <ScanFrameOverlay active={!isLocked} />

        <View style={styles.topBar}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: isConnected ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.9)' },
            ]}>
            {isConnected ? <Wifi color="#FFFFFF" size={16} /> : <WifiOff color="#FFFFFF" size={16} />}
            <Text style={styles.iconBadgeText}>{isConnected ? 'Online' : 'Offline'}</Text>
          </View>

          <View style={styles.topBarActions}>
            <Pressable
              onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
              style={styles.roundButton}
              accessibilityRole="button"
              accessibilityLabel="Ganti kamera depan/belakang">
              <SwitchCamera color="#FFFFFF" size={20} />
            </Pressable>

            <Pressable
              onPress={() => setTorchOn((value) => !value)}
              style={[styles.roundButton, torchOn ? { backgroundColor: theme.primary } : null]}
              accessibilityRole="button"
              accessibilityLabel={torchOn ? 'Matikan flash' : 'Nyalakan flash'}>
              {torchOn ? (
                <Flashlight color="#FFFFFF" size={20} />
              ) : (
                <FlashlightOff color="#FFFFFF" size={20} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={[styles.bottomSheet, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bottomSheetContent}>
        {result.kind !== 'idle' ? (
          <ScanResultPanel result={result} onScanNext={resumeScanning} autoResumeSeconds={autoResumeSeconds} />
        ) : (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Arahkan kamera ke QR code pada kartu.
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
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2 + 2,
    borderRadius: Radius.full,
  },
  iconBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roundButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
