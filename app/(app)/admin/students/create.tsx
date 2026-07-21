import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { StudentForm } from '@/components/students/StudentForm';
import { useCreateStudent } from '@/hooks/useCreateStudent';

export default function AdminStudentCreateScreen() {
  const router = useRouter();
  const createStudentMutation = useCreateStudent();

  return (
    <StudentForm
      submitLabel="Simpan"
      isSubmitting={createStudentMutation.isPending}
      onSubmit={async (payload) => {
        await createStudentMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Siswa berhasil ditambahkan.', [{ text: 'OK', onPress: () => router.back() }]);
      }}
    />
  );
}
