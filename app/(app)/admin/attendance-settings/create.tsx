import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { AttendanceSettingForm } from '@/components/attendance-settings/AttendanceSettingForm';
import { useCreateAttendanceSetting } from '@/hooks/useCreateAttendanceSetting';
import type { AttendanceSubjectType } from '@/types/attendanceSetting';

export default function AdminAttendanceSettingCreateScreen() {
  const router = useRouter();
  const { subjectType } = useLocalSearchParams<{ subjectType?: AttendanceSubjectType }>();
  const createAttendanceSettingMutation = useCreateAttendanceSetting();

  return (
    <AttendanceSettingForm
      submitLabel="Simpan"
      isSubmitting={createAttendanceSettingMutation.isPending}
      defaultValues={subjectType ? { subject_type: subjectType } : undefined}
      onSubmit={async (payload) => {
        await createAttendanceSettingMutation.mutateAsync(payload);
        Alert.alert('Berhasil', 'Jadwal absensi berhasil ditambahkan.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }}
    />
  );
}
