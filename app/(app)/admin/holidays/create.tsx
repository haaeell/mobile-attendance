import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { HolidayForm } from '@/components/holidays/HolidayForm';
import { useCreateHoliday } from '@/hooks/useCreateHoliday';

export default function AdminHolidayCreateScreen() {
  const router = useRouter();
  const createHolidayMutation = useCreateHoliday();

  return (
    <HolidayForm
      submitLabel="Simpan"
      isSubmitting={createHolidayMutation.isPending}
      onSubmit={async (payload) => {
        await createHolidayMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Hari libur berhasil ditambahkan.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }}
    />
  );
}
