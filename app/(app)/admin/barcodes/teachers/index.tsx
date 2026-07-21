import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useBulkGenerateTeacherBarcodes } from '@/hooks/useBulkGenerateTeacherBarcodes';
import { usePrintTeacherBarcodes } from '@/hooks/usePrintTeacherBarcodes';
import { useTeachers } from '@/hooks/useTeachers';
import { useTheme } from '@/hooks/use-theme';
import { saveArrayBufferToCacheFile, shareFile } from '@/utils/fileDownload';
import type { NormalizedApiError } from '@/types/api';
import type { Teacher } from '@/types/teacher';

export default function AdminTeacherBarcodesListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTeachers({});

  const printMutation = usePrintTeacherBarcodes();
  const bulkGenerateMutation = useBulkGenerateTeacherBarcodes();

  const teachers = useMemo<Teacher[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrint = () => {
    const teacherIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

    printMutation.mutate(
      { teacherIds },
      {
        onSuccess: async (result) => {
          try {
            const file = saveArrayBufferToCacheFile(result.data, result.filename);
            await shareFile(file, { mimeType: 'application/pdf', dialogTitle: 'Kartu Barcode Guru' });
          } catch (shareError) {
            Alert.alert('Gagal', (shareError as Error).message ?? 'Gagal membuka file PDF.');
          }
        },
        onError: (apiError: NormalizedApiError) => {
          Alert.alert('Gagal', apiError.message || 'Gagal mencetak barcode guru.');
        },
      },
    );
  };

  const handleBulkRegenerate = () => {
    const teacherIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

    Alert.alert(
      'Terbitkan Ulang Barcode',
      `Barcode lama akan langsung tidak berlaku untuk ${teacherIds ? `${teacherIds.length} guru terpilih` : 'seluruh guru'}. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terbitkan',
          onPress: () => {
            bulkGenerateMutation.mutate(
              { teacher_ids: teacherIds },
              {
                onSuccess: (count) => {
                  Alert.alert('Berhasil', `${count} barcode guru berhasil diterbitkan ulang.`);
                  setSelectedIds(new Set());
                },
                onError: (apiError) => Alert.alert('Gagal', apiError.message || 'Gagal menerbitkan ulang barcode.'),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={teachers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              {selectedIds.size > 0
                ? `${selectedIds.size} guru dipilih`
                : 'Centang guru tertentu, atau biarkan kosong untuk memakai seluruh guru.'}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton title="Cetak Massal (PDF)" onPress={handlePrint} loading={printMutation.isPending} />
              </View>
              <View style={styles.actionButton}>
                <AppButton
                  title="Terbitkan Ulang"
                  variant="secondary"
                  onPress={handleBulkRegenerate}
                  loading={bulkGenerateMutation.isPending}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);

          return (
            <Pressable
              onPress={() => router.push(`/(app)/admin/barcodes/teachers/${item.id}`)}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Pressable
                onPress={() => toggleSelected(item.id)}
                hitSlop={8}
                style={[
                  styles.checkbox,
                  {
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.primary : 'transparent',
                  },
                ]}
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
                  NIP {item.teacher_number} • {item.barcode_status_label}
                </Text>
              </View>
            </Pressable>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={theme.primary} />
          ) : null
        }
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: Spacing.sm }}>
              <Skeleton height={60} />
              <Skeleton height={60} />
            </View>
          ) : isError ? (
            <ErrorState
              title="Gagal memuat guru"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada guru" message="Tidak ada data guru." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hint: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 12,
  },
  footerLoader: {
    marginVertical: Spacing.md,
  },
});
