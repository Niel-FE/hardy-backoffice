/**
 * Phase 2.3: 프로그램 연동 관련 타입 정의
 * - 프로그램-VOD 세트 연동
 * - 학생 진도 관리
 * - VOD 시청 이력
 */

/**
 * 프로그램-VOD 세트 연결
 * 프로그램에 할당된 VOD 세트 정보
 */
export interface ProgramVODSet {
  id: number;
  programId: number;
  programName: string;
  vodSetId: number;
  vodSetName: string;
  assignedDate: string;
  order: number; // 프로그램 내에서의 순서
  status: 'active' | 'archived';
  createdAt: string;
}

/**
 * 학생 진도 상태
 * 학생별 VOD 세션 진행 상황 추적
 */
export interface StudentProgress {
  id: number;
  studentId: number;
  studentName: string;
  programId: number;
  programName: string;
  vodSetId: number;
  vodSetName: string;
  sessionId: number;
  sessionName: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  updatedAt: string;
}

/**
 * VOD 시청 이력
 * 학생의 상세 시청 기록
 */
export interface VODViewingHistory {
  id: number;
  studentId: number;
  studentName: string;
  programId: number;
  vodSetId: number;
  sessionId: number;
  vodUrl: string;
  vodDescription: string;
  watchedDuration: number; // 초 단위
  totalDuration: number; // 초 단위
  progressPercentage: number; // 0-100
  completed: boolean;
  firstWatchedAt: string;
  lastWatchedAt: string;
  watchCount: number; // 시청 횟수
}

/**
 * 학생 진도 요약
 * 프로그램별 학생의 전체 진도 요약
 */
export interface StudentProgressSummary {
  studentId: number;
  studentName: string;
  programId: number;
  programName: string;
  totalVODSets: number;
  completedVODSets: number;
  inProgressVODSets: number;
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  overallProgress: number; // 0-100
  lastActivityAt?: string;
}
