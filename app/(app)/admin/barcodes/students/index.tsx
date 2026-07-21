import { useRouter } from 'expo-router';
import { Printer, RefreshCw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useBulkGenerateStudentBarcodes } from '@/hooks/useBulkGenerateStudentBarcodes';
import { useClassroomOptions } from '@/hooks/useClassroomOptions';
import { usePrintStudentBarcodes } from '@/hooks/usePrintStudentBarcodes';
import { useStudents } from '@/hooks/useStudents';
import { useTheme } from '@/hooks/use-theme';
import { saveArrayBufferToCacheFile, shareFile } from '@/utils/fileDownload';
import type { NormalizedApiError } from '@/types/api';
import type { Student } from '@/types/student';

export default function AdminStudentBarcodesListScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const classroomOptionsQuery = useClassroomOptions();

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
  } = useStudents({ classroom_id: classroomId ?? undefined });

  const printMutation = usePrintStudentBarcodes();
  const bulkGenerateMutation = useBulkGenerateStudentBarcodes();

  const students = useMemo<Student[]>(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const selectedAcademicYearLabel =
    classroomOptionsQuery.data?.find((option) => option.id === classroomId)?.name ?? 'Semua Kelas';

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
    const studentIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

    if (!studentIds && !classroomId) {
      Alert.alert('Pilih Siswa atau Kelas', 'Pilih kelas atau centang siswa tertentu sebelum mencetak.');
      return;
    }

    printMutation.mutate(
      { classroomId: studentIds ? undefined : (classroomId ?? undefined), studentIds },
      {
        onSuccess: async (result) => {
          try {
            const file = saveArrayBufferToCacheFile(result.data, result.filename);
            await shareFile(file, { mimeType: 'application/pdf', dialogTitle: 'Kartu QR Code Siswa' });
          } catch (shareError) {
            Alert.alert('Gagal', (shareError as Error).message ?? 'Gagal membuka file PDF.');
          }
        },
        onError: (apiError: NormalizedApiError) => {
          Alert.alert('Gagal', apiError.message || 'Gagal mencetak QR code siswa.');
        },
      },
    );
  };

  const handleBulkRegenerate = () => {
    const studentIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

    if (!studentIds && !classroomId) {
      Alert.alert('Pilih Siswa atau Kelas', 'Pilih kelas atau centang siswa tertentu sebelum menerbitkan ulang.');
      return;
    }

    Alert.alert(
      'Terbitkan Ulang QR Code',
      `QR code lama akan langsung tidak berlaku untuk ${studentIds ? `${studentIds.length} siswa terpilih` : 'seluruh siswa di kelas ini'}. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terbitkan',
          onPress: () => {
            bulkGenerateMutation.mutate(
              { student_ids: studentIds, classroom_id: studentIds ? undefined : (classroomId ?? undefined) },
              {
                onSuccess: (count) => {
                  Alert.alert('Berhasil', `${count} QR code siswa berhasil diterbitkan ulang.`);
                  setSelectedIds(new Set());
                },
                onError: (apiError) => Alert.alert('Gagal', apiError.message || 'Gagal menerbitkan ulang QR code.'),
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
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable
              style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsClassroomModalOpen(true)}>
              <Text style={[styles.filterButtonText, { color: theme.textPrimary }]}>
                {selectedAcademicYearLabel}
              </Text>
            </Pressable>
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              {selectedIds.size > 0
                ? `${selectedIds.size} siswa dipilih`
                : 'Centang siswa tertentu, atau biarkan kosong untuk memakai seluruh kelas.'}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Cetak Massal (PDF)"
                  icon={Printer}
                  onPress={handlePrint}
                  loading={printMutation.isPending}
                />
              </View>
              <View style={styles.actionButton}>
                <AppButton
                  title="Terbitkan Ulang"
                  icon={RefreshCw}
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
              onLongPress={() => toggleSelected(item.id)}
              onPress={() => router.push(`/(app)/admin/barcodes/students/${item.id}`)}
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
                  NIS {item.nis} • {item.barcode_status_label}
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
              title="Gagal memuat siswa"
              message={error?.message ?? 'Silakan coba lagi.'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState title="Belum ada siswa" message="Tidak ada data yang cocok dengan filter saat ini." />
          )
        }
      />

      <SelectModal
        visible={isClassroomModalOpen}
        title="Pilih Kelas"
        options={(classroomOptionsQuery.data ?? []).map((option) => ({ label: option.name, value: option.id }))}
        selectedValue={classroomId}
        onSelect={(value) => {
          setClassroomId(value);
          setSelectedIds(new Set());
        }}
        onClose={() => setIsClassroomModalOpen(false)}
        clearLabel="Semua Kelas"
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
  filterButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
