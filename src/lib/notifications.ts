import { Notification, TodoItem, NotificationType, NotificationPriority } from '@/types/notification';
import { getFromStorage, saveToStorage, generateId, formatDateTime } from './storage';

const STORAGE_KEY = 'ud_backoffice_notifications';
const TODO_STORAGE_KEY = 'ud_backoffice_todos';

/**
 * Get all notifications
 */
export function getNotifications(): Notification[] {
  return getFromStorage<Notification>(STORAGE_KEY);
}

/**
 * Get unread notifications count
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter((n) => n.status === 'unread').length;
}

/**
 * Create a new notification
 */
export function createNotification(
  type: NotificationType,
  title: string,
  description: string,
  priority: NotificationPriority = 'normal',
  actionUrl?: string,
  metadata?: any
): Notification {
  const notification: Notification = {
    id: generateId(),
    type,
    title,
    description,
    priority,
    status: 'unread',
    createdAt: formatDateTime(),
    actionUrl,
    metadata,
  };

  const notifications = getNotifications();
  saveToStorage(STORAGE_KEY, [notification, ...notifications]);

  return notification;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: number): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, status: 'read' as const } : n
  );
  saveToStorage(STORAGE_KEY, updated);
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, status: 'read' as const }));
  saveToStorage(STORAGE_KEY, updated);
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: number): void {
  const notifications = getNotifications();
  const filtered = notifications.filter((n) => n.id !== notificationId);
  saveToStorage(STORAGE_KEY, filtered);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  saveToStorage(STORAGE_KEY, []);
}

/**
 * Get todo items
 */
export function getTodoItems(): TodoItem[] {
  return getFromStorage<TodoItem>(TODO_STORAGE_KEY);
}

/**
 * Create a todo item
 */
export function createTodoItem(
  type: TodoItem['type'],
  title: string,
  description: string,
  dueDate: string,
  priority: NotificationPriority,
  actionUrl: string,
  count?: number,
  metadata?: any
): TodoItem {
  const todo: TodoItem = {
    id: generateId(),
    type,
    title,
    description,
    dueDate,
    priority,
    status: 'pending',
    actionUrl,
    count,
    metadata,
  };

  const todos = getTodoItems();
  saveToStorage(TODO_STORAGE_KEY, [todo, ...todos]);

  return todo;
}

/**
 * Update todo status
 */
export function updateTodoStatus(todoId: number, status: TodoItem['status']): void {
  const todos = getTodoItems();
  const updated = todos.map((t) => (t.id === todoId ? { ...t, status } : t));
  saveToStorage(TODO_STORAGE_KEY, updated);
}

/**
 * Delete a todo item
 */
export function deleteTodoItem(todoId: number): void {
  const todos = getTodoItems();
  const filtered = todos.filter((t) => t.id !== todoId);
  saveToStorage(TODO_STORAGE_KEY, filtered);
}

/**
 * Generate mock notifications (for demo purposes)
 */
export function generateMockNotifications(): void {
  const mockNotifications: Notification[] = [
    {
      id: generateId(),
      type: 'kpi_submission',
      title: 'KPI 제출 대기',
      description: '김철수 교육생의 Week 3 KPI가 검토 대기 중입니다.',
      priority: 'high',
      status: 'unread',
      createdAt: formatDateTime(new Date(Date.now() - 10 * 60 * 1000)),
      actionUrl: '/education/kpi',
      metadata: {
        studentId: 1,
        studentName: '김철수',
        kpiId: 1,
      },
    },
    {
      id: generateId(),
      type: 'assignment_submission',
      title: '과제 제출 대기',
      description: '이영희 교육생의 "비즈니스 모델 캔버스" 과제가 제출되었습니다.',
      priority: 'normal',
      status: 'unread',
      createdAt: formatDateTime(new Date(Date.now() - 25 * 60 * 1000)),
      actionUrl: '/education/assignment',
      metadata: {
        studentId: 2,
        studentName: '이영희',
        assignmentId: 1,
      },
    },
    {
      id: generateId(),
      type: 'deadline_approaching',
      title: '마감 임박',
      description: '"팀 프로젝트 기획서" 과제 마감이 24시간 남았습니다.',
      priority: 'urgent',
      status: 'unread',
      createdAt: formatDateTime(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      actionUrl: '/education/assignment',
      metadata: {
        assignmentId: 2,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    },
    {
      id: generateId(),
      type: 'new_student',
      title: '신규 교육생 등록',
      description: '신규 교육생 3명이 "YEEEYEP 인도네시아"에 등록되었습니다.',
      priority: 'normal',
      status: 'read',
      createdAt: formatDateTime(new Date(Date.now() - 3 * 60 * 60 * 1000)),
      actionUrl: '/students/list',
      metadata: {
        programId: 1,
        programName: 'YEEEYEP 인도네시아',
      },
    },
  ];

  saveToStorage(STORAGE_KEY, mockNotifications);
}

/**
 * Generate mock todo items (for demo purposes)
 */
export function generateMockTodos(): void {
  const mockTodos: TodoItem[] = [
    {
      id: generateId(),
      type: 'kpi',
      title: 'KPI 제출물 검토',
      description: '검토 대기 중인 KPI 제출물',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      actionUrl: '/education/kpi',
      count: 5,
    },
    {
      id: generateId(),
      type: 'assignment',
      title: '과제 피드백 작성',
      description: '피드백 대기 중인 과제',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      actionUrl: '/education/assignment',
      count: 8,
    },
    {
      id: generateId(),
      type: 'attendance',
      title: '출석 체크',
      description: '오늘 출석 체크 필요',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'normal',
      status: 'pending',
      actionUrl: '/education/attendance',
      count: 2,
    },
  ];

  saveToStorage(TODO_STORAGE_KEY, mockTodos);
}
