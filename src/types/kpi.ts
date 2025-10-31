/**
 * KPI 관련 타입 정의
 */

// 진행률 표시 방식
export type ProgressDisplayType = 'bar' | 'pie' | 'number' | 'percentage' | 'donut';

// 지원 언어
export type SupportedLanguage = 'ko' | 'en' | 'ja';

// KPI 템플릿 (KPI 관리 페이지에서 CRUD)
export interface KPITemplate {
  id: number;
  name: string;
  description: string;
  unit: string; // %, 점, 시간, 회 등
  language: SupportedLanguage; // 지원 언어 (한국어/영어/일본어)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 프로그램에 할당된 필수 KPI
export interface ProgramKPI {
  id: number;
  programId: number;
  programName: string;
  kpiTemplateId: number;
  kpiName: string;
  targetValue: number; // 프로그램별 목표값
  unit: string;
  isRequired: boolean; // 필수 여부
  createdAt: string;
}

// 팀 KPI 목표 (팀이 설정하는 큰 목표)
export interface TeamKPIGoal {
  id: number;
  teamId: number;
  teamName: string;
  programId: number;
  programName: string;
  goalName: string;
  description: string;
  startDate: string;
  endDate: string;
  progressDisplayType: ProgressDisplayType; // 진행률 표시 방식
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 팀 KPI 세부 항목 (팀 목표 안의 세부 KPI, 여러 팀원에게 할당 가능)
export interface TeamKPIDetail {
  id: number;
  teamGoalId: number;
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  assignedStudents: {
    studentId: number;
    studentName: string;
    currentValue: number; // 해당 팀원의 현재 달성값
    progress: number; // 해당 팀원의 진행률 (%)
  }[]; // 여러 팀원 할당 가능
  totalCurrentValue: number; // 전체 달성값 (모든 팀원 합계)
  totalProgress: number; // 전체 진행률 (%)
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// KPI 제출물 (필수 KPI 또는 팀 KPI)
export interface KPISubmission {
  id: number;
  type: 'required' | 'team'; // 필수 KPI인지 팀 KPI인지
  studentId: number;
  studentName: string;
  teamId: number;
  teamName: string;
  programId: number;
  programName: string;
  week: number;
  // 필수 KPI용
  programKpiId?: number;
  kpiTemplateId?: number;
  kpiName?: string;
  // 팀 KPI용
  teamKpiDetailId?: number;
  teamGoalId?: number;
  teamKpiName?: string;
  // 공통
  submitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  coachId: number;
  coachName: string;
  feedback?: string;
  actualValue: number; // 제출한 값
  targetValue: number; // 목표값
  unit: string;
}
