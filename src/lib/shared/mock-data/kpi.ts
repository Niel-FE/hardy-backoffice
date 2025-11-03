// KPI 관련 타입 정의 및 Mock 데이터

/**
 * 핵심 KPI (프로그램 필수 KPI)
 * - 백오피스에서 프로그램 등록 시 설정
 * - 모든 교육생이 필수로 완료해야 함
 */
export interface CoreKPI {
  id: number;
  programId: number;
  name: string;
  description: string;
  targetValue: number;
  unit: string; // '명', '개', '회' 등
  order: number;
  createdDate: string;
}

/**
 * 핵심 KPI 진행 상황 (개인별)
 */
export interface CoreKPIProgress {
  id: number;
  coreKpiId: number;
  studentId: number;
  currentValue: number;
  targetValue: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastUpdated: string;
}

/**
 * 팀 KPI
 * - 팀이 자체적으로 설정한 목표
 * - 팀 전체 목표가 있고 팀원들에게 업무 분배
 */
export interface TeamKPI {
  id: number;
  teamId: number;
  name: string;
  description: string;
  totalTarget: number; // 팀 전체 목표
  unit: string;
  status: 'active' | 'completed' | 'cancelled';
  createdDate: string;
  deadline?: string;
}

/**
 * 팀 KPI 할당 (팀원별)
 */
export interface TeamKPIAssignment {
  id: number;
  teamKpiId: number;
  studentId: number;
  assignedTarget: number; // 개인에게 할당된 목표
  currentValue: number; // 현재 달성값
  status: 'not_started' | 'in_progress' | 'completed';
  lastUpdated: string;
}

// Mock 데이터: 핵심 KPI (프로그램별)
export const mockCoreKPIs: CoreKPI[] = [
  {
    id: 1,
    programId: 1, // YEEEYEP 인도네시아
    name: '고객 인터뷰',
    description: '타겟 고객 최소 10명 인터뷰 실시',
    targetValue: 10,
    unit: '명',
    order: 1,
    createdDate: '2025-09-01'
  },
  {
    id: 2,
    programId: 1,
    name: '시장 조사 보고서',
    description: '타겟 시장 분석 보고서 1건 제출',
    targetValue: 1,
    unit: '건',
    order: 2,
    createdDate: '2025-09-01'
  },
  {
    id: 3,
    programId: 1,
    name: '프로토타입 제작',
    description: 'MVP 프로토타입 제작 및 테스트',
    targetValue: 1,
    unit: '개',
    order: 3,
    createdDate: '2025-09-01'
  }
];

// Mock 데이터: 핵심 KPI 진행 상황 (학생 ID 1번 기준)
export const mockCoreKPIProgress: CoreKPIProgress[] = [
  {
    id: 1,
    coreKpiId: 1, // 고객 인터뷰
    studentId: 1,
    currentValue: 8,
    targetValue: 10,
    status: 'in_progress',
    lastUpdated: '2025-10-20'
  },
  {
    id: 2,
    coreKpiId: 2, // 시장 조사 보고서
    studentId: 1,
    currentValue: 1,
    targetValue: 1,
    status: 'completed',
    lastUpdated: '2025-10-15'
  },
  {
    id: 3,
    coreKpiId: 3, // 프로토타입 제작
    studentId: 1,
    currentValue: 0,
    targetValue: 1,
    status: 'not_started',
    lastUpdated: '2025-10-01'
  }
];

// Mock 데이터: 팀 KPI (이노베이터스 팀)
export const mockTeamKPIs: TeamKPI[] = [
  {
    id: 1,
    teamId: 1, // 이노베이터스
    name: '주간 팀 회의',
    description: '주 1회 정기 팀 회의 진행 (총 10회)',
    totalTarget: 10,
    unit: '회',
    status: 'active',
    createdDate: '2025-09-01',
    deadline: '2025-12-31'
  },
  {
    id: 2,
    teamId: 1,
    name: '고객 피드백 수집',
    description: '팀 전체 고객 피드백 30건 수집',
    totalTarget: 30,
    unit: '건',
    status: 'active',
    createdDate: '2025-09-15',
    deadline: '2025-11-30'
  },
  {
    id: 3,
    teamId: 1,
    name: '비즈니스 모델 개선안',
    description: '비즈니스 모델 개선 제안 5건 도출',
    totalTarget: 5,
    unit: '건',
    status: 'active',
    createdDate: '2025-09-20',
    deadline: '2025-11-15'
  }
];

// Mock 데이터: 팀 KPI 할당 (학생 ID 1번 기준)
export const mockTeamKPIAssignments: TeamKPIAssignment[] = [
  {
    id: 1,
    teamKpiId: 1, // 주간 팀 회의
    studentId: 1,
    assignedTarget: 10, // 팀 전체가 참여하므로 동일
    currentValue: 6,
    status: 'in_progress',
    lastUpdated: '2025-10-20'
  },
  {
    id: 2,
    teamKpiId: 2, // 고객 피드백 수집 (30건을 5명이 분담)
    studentId: 1,
    assignedTarget: 6,
    currentValue: 4,
    status: 'in_progress',
    lastUpdated: '2025-10-18'
  },
  {
    id: 3,
    teamKpiId: 3, // 비즈니스 모델 개선안 (5건을 5명이 분담)
    studentId: 1,
    assignedTarget: 1,
    currentValue: 1,
    status: 'completed',
    lastUpdated: '2025-10-10'
  }
];
