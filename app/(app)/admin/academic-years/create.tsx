import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { AcademicYearForm } from '@/components/academic-years/AcademicYearForm';
import { useCreateAcademicYear } from '@/hooks/useCreateAcademicYear';

export default function AdminAcademicYearCreateScreen() {
  const router = useRouter();
  const createAcademicYearMutation = useCreateAcademicYear();

  return (
    <AcademicYearForm
      submitLabel="Simpan"
      isSubmitting={createAcademicYearMutation.isPending}
      onSubmit={async (payload) => {
        await createAcademicYearMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Tahun ajaran berhasil ditambahkan.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }}
    />
  );
}
