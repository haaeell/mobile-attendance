import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ClassroomForm } from '@/components/classrooms/ClassroomForm';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Spacing } from '@/constants/theme';
import { useClassroom } from '@/hooks/useClassroom';
import { useUpdateClassroom } from '@/hooks/useUpdateClassroom';
import { useTheme } from '@/hooks/use-theme';

export default function AdminClassroomEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const classroomId = Number(id);

  const { data: classroom, isPending, isError, error, refetch } = useClassroom(classroomId);
  const updateClassroomMutation = useUpdateClassroom(classroomId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={400} />
      </View>
    );
  }

  if (isError || !classroom) {
    return (
      <ErrorState
        title="Gagal memuat data kelas"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ClassroomForm
      submitLabel="Simpan Perubahan"
      isSubmitting={updateClassroomMutation.isPending}
      defaultValues={{
        academic_year_id: classroom.academic_year_id,
        name: classroom.name,
        grade_level: classroom.grade_level,
        major: classroom.major ?? '',
        is_active: classroom.is_active,
      }}
      onSubmit={async (payload) => {
        await updateClassroomMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Data kelas berhasil diperbarui.', [
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
