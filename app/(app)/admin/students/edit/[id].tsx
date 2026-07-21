import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { StudentForm } from '@/components/students/StudentForm';
import { Spacing } from '@/constants/theme';
import { useStudent } from '@/hooks/useStudent';
import { useUpdateStudent } from '@/hooks/useUpdateStudent';
import { useTheme } from '@/hooks/use-theme';

export default function AdminStudentEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const studentId = Number(id);

  const { data: student, isPending, isError, error, refetch } = useStudent(studentId);
  const updateStudentMutation = useUpdateStudent(studentId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={400} />
      </View>
    );
  }

  if (isError || !student) {
    return (
      <ErrorState
        title="Gagal memuat data siswa"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <StudentForm
      submitLabel="Simpan Perubahan"
      isSubmitting={updateStudentMutation.isPending}
      defaultValues={{
        academic_year_id: student.academic_year_id,
        classroom_id: student.classroom_id,
        nis: student.nis,
        nisn: student.nisn ?? '',
        name: student.name,
        gender: student.gender,
        birth_place: student.birth_place ?? '',
        birth_date: student.birth_date ?? '',
        parent_name: student.parent_name ?? '',
        parent_phone: student.parent_phone ?? '',
        address: student.address ?? '',
      }}
      onSubmit={async (payload) => {
        await updateStudentMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Data siswa berhasil diperbarui.', [
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
