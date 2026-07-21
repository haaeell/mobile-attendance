import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { ClassroomForm } from '@/components/classrooms/ClassroomForm';
import { useCreateClassroom } from '@/hooks/useCreateClassroom';

export default function AdminClassroomCreateScreen() {
  const router = useRouter();
  const createClassroomMutation = useCreateClassroom();

  return (
    <ClassroomForm
      submitLabel="Simpan"
      isSubmitting={createClassroomMutation.isPending}
      onSubmit={async (payload) => {
        await createClassroomMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Kelas berhasil ditambahkan.', [{ text: 'OK', onPress: () => router.back() }]);
      }}
    />
  );
}
