export type NotificationType =
  | 'kpi_submission'
  | 'assignment_submission'
  | 'deadline_approaching'
  | 'new_student'
  | 'attendance_check'
  | 'program_start'
  | 'program_end';

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    studentId?: number;
    studentName?: string;
    programId?: number;
    programName?: string;
    kpiId?: number;
    assignmentId?: number;
    dueDate?: string;
  };
}

export interface TodoItem {
  id: number;
  type: 'kpi' | 'assignment' | 'attendance' | 'approval';
  title: string;
  description: string;
  dueDate: string;
  priority: NotificationPriority;
  status: 'pending' | 'in_progress' | 'completed';
  actionUrl: string;
  count?: number;
  metadata?: {
    studentId?: number;
    studentName?: number;
    programId?: number;
    teamId?: number;
  };
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  types: Record<NotificationType, boolean>;
  frequency: 'immediate' | 'daily' | 'weekly';
}
