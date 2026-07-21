import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AttendanceSettingForm } from '@/components/attendance-settings/AttendanceSettingForm';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/Skeleton';
import { Spacing } from '@/constants/theme';
import { useAttendanceSetting } from '@/hooks/useAttendanceSetting';
import { useUpdateAttendanceSetting } from '@/hooks/useUpdateAttendanceSetting';
import { useTheme } from '@/hooks/use-theme';

function toTimeInput(time: string | null): string {
  return time ? time.slice(0, 5) : '';
}

export default function AdminAttendanceSettingEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const settingId = Number(id);

  const { data: setting, isPending, isError, error, refetch } = useAttendanceSetting(settingId);
  const updateAttendanceSettingMutation = useUpdateAttendanceSetting(settingId);

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={500} />
      </View>
    );
  }

  if (isError || !setting) {
    return (
      <ErrorState
        title="Gagal memuat data jadwal"
        message={error?.message ?? 'Data tidak ditemukan.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <AttendanceSettingForm
      submitLabel="Simpan Perubahan"
      isSubmitting={updateAttendanceSettingMutation.isPending}
      defaultValues={{
        academic_year_id: setting.academic_year_id,
        subject_type: setting.subject_type,
        effective_date: setting.effective_date ?? '',
        check_in_start: toTimeInput(setting.check_in_start),
        on_time_limit: toTimeInput(setting.on_time_limit),
        late_limit: toTimeInput(setting.late_limit),
        check_in_close: toTimeInput(setting.check_in_close),
        check_out_start: toTimeInput(setting.check_out_start),
        check_out_end: toTimeInput(setting.check_out_end),
        allow_early_checkout: setting.allow_early_checkout,
      }}
      onSubmit={async (payload) => {
        await updateAttendanceSettingMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Jadwal absensi berhasil diperbarui.', [
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
