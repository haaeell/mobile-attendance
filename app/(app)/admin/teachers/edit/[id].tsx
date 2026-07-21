import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { TeacherForm } from '@/components/teachers/TeacherForm';
import { Spacing } from '@/constants/theme';
import { useTeacher } from '@/hooks/useTeacher';
import { useUpdateTeacher } from '@/hooks/useUpdateTeacher';
import { useTheme } from '@/hooks/use-theme';

export default function AdminTeacherEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacherId = Number(id);

  const { data: teacher, isPending, isError, error, refetch } = useTeacher(teacherId);
  const updateTeacherMutation = useUpdateTeacher(teacherId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={400} />
      </View>
    );
  }

  if (isError || !teacher) {
    return (
      <ErrorState
        title="Gagal memuat data guru"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <TeacherForm
      mode="edit"
      submitLabel="Simpan Perubahan"
      isSubmitting={updateTeacherMutation.isPending}
      defaultValues={{
        teacher_number: teacher.teacher_number,
        name: teacher.name,
        email: teacher.email,
        gender: teacher.gender,
        phone: teacher.phone ?? '',
        address: teacher.address ?? '',
      }}
      onSubmit={async (payload) => {
        await updateTeacherMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Data guru berhasil diperbarui.', [
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
