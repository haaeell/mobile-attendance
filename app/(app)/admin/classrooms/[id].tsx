import { useLocalSearchParams, useRouter } from 'expo-router';
import { GraduationCap, Pencil, UserX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ErrorState } from '@/components/ErrorState';
import { SelectModal } from '@/components/SelectModal';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Radius, Spacing } from '@/constants/theme';
import { useClassroom } from '@/hooks/useClassroom';
import { useStudents } from '@/hooks/useStudents';
import { useTeacherOptions } from '@/hooks/useTeacherOptions';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateClassroomHomeroomTeacher } from '@/hooks/useUpdateClassroomHomeroomTeacher';
import type { NormalizedApiError } from '@/types/api';
import type { Student } from '@/types/student';

export default function AdminClassroomDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const classroomId = Number(id);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const { data: classroom, isPending, isError, error, refetch } = useClassroom(classroomId);
  const studentsQuery = useStudents({ classroom_id: classroomId });
  const teacherOptionsQuery = useTeacherOptions();
  const updateHomeroomTeacherMutation = useUpdateClassroomHomeroomTeacher(classroomId);

  const students = useMemo<Student[]>(
    () => studentsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [studentsQuery.data],
  );

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <Skeleton height={140} />
        <View style={{ height: Spacing.md }} />
        <Skeleton height={200} />
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

  const showError = (apiError: NormalizedApiError, fallback: string) => {
    Alert.alert('Gagal', apiError.message || fallback);
  };

  const handleAssignTeacher = (teacherId: number) => {
    const teacherName = teacherOptionsQuery.data?.find((option) => option.id === teacherId)?.name ?? '';

    Alert.alert(
      'Konfirmasi Wali Kelas',
      `Jadikan ${teacherName} sebagai wali kelas ${classroom.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            updateHomeroomTeacherMutation.mutate(teacherId, {
              onError: (mutationError) => showError(mutationError, 'Gagal menentukan wali kelas.'),
            });
          },
        },
      ],
    );
  };

  const handleUnassignTeacher = () => {
    Alert.alert(
      'Lepas Wali Kelas',
      `Yakin ingin melepas ${classroom.homeroom_teacher?.name ?? 'guru ini'} sebagai wali kelas ${classroom.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lepas',
          style: 'destructive',
          onPress: () => {
            updateHomeroomTeacherMutation.mutate(null, {
              onError: (mutationError) => showError(mutationError, 'Gagal melepas wali kelas.'),
            });
          },
        },
      ],
    );
  };

  return (
    <>
    <FlatList
      data={students}
      keyExtractor={(item) => String(item.id)}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={{ gap: Spacing.md, marginBottom: Spacing.md }}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.name, { color: theme.textPrimary }]}>{classroom.name}</Text>
              <StatusBadge
                label={classroom.is_active ? 'Aktif' : 'Tidak Aktif'}
                tone={classroom.is_active ? 'success' : 'danger'}
              />
            </View>
            <Text style={[styles.subLine, { color: theme.textSecondary }]}>
              {classroom.grade_level}
              {classroom.major ? ` • ${classroom.major}` : ''}
            </Text>
            {classroom.academic_year?.name ? (
              <Text style={[styles.subLine, { color: theme.textSecondary }]}>
                Tahun Ajaran {classroom.academic_year.name}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Wali Kelas</Text>
            <Text style={[styles.subLine, { color: theme.textSecondary }]}>
              {classroom.homeroom_teacher?.name ?? 'Belum ditentukan'}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Pilih Wali Kelas"
                  icon={GraduationCap}
                  variant="secondary"
                  onPress={() => setIsTeacherModalOpen(true)}
                  loading={updateHomeroomTeacherMutation.isPending}
                />
              </View>
              {classroom.homeroom_teacher_id ? (
                <View style={styles.actionButton}>
                  <AppButton
                    title="Lepas Wali Kelas"
                    icon={UserX}
                    variant="danger"
                    onPress={handleUnassignTeacher}
                    loading={updateHomeroomTeacherMutation.isPending}
                  />
                </View>
              ) : null}
            </View>
          </View>

          <AppButton
            title="Edit Kelas"
            icon={Pencil}
            onPress={() => router.push(`/(app)/admin/classrooms/edit/${classroomId}`)}
          />

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Siswa Kelas ({studentsQuery.data?.pages[0]?.meta.total ?? students.length})
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.studentItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.studentName, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.subLine, { color: theme.textSecondary }]} numberOfLines={1}>
            NIS {item.nis}
          </Text>
        </View>
      )}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (studentsQuery.hasNextPage && !studentsQuery.isFetchingNextPage) {
          studentsQuery.fetchNextPage();
        }
      }}
      ListEmptyComponent={
        studentsQuery.isPending ? (
          <Skeleton height={60} />
        ) : (
          <Text style={[styles.subLine, { color: theme.textSecondary }]}>Belum ada siswa di kelas ini.</Text>
        )
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
    />

    <SelectModal
      visible={isTeacherModalOpen}
      title="Pilih Wali Kelas"
      options={(teacherOptionsQuery.data ?? []).map((option) => ({ label: option.name, value: option.id }))}
      selectedValue={classroom.homeroom_teacher_id}
      allowClear={false}
      onSelect={(value) => {
        if (value != null) {
          handleAssignTeacher(value);
        }
      }}
      onClose={() => setIsTeacherModalOpen(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  subLine: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  studentItem: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs / 2,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
  },
});
