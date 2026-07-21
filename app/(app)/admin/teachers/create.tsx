import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { TeacherForm } from '@/components/teachers/TeacherForm';
import { useCreateTeacher } from '@/hooks/useCreateTeacher';

export default function AdminTeacherCreateScreen() {
  const router = useRouter();
  const createTeacherMutation = useCreateTeacher();

  return (
    <TeacherForm
      mode="create"
      submitLabel="Simpan"
      isSubmitting={createTeacherMutation.isPending}
      onSubmit={async (payload) => {
        await createTeacherMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Guru berhasil ditambahkan.', [{ text: 'OK', onPress: () => router.back() }]);
      }}
    />
  );
}
