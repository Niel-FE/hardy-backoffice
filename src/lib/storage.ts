/**
 * LocalStorage Helper Functions
 * Phase 2: CRUD 기능을 위한 데이터 영속성 관리
 */

const STORAGE_KEYS = {
  VODS: 'ud_backoffice_vods',
  VOD_SETS: 'ud_backoffice_vod_sets',
  KPIS: 'ud_backoffice_kpis',
  ASSIGNMENTS: 'ud_backoffice_assignments',
  STUDENTS: 'ud_backoffice_students',
  TEAMS: 'ud_backoffice_teams',
  PROGRAMS: 'ud_backoffice_programs',
  SESSIONS: 'ud_backoffice_sessions',
  COACHES: 'ud_backoffice_coaches',
  APPLICANTS: 'ud_backoffice_applicants',
  KPI_SUBMISSIONS: 'ud_backoffice_kpi_submissions',
  ATTENDANCE: 'ud_backoffice_attendance',
  USERS: 'ud_backoffice_users',
  NOTIFICATIONS: 'ud_backoffice_notifications',
  // Phase 2.3: 프로그램 연동
  PROGRAM_VOD_SETS: 'ud_backoffice_program_vod_sets',
  STUDENT_PROGRESS: 'ud_backoffice_student_progress',
  VOD_VIEWING_HISTORY: 'ud_backoffice_vod_viewing_history',
  // 프로그램 관리
  PROGRAM_KPIS: 'ud_backoffice_program_kpis',
  ATTENDANCE_SETTINGS: 'ud_backoffice_attendance_settings',
  // KPI 관리
  KPI_TEMPLATES: 'ud_backoffice_kpi_templates',
  // 과제 관리
  SESSION_ASSIGNMENTS: 'ud_backoffice_session_assignments',
  ASSIGNMENT_SUBMISSIONS: 'ud_backoffice_assignment_submissions',
  // 팀 KPI 관리
  TEAM_KPI_GOALS: 'ud_backoffice_team_kpi_goals',
  TEAM_KPI_DETAILS: 'ud_backoffice_team_kpi_details',
} as const;

export { STORAGE_KEYS };

/**
 * LocalStorage에서 데이터 가져오기
 */
export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
}

/**
 * LocalStorage에 데이터 저장하기
 */
export function saveToStorage<T>(key: string, data: T[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * LocalStorage에서 데이터 삭제하기
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * 모든 LocalStorage 데이터 초기화
 */
export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * ID 생성 함수 (간단한 UUID 대체)
 */
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * 날짜 포맷 함수 (YYYY-MM-DD)
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜 시간 포맷 함수 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(date: Date = new Date()): string {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}
