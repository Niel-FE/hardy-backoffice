// 과제(Assignment) 관련 타입 정의 및 Mock 데이터

/**
 * 과제 (세션에 할당)
 * - VOD 세션에 연결된 과제
 * - KPI와는 별개의 학습 과제
 */
export interface Assignment {
  id: number;
  vodSetId: number;
  vodSetName: string;
  sessionId: number;
  sessionTitle: string;
  title: string;
  description: string;
  dueDate?: string;
  programId: number;
  programName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 과제 제출물
 */
export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  teamId: number;
  teamName: string;
  programId: number;
  programName: string;
  submitDate: string;
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  coachId: number;
  coachName: string;
  rating?: number; // 1-5
  feedback?: string;
  submissionUrl?: string; // 제출물 URL (GitHub, 노션 등)
  submissionNote?: string; // 제출 노트
}

// Mock 데이터: 과제 목록 (VOD 세트에서 생성된 과제들)
export const mockAssignments: Assignment[] = [
  {
    id: 1,
    vodSetId: 1,
    vodSetName: 'Week 1: 비즈니스 모델 캔버스',
    sessionId: 101,
    sessionTitle: '1-1. 비즈니스 모델 작성하기',
    title: '비즈니스 모델 캔버스 작성',
    description: '비즈니스 모델 캔버스의 9가지 요소를 이해하고 자신의 아이디어를 작성해보세요.',
    dueDate: '2025-10-25',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
  {
    id: 2,
    vodSetId: 2,
    vodSetName: 'Week 2: 고객 발견 및 검증',
    sessionId: 201,
    sessionTitle: '2-1. 고객 인터뷰 기법',
    title: '고객 인터뷰 수행 및 보고서 작성',
    description: '최소 5명 이상의 잠재 고객을 인터뷰하고 결과를 정리하세요.',
    dueDate: '2025-11-01',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-08',
    updatedAt: '2025-10-08',
  },
  {
    id: 3,
    vodSetId: 3,
    vodSetName: 'Week 3: 가치 제안 설계',
    sessionId: 301,
    sessionTitle: '3-1. 가치 제안 캔버스',
    title: '가치 제안 캔버스 완성',
    description: '고객의 Pain Points와 Gains를 분석하고 솔루션을 매핑하세요.',
    dueDate: '2025-11-08',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-15',
    updatedAt: '2025-10-15',
  },
  {
    id: 4,
    vodSetId: 4,
    vodSetName: 'Week 4: 시장 조사 및 분석',
    sessionId: 401,
    sessionTitle: '4-1. 시장 조사 방법론',
    title: '시장 조사 보고서 작성',
    description: '타겟 시장 조사 및 분석을 수행합니다. 경쟁사 분석, 고객 니즈 파악 등을 포함하세요.',
    dueDate: '2025-11-15',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-22',
    updatedAt: '2025-10-22',
  },
  {
    id: 5,
    vodSetId: 5,
    vodSetName: 'Week 5: MVP 설계 및 테스트',
    sessionId: 501,
    sessionTitle: '5-1. MVP 개발 전략',
    title: 'MVP 프로토타입 제작',
    description: 'Minimum Viable Product을 설계하고 프로토타입을 제작하세요.',
    dueDate: '2025-11-22',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-29',
    updatedAt: '2025-10-29',
  },
];

// Mock 데이터: 과제 제출물 (학생 ID 1번 기준)
export const mockAssignmentSubmissions: AssignmentSubmission[] = [
  {
    id: 1,
    assignmentId: 1,
    assignmentTitle: '비즈니스 모델 캔버스 작성',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    submitDate: '2025-10-24',
    status: 'approved',
    coachId: 1,
    coachName: '박코치',
    rating: 5,
    feedback: '비즈니스 모델의 각 요소가 명확하게 정리되었습니다. 특히 수익 모델 부분이 구체적이고 현실적입니다.',
    submissionUrl: 'https://drive.google.com/file/d/bmc-김철수',
    submissionNote: '9가지 요소를 모두 작성했으며, 핵심 파트너와 수익 구조를 중점적으로 다뤘습니다.',
  },
  {
    id: 2,
    assignmentId: 2,
    assignmentTitle: '고객 인터뷰 수행 및 보고서 작성',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    submitDate: '2025-10-30',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionUrl: 'https://docs.google.com/document/d/interview-김철수',
    submissionNote: '총 7명의 고객을 인터뷰했으며, 공통된 Pain Point 3가지를 도출했습니다.',
  },
  {
    id: 3,
    assignmentId: 3,
    assignmentTitle: '가치 제안 캔버스 완성',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    submitDate: '2025-11-07',
    status: 'not_submitted',
    coachId: 1,
    coachName: '박코치',
  },
  {
    id: 4,
    assignmentId: 4,
    assignmentTitle: '시장 조사 보고서 작성',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    submitDate: '',
    status: 'not_submitted',
    coachId: 1,
    coachName: '박코치',
  },
  {
    id: 5,
    assignmentId: 5,
    assignmentTitle: 'MVP 프로토타입 제작',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    submitDate: '',
    status: 'not_submitted',
    coachId: 1,
    coachName: '박코치',
  },
];
