import type { Attendance, ScanLogEntry } from '@/types/attendance';

export interface AttendanceStatsToday {
  present: number;
  late: number;
  permission: number;
  sick: number;
  dispensation: number;
  alpha: number;
  not_recorded: number;
  total: number;
}

export interface ClassroomStatusSummary {
  present: number;
  late: number;
  permission: number;
  sick: number;
  dispensation: number;
  alpha: number;
  not_recorded: number;
}

export interface DashboardTotals {
  students: number;
  teachers: number;
  classrooms: number;
}

export interface SevenDayStatEntry {
  date: string;
  present: number;
  late: number;
  alpha: number;
  attendance_percentage: number;
}

export interface BestClassroomEntry {
  id: number;
  name: string;
  attendance_percentage: number;
  summary: ClassroomStatusSummary;
}

export interface AdminDashboardData {
  role: 'admin';
  totals: DashboardTotals;
  today: {
    student: AttendanceStatsToday;
    teacher: AttendanceStatsToday;
  };
  latest_scans: ScanLogEntry[];
  seven_day_statistics: SevenDayStatEntry[];
  best_classrooms: BestClassroomEntry[];
}

export interface TeacherDashboardData {
  role: 'teacher';
  own_attendance: Attendance | null;
  latest_scans: ScanLogEntry[];
  homeroom_summary: {
    classroom: { id: number; name: string };
    summary: ClassroomStatusSummary;
  } | null;
}

export type DashboardData = AdminDashboardData | TeacherDashboardData;

export function isAdminDashboard(data: DashboardData): data is AdminDashboardData {
  return data.role === 'admin';
}
