import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { HolidayForm } from '@/components/holidays/HolidayForm';
import { Skeleton } from '@/components/Skeleton';
import { Spacing } from '@/constants/theme';
import { useHoliday } from '@/hooks/useHoliday';
import { useUpdateHoliday } from '@/hooks/useUpdateHoliday';
import { useTheme } from '@/hooks/use-theme';

export default function AdminHolidayEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const holidayId = Number(id);

  const { data: holiday, isPending, isError, error, refetch } = useHoliday(holidayId);
  const updateHolidayMutation = useUpdateHoliday(holidayId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={400} />
      </View>
    );
  }

  if (isError || !holiday) {
    return (
      <ErrorState
        title="Gagal memuat data hari libur"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <HolidayForm
      submitLabel="Simpan Perubahan"
      isSubmitting={updateHolidayMutation.isPending}
      defaultValues={{
        name: holiday.name,
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        applies_to: holiday.applies_to,
        description: holiday.description ?? '',
      }}
      onSubmit={async (payload) => {
        await updateHolidayMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Hari libur berhasil diperbarui.', [
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
