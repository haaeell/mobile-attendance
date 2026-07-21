import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useRegenerateStudentBarcode } from '@/hooks/useRegenerateStudentBarcode';
import { useStudent } from '@/hooks/useStudent';
import { useStudentBarcodeImage } from '@/hooks/useStudentBarcodeImage';
import { useTheme } from '@/hooks/use-theme';
import { saveArrayBufferToCacheFile, shareFile } from '@/utils/fileDownload';

export default function AdminStudentBarcodeDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const studentId = Number(id);

  const { data: student } = useStudent(studentId);
  const {
    data: imageBuffer,
    isPending,
    isError,
    error,
    refetch,
  } = useStudentBarcodeImage(studentId);
  const regenerateMutation = useRegenerateStudentBarcode(studentId);

  const [isSharing, setIsSharing] = useState(false);

  const imageFile = useMemo(
    () => (imageBuffer ? saveArrayBufferToCacheFile(imageBuffer, `barcode-siswa-${studentId}.png`) : null),
    [imageBuffer, studentId],
  );

  const handleShare = async () => {
    if (!imageFile) return;

    setIsSharing(true);
    try {
      await shareFile(imageFile, { mimeType: 'image/png', dialogTitle: 'Barcode Siswa' });
    } catch (shareError) {
      Alert.alert('Gagal', (shareError as Error).message ?? 'Gagal membagikan barcode.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Terbitkan Ulang Barcode',
      'Barcode lama akan langsung tidak berlaku dan digantikan dengan barcode baru. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terbitkan',
          onPress: () => {
            regenerateMutation.mutate(undefined, {
              onSuccess: () => refetch(),
              onError: (apiError) => Alert.alert('Gagal', apiError.message || 'Gagal menerbitkan ulang barcode.'),
            });
          },
        },
      ],
    );
  };

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={220} />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat barcode"
        message={error?.message ?? 'Silakan coba lagi.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      {student ? (
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{student.name}</Text>
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>
            NIS {student.nis} • {student.barcode_status_label}
          </Text>
        </View>
      ) : null}

      <View style={[styles.imageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {imageFile ? (
          <Image source={{ uri: imageFile.uri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Skeleton height={120} />
        )}
      </View>

      <View style={styles.actions}>
        <AppButton title="Unduh & Bagikan" onPress={handleShare} loading={isSharing} disabled={!imageFile} />
        <AppButton
          title="Terbitkan Ulang Barcode"
          variant="secondary"
          onPress={handleRegenerate}
          loading={regenerateMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs / 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  imageCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 140,
  },
  actions: {
    gap: Spacing.sm,
  },
});
