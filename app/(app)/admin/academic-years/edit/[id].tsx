import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AcademicYearForm } from '@/components/academic-years/AcademicYearForm';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Spacing } from '@/constants/theme';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useUpdateAcademicYear } from '@/hooks/useUpdateAcademicYear';
import { useTheme } from '@/hooks/use-theme';

export default function AdminAcademicYearEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const academicYearId = Number(id);

  const { data: academicYear, isPending, isError, error, refetch } = useAcademicYear(academicYearId);
  const updateAcademicYearMutation = useUpdateAcademicYear(academicYearId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={300} />
      </View>
    );
  }

  if (isError || !academicYear) {
    return (
      <ErrorState
        title="Gagal memuat data tahun ajaran"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <AcademicYearForm
      submitLabel="Simpan Perubahan"
      isSubmitting={updateAcademicYearMutation.isPending}
      defaultValues={{
        name: academicYear.name,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
      }}
      onSubmit={async (payload) => {
        await updateAcademicYearMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Tahun ajaran berhasil diperbarui.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
