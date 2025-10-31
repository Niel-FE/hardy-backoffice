'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import { AssignmentSubmission } from '@/types/assignment';
import WorkflowGuide from '@/components/WorkflowGuide';

interface Assignment {
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

import { KPISubmission, TeamKPIGoal, TeamKPIDetail } from '@/types/kpi';

const mockKPISubmissions: KPISubmission[] = [
  // 김철수 (studentId: 1) - 이노베이터스
  {
    id: 1,
    type: 'required',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 3,
    kpiName: '출석률',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    actualValue: 95,
    targetValue: 90,
    unit: '%',
  },
  {
    id: 2,
    type: 'team',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 2,
    teamKpiName: '고객 인터뷰 완료',
    submitDate: '2025-10-11',
    status: 'approved',
    coachId: 1,
    coachName: '박코치',
    feedback: '완벽하게 완료되었습니다!',
    actualValue: 10,
    targetValue: 10,
    unit: '건',
  },
  {
    id: 3,
    type: 'required',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 1,
    kpiName: '멘토링 참여 시간',
    submitDate: '2025-10-07',
    status: 'approved',
    coachId: 1,
    coachName: '박코치',
    feedback: '목표를 초과 달성했습니다.',
    actualValue: 12,
    targetValue: 10,
    unit: '시간',
  },

  // 이영희 (studentId: 2) - 스타트업랩
  {
    id: 4,
    type: 'required',
    studentId: 2,
    studentName: '이영희',
    teamId: 2,
    teamName: '스타트업랩',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 3,
    kpiName: '출석률',
    submitDate: '2025-10-14',
    status: 'approved',
    coachId: 2,
    coachName: '김코치',
    feedback: '꾸준히 출석하고 있습니다.',
    actualValue: 98,
    targetValue: 90,
    unit: '%',
  },
  {
    id: 5,
    type: 'team',
    studentId: 2,
    studentName: '이영희',
    teamId: 2,
    teamName: '스타트업랩',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 3,
    teamKpiName: '사업계획서 진행률',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 2,
    coachName: '김코치',
    actualValue: 75,
    targetValue: 100,
    unit: '%',
  },
  {
    id: 6,
    type: 'required',
    studentId: 2,
    studentName: '이영희',
    teamId: 2,
    teamName: '스타트업랩',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 2,
    kpiName: '멘토링 참여 시간',
    submitDate: '2025-10-10',
    status: 'approved',
    coachId: 2,
    coachName: '김코치',
    feedback: '잘 하고 있습니다.',
    actualValue: 42,
    targetValue: 40,
    unit: '시간',
  },

  // 박민수 (studentId: 3) - 벤처스
  {
    id: 7,
    type: 'required',
    studentId: 3,
    studentName: '박민수',
    teamId: 3,
    teamName: '벤처스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 3,
    kpiName: '출석률',
    submitDate: '2025-10-13',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    actualValue: 85,
    targetValue: 90,
    unit: '%',
  },
  {
    id: 8,
    type: 'team',
    studentId: 3,
    studentName: '박민수',
    teamId: 3,
    teamName: '벤처스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 2,
    teamKpiName: '시장 조사 완료',
    submitDate: '2025-10-09',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    actualValue: 2,
    targetValue: 3,
    unit: '건',
  },
  {
    id: 9,
    type: 'required',
    studentId: 3,
    studentName: '박민수',
    teamId: 3,
    teamName: '벤처스',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    week: 1,
    kpiName: '멘토링 참여 시간',
    submitDate: '2025-10-05',
    status: 'approved',
    coachId: 1,
    coachName: '박코치',
    feedback: '기준치를 달성했습니다.',
    actualValue: 15,
    targetValue: 10,
    unit: '시간',
  },
];

// 임시 과제 목록 (VOD 세트에서 생성된 과제들)
const initialAssignments: Assignment[] = [
  {
    id: 1,
    vodSetId: 4,
    vodSetName: 'Week 4: 시장 조사 및 분석',
    sessionId: 401,
    sessionTitle: '4-1. 시장 조사 방법론',
    title: '시장 조사 실습 과제',
    description: '타겟 시장 조사 및 분석을 수행합니다. 경쟁사 분석, 고객 니즈 파악 등을 포함하세요.',
    dueDate: '2025-10-18',
    programId: 2,
    programName: '하나유니브',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
  {
    id: 2,
    vodSetId: 5,
    vodSetName: 'Week 5: 비즈니스 계획서 작성',
    sessionId: 501,
    sessionTitle: '5-1. 비즈니스 계획서 구조',
    title: '비즈니스 계획서 작성',
    description: '비즈니스 계획서의 주요 항목을 작성하고 사업 타당성을 검토합니다.',
    dueDate: '2025-10-22',
    programId: 2,
    programName: '하나유니브',
    createdAt: '2025-10-05',
    updatedAt: '2025-10-05',
  },
  {
    id: 3,
    vodSetId: 6,
    vodSetName: 'Week 6: 피칭 연습',
    sessionId: 601,
    sessionTitle: '6-1. 효과적인 피칭 스킬',
    title: '피칭 프레젠테이션',
    description: '3분 피칭 프레젠테이션을 준비하고 연습합니다.',
    dueDate: '2025-10-28',
    programId: 2,
    programName: '하나유니브',
    createdAt: '2025-10-08',
    updatedAt: '2025-10-08',
  },
  {
    id: 4,
    vodSetId: 1,
    vodSetName: 'Week 1: 비즈니스 모델 캔버스',
    sessionId: 101,
    sessionTitle: '1-1. 비즈니스 모델 작성하기',
    title: '비즈니스 모델 캔버스 작성',
    description: '비즈니스 모델 캔버스의 9가지 요소를 이해하고 자신의 아이디어를 작성해보세요.',
    dueDate: '2025-10-20',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
  {
    id: 5,
    vodSetId: 2,
    vodSetName: 'Week 2: 고객 발견 및 검증',
    sessionId: 201,
    sessionTitle: '2-1. 고객 인터뷰 기법',
    title: '고객 인터뷰 수행',
    description: '최소 5명 이상의 잠재 고객을 인터뷰하고 결과를 정리하세요.',
    dueDate: '2025-10-25',
    programId: 1,
    programName: 'YEEEYEP 인도네시아',
    createdAt: '2025-10-05',
    updatedAt: '2025-10-05',
  },
];

const mockAssignmentSubmissions: AssignmentSubmission[] = [
  // 과제 ID 1번 제출물들 - 시장 조사 실습 과제
  {
    id: 1,
    assignmentId: 1,
    assignmentTitle: '시장 조사 실습 과제',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionUrl: 'https://drive.google.com/file/d/시장조사-김철수',
    submissionNote: '모든 요구사항을 완료했습니다. 경쟁사 분석 및 고객 니즈 파악을 진행했습니다.',
  },
  {
    id: 2,
    assignmentId: 1,
    assignmentTitle: '시장 조사 실습 과제',
    studentId: 2,
    studentName: '이영희',
    teamId: 2,
    teamName: '스타트업랩',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionNote: `시장 조사의 핵심 단계:

1. 타겟 시장 정의
2. 경쟁사 분석 (직접 경쟁자, 간접 경쟁자)
3. 고객 인터뷰 및 설문조사
4. 시장 규모 및 성장성 분석
5. 진입 전략 수립

이번 과제를 통해 TAM, SAM, SOM 개념을 이해하고 실제 시장 규모를 추정해보았습니다.`,
  },
  {
    id: 3,
    assignmentId: 1,
    assignmentTitle: '시장 조사 실습 과제',
    studentId: 3,
    studentName: '박민수',
    teamId: 3,
    teamName: '벤처스',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-13',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionUrl: 'https://docs.google.com/presentation/d/시장조사-박민수',
  },
  {
    id: 4,
    assignmentId: 1,
    assignmentTitle: '시장 조사 실습 과제',
    studentId: 4,
    studentName: '정수진',
    teamId: 4,
    teamName: '글로벌챌린저스',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-12',
    status: 'approved',
    coachId: 1,
    coachName: '박코치',
    rating: 5,
    feedback: '매우 잘 작성되었습니다. 경쟁사 분석이 매우 상세하고 시장 진입 전략이 명확합니다.',
    submissionUrl: 'https://drive.google.com/file/d/시장조사-정수진',
    submissionNote: '시장 조사 보고서에 인터뷰 결과와 통계 자료를 첨부했습니다.',
  },
  {
    id: 5,
    assignmentId: 1,
    assignmentTitle: '시장 조사 실습 과제',
    studentId: 5,
    studentName: '최동욱',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-11',
    status: 'rejected',
    coachId: 1,
    coachName: '박코치',
    rating: 2,
    feedback: '경쟁사 분석이 표면적입니다. 실제 고객 인터뷰 데이터를 추가하고 시장 규모 추정 근거를 보완해주세요.',
    submissionUrl: 'https://drive.google.com/file/d/시장조사-최동욱',
  },
  // 과제 ID 2번 제출물들 - 비즈니스 계획서 작성
  {
    id: 6,
    assignmentId: 2,
    assignmentTitle: '비즈니스 계획서 작성',
    studentId: 1,
    studentName: '김철수',
    teamId: 1,
    teamName: '이노베이터스',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionUrl: 'https://docs.google.com/document/d/사업계획서-김철수',
    submissionNote: '비즈니스 계획서의 주요 섹션을 모두 작성했습니다. 재무 계획 및 수익 모델을 포함했습니다.',
  },
  {
    id: 7,
    assignmentId: 2,
    assignmentTitle: '비즈니스 계획서 작성',
    studentId: 6,
    studentName: '강민지',
    teamId: 2,
    teamName: '스타트업랩',
    programId: 2,
    programName: '하나유니브',
    submitDate: '2025-10-14',
    status: 'pending',
    coachId: 1,
    coachName: '박코치',
    submissionNote: `비즈니스 계획서 구성:

1. 사업 개요 (Executive Summary)
2. 시장 분석 및 고객 세분화
3. 제품/서비스 설명
4. 마케팅 및 판매 전략
5. 운영 계획
6. 재무 계획 (손익계산서, 현금흐름표)
7. 리스크 분석 및 대응 방안

주요 수익 모델:
- 구독 모델 (월 9,900원)
- 프리미엄 기능 추가 판매
- B2B 파트너십`,
    submissionUrl: 'https://docs.google.com/document/d/사업계획서-강민지',
  },
];

function AssignmentManagementPageContent() {
  const { toasts, success, error, hideToast } = useToast();
  const searchParams = useSearchParams();

  // Main tab state
  const [activeTab, setActiveTab] = useState<'kpi' | 'act'>('act');

  // Act (Assignment) state
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<number>(0);
  const [assignmentFilterStatus, setAssignmentFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);

  // KPI Submission state
  const [kpiSubmissions, setKpiSubmissions] = useState<KPISubmission[]>([]);
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [selectedKPIProgramId, setSelectedKPIProgramId] = useState<number>(0);
  const [kpiFilterStatus, setKpiFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [kpiTypeFilter, setKpiTypeFilter] = useState<'all' | 'required' | 'team'>('all');
  const [selectedKPISubmission, setSelectedKPISubmission] = useState<KPISubmission | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');

  // Submission modal filters (for team and search in assignment detail modal)
  const [submissionTeamFilter, setSubmissionTeamFilter] = useState<number>(0);
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');

  // KPI modal filters
  const [kpiTeamFilter, setKpiTeamFilter] = useState<string>('');
  const [kpiModalSearchTerm, setKpiModalSearchTerm] = useState('');
  const [kpiModalTab, setKpiModalTab] = useState<'required' | 'team'>('required');
  const [selectedTeamForTeamKPI, setSelectedTeamForTeamKPI] = useState<string>('');

  // Team KPI Goals and Details
  const [teamKPIGoals, setTeamKPIGoals] = useState<TeamKPIGoal[]>([]);
  const [teamKPIDetails, setTeamKPIDetails] = useState<TeamKPIDetail[]>([]);

  // Load data from localStorage
  useEffect(() => {
    // Load assignment submissions from storage
    const storedAssignments = getFromStorage<AssignmentSubmission>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
    if (storedAssignments.length > 0) {
      setAssignmentSubmissions(storedAssignments);
    } else {
      // Initialize with mock data if empty
      setAssignmentSubmissions(mockAssignmentSubmissions);
    }

    // Load KPI submissions from storage
    const storedKPIs = getFromStorage<KPISubmission>(STORAGE_KEYS.KPI_SUBMISSIONS);
    if (storedKPIs.length > 0) {
      setKpiSubmissions(storedKPIs);
    } else {
      // Initialize with mock data if empty
      setKpiSubmissions(mockKPISubmissions);
    }

    // Load Team KPI Goals and Details
    const goals = getFromStorage<TeamKPIGoal>(STORAGE_KEYS.TEAM_KPI_GOALS);
    setTeamKPIGoals(goals);

    const details = getFromStorage<TeamKPIDetail>(STORAGE_KEYS.TEAM_KPI_DETAILS);
    setTeamKPIDetails(details);
  }, []);

  // Handle query parameter for auto-opening submission detail
  useEffect(() => {
    const submissionId = searchParams.get('submissionId');
    const kpiSubmissionId = searchParams.get('kpiSubmissionId');

    if (submissionId) {
      const submissionIdNum = Number(submissionId);
      // Find the submission
      const submission = assignmentSubmissions.find((s) => s.id === submissionIdNum);
      if (submission) {
        // Find the assignment that contains this submission
        const assignment = assignments.find((a) => a.id === submission.assignmentId);
        if (assignment) {
          // Switch to act tab if not already active
          setActiveTab('act');
          // Open the assignment modal
          setSelectedAssignment(assignment);
        }
      }
    } else if (kpiSubmissionId) {
      const kpiIdNum = Number(kpiSubmissionId);
      // Find the KPI submission
      const kpiSubmission = kpiSubmissions.find((s) => s.id === kpiIdNum);
      if (kpiSubmission) {
        // Switch to KPI tab
        setActiveTab('kpi');
        // Open the KPI modal
        setSelectedKPISubmission(kpiSubmission);
      }
    }
  }, [searchParams, assignmentSubmissions, assignments, kpiSubmissions]);

  // Get unique programs from assignments
  const programs = Array.from(new Set(assignments.map((a) => ({ id: a.programId, name: a.programName }))))
    .filter((p, index, self) => self.findIndex((t) => t.id === p.id) === index);

  // Get unique programs from KPI submissions
  const kpiPrograms = Array.from(new Set(kpiSubmissions.map((s) => ({ id: s.programId, name: s.programName }))))
    .filter((p, index, self) => self.findIndex((t) => t.id === p.id) === index);

  // Get submissions for selected assignment
  const getSubmissionsForAssignment = (assignmentId: number) => {
    return assignmentSubmissions.filter((sub) => sub.assignmentId === assignmentId);
  };

  // Assignment filtering
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
      assignment.vodSetName.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
      assignment.sessionTitle.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
      assignment.programName.toLowerCase().includes(assignmentSearchTerm.toLowerCase());
    const matchesProgram = selectedProgramId === 0 || assignment.programId === selectedProgramId;

    // Status filtering based on submissions
    let matchesStatus = true;
    if (assignmentFilterStatus !== 'all') {
      const submissions = getSubmissionsForAssignment(assignment.id);
      if (assignmentFilterStatus === 'pending') {
        matchesStatus = submissions.some((s) => s.status === 'pending');
      } else if (assignmentFilterStatus === 'approved') {
        matchesStatus = submissions.some((s) => s.status === 'approved');
      } else if (assignmentFilterStatus === 'rejected') {
        matchesStatus = submissions.some((s) => s.status === 'rejected');
      }
    }

    return matchesSearch && matchesProgram && matchesStatus;
  });

  // KPI submissions filtering
  const filteredKPISubmissions = kpiSubmissions.filter((sub) => {
    const kpiDisplayName = sub.type === 'required' ? sub.kpiName : sub.teamKpiName;
    const matchesSearch =
      sub.studentName.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
      sub.teamName.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
      (kpiDisplayName && kpiDisplayName.toLowerCase().includes(kpiSearchTerm.toLowerCase()));
    const matchesProgram = selectedKPIProgramId === 0 || sub.programId === selectedKPIProgramId;
    const matchesStatus = kpiFilterStatus === 'all' || sub.status === kpiFilterStatus;
    const matchesType = kpiTypeFilter === 'all' || sub.type === kpiTypeFilter;
    return matchesSearch && matchesProgram && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: '대기',
      approved: '승인',
      rejected: '반려',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getKPITypeBadge = (type: 'required' | 'team') => {
    const styles = {
      required: 'bg-red-100 text-red-800',
      team: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      required: '필수 KPI',
      team: '팀 KPI',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  // KPI submission handlers
  const handleKPIApprove = (id: number) => {
    setKpiSubmissions(
      kpiSubmissions.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              status: 'approved' as const,
              feedback: newComment || '승인되었습니다.',
            }
          : sub
      )
    );
    setNewComment('');
    success('KPI가 승인되었습니다');
  };

  const handleKPIReject = (id: number) => {
    if (!newComment.trim()) {
      error('반려 사유를 입력해주세요');
      return;
    }
    setKpiSubmissions(
      kpiSubmissions.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              status: 'rejected' as const,
              feedback: newComment,
            }
          : sub
      )
    );
    setNewComment('');
    success('KPI가 반려되었습니다');
  };

  // Assignment submission handlers
  const handleSubmissionApprove = (submissionId: number) => {
    setAssignmentSubmissions(
      assignmentSubmissions.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: 'approved' as const,
              feedback: newComment || '과제가 승인되었습니다.',
            }
          : sub
      )
    );
    setNewComment('');
    success('과제가 승인되었습니다');
  };

  const handleSubmissionReject = (submissionId: number) => {
    if (!newComment.trim()) {
      error('반려 사유를 입력해주세요');
      return;
    }
    setAssignmentSubmissions(
      assignmentSubmissions.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: 'rejected' as const,
              feedback: newComment,
            }
          : sub
      )
    );
    setNewComment('');
    success('과제가 반려되었습니다');
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
    success('다운로드를 시작합니다');
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">과제 관리</h1>
        <p className="text-gray-600 mt-2">KPI 및 Act 제출물 관리</p>
      </div>

      {/* Main Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('act')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'act' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            과제
            {activeTab === 'act' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
          </button>
          <button
            onClick={() => setActiveTab('kpi')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'kpi' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            KPI
            {activeTab === 'kpi' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
          </button>
        </div>
      </div>

      {/* Act Tab */}
      {activeTab === 'act' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">전체</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{assignments.length}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">대기</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {assignments.filter((a) => {
                  const submissions = getSubmissionsForAssignment(a.id);
                  return submissions.some((s) => s.status === 'pending');
                }).length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">승인</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {assignments.filter((a) => {
                  const submissions = getSubmissionsForAssignment(a.id);
                  return submissions.some((s) => s.status === 'approved');
                }).length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">반려</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {assignments.filter((a) => {
                  const submissions = getSubmissionsForAssignment(a.id);
                  return submissions.some((s) => s.status === 'rejected');
                }).length}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Program Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">프로그램:</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>전체</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">상태:</label>
                <select
                  value={assignmentFilterStatus}
                  onChange={(e) => setAssignmentFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">전체</option>
                  <option value="pending">대기</option>
                  <option value="approved">승인</option>
                  <option value="rejected">반려</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="과제명, 프로그램, VOD 세트, 세션으로 검색..."
                  value={assignmentSearchTerm}
                  onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Assignment Submissions Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과제명 / 교육생
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    프로그램
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팀
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제출일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제출현황
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignmentSubmissions
                  .filter((sub) => {
                    const matchesSearch =
                      sub.assignmentTitle.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                      sub.studentName.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                      sub.teamName.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                      sub.programName.toLowerCase().includes(assignmentSearchTerm.toLowerCase());
                    const matchesProgram = selectedProgramId === 0 || sub.programId === selectedProgramId;
                    const matchesStatus = assignmentFilterStatus === 'all' || sub.status === assignmentFilterStatus;
                    return matchesSearch && matchesProgram && matchesStatus;
                  })
                  .map((sub) => {
                    const assignment = assignments.find((a) => a.id === sub.assignmentId);
                    return (
                      <tr
                        key={sub.id}
                        onClick={() => {
                          if (assignment) {
                            setSelectedAssignment(assignment);
                          }
                        }}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{sub.assignmentTitle}</div>
                          <div className="text-xs text-gray-500 mt-1">{sub.studentName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{sub.programName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{sub.teamName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            {sub.submitDate}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {assignmentSubmissions
              .filter((sub) => {
                const matchesSearch =
                  sub.assignmentTitle.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                  sub.studentName.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                  sub.teamName.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
                  sub.programName.toLowerCase().includes(assignmentSearchTerm.toLowerCase());
                const matchesProgram = selectedProgramId === 0 || sub.programId === selectedProgramId;
                const matchesStatus = assignmentFilterStatus === 'all' || sub.status === assignmentFilterStatus;
                return matchesSearch && matchesProgram && matchesStatus;
              }).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* KPI Tab */}
      {activeTab === 'kpi' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">전체</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{kpiSubmissions.length}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">대기</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {kpiSubmissions.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">승인</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {kpiSubmissions.filter((s) => s.status === 'approved').length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">반려</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {kpiSubmissions.filter((s) => s.status === 'rejected').length}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Program Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">프로그램:</label>
                <select
                  value={selectedKPIProgramId}
                  onChange={(e) => setSelectedKPIProgramId(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>전체</option>
                  {kpiPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">상태:</label>
                <select
                  value={kpiFilterStatus}
                  onChange={(e) => setKpiFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">전체</option>
                  <option value="pending">대기</option>
                  <option value="approved">승인</option>
                  <option value="rejected">반려</option>
                </select>
              </div>

              {/* KPI Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">KPI 유형:</label>
                <select
                  value={kpiTypeFilter}
                  onChange={(e) => setKpiTypeFilter(e.target.value as 'all' | 'required' | 'team')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">전체</option>
                  <option value="required">필수 KPI</option>
                  <option value="team">팀 KPI</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="교육생 이름, 팀명 또는 KPI명으로 검색..."
                  value={kpiSearchTerm}
                  onChange={(e) => setKpiSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* KPI Submissions Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI명 / 교육생
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    프로그램
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팀
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제출일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제출현황
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKPISubmissions.map((sub) => {
                  const kpiDisplayName = sub.type === 'required' ? sub.kpiName : sub.teamKpiName;
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedKPISubmission(sub)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{kpiDisplayName}</div>
                          {getKPITypeBadge(sub.type)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{sub.studentName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{sub.programName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{sub.teamName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          {sub.submitDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredKPISubmissions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Assignment Detail Modal with Submissions */}
      {selectedAssignment && (() => {
        const allSubmissions = getSubmissionsForAssignment(selectedAssignment.id);

        // Filter submissions by team and search
        const filteredSubmissions = allSubmissions.filter((sub) => {
          const matchesTeam = submissionTeamFilter === 0 || sub.teamId === submissionTeamFilter;
          const matchesSearch =
            submissionSearchTerm === '' ||
            sub.studentName.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
            sub.teamName.toLowerCase().includes(submissionSearchTerm.toLowerCase());
          return matchesTeam && matchesSearch;
        });

        // Get unique teams from submissions
        const teams = Array.from(new Set(filteredSubmissions.map((s) => ({ id: s.teamId, name: s.teamName }))))
          .filter((t, index, self) => self.findIndex((team) => team.id === t.id) === index)
          .sort((a, b) => a.name.localeCompare(b.name));

        // Group submissions by team
        const submissionsByTeam = teams.map((team) => ({
          team,
          submissions: filteredSubmissions.filter((s) => s.teamId === team.id),
        }));

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">과제 상세 및 제출물 관리</h3>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setNewComment('');
                    setSubmissionTeamFilter(0);
                    setSubmissionSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Assignment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">과제 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">과제명</label>
                    <p className="text-gray-900">{selectedAssignment.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">프로그램</label>
                    <p className="text-gray-900">{selectedAssignment.programName}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedAssignment.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VOD 세트</label>
                    <p className="text-gray-900">{selectedAssignment.vodSetName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">세션</label>
                    <p className="text-gray-900">{selectedAssignment.sessionTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                    <p className="text-gray-900">{selectedAssignment.dueDate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Submission Filters */}
              {allSubmissions.length > 0 && (
                <div className="bg-white border rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Team Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">팀:</label>
                      <select
                        value={submissionTeamFilter}
                        onChange={(e) => setSubmissionTeamFilter(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={0}>전체</option>
                        {Array.from(new Set(allSubmissions.map((s) => ({ id: s.teamId, name: s.teamName }))))
                          .filter((t, index, self) => self.findIndex((team) => team.id === t.id) === index)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="교육생 이름 또는 팀명으로 검색..."
                        value={submissionSearchTerm}
                        onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submissions List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  제출물 목록 ({filteredSubmissions.length}건 / 전체 {allSubmissions.length}건)
                </h4>

                {allSubmissions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">아직 제출된 과제가 없습니다.</p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group by Team */}
                    {submissionsByTeam.map(({ team, submissions }) => (
                      <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                        {/* Team Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <h5 className="text-lg font-semibold text-gray-900">{team.name}</h5>
                          <span className="text-sm text-gray-600">{submissions.length}명</span>
                        </div>

                        {/* Submissions in this team */}
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-900">{submission.studentName}</h5>
                            {getStatusBadge(submission.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {submission.teamName} · {submission.programName}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">제출일: {submission.submitDate}</p>
                        </div>
                        {submission.submissionUrl && (
                          <button
                            onClick={() => handleDownload(submission.submissionUrl!)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            다운로드
                          </button>
                        )}
                      </div>

                      {submission.submissionNote && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">제출 노트:</span> {submission.submissionNote}
                          </p>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="bg-blue-50 rounded p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-blue-900">코치 피드백:</span>
                          </div>
                          <p className="text-sm text-blue-800">{submission.feedback}</p>
                        </div>
                      )}

                      {submission.status === 'pending' && (
                        <div className="border-t pt-3 mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            코멘트 {submission.status === 'pending' && '(반려 시 필수)'}
                          </label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                            placeholder="코멘트를 입력하세요..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmissionApprove(submission.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                              승인
                            </button>
                            <button
                              onClick={() => handleSubmissionReject(submission.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircleIcon className="w-5 h-5" />
                              반려
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setNewComment('');
                    setSubmissionTeamFilter(0);
                    setSubmissionSearchTerm('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* KPI Submissions Modal - Separated by Type */}
      {selectedKPISubmission && (() => {
        // Get all KPI submissions for the same program
        const allKPISubmissions = kpiSubmissions.filter(
          (sub) => sub.programName === selectedKPISubmission.programName
        );

        // Separate by type
        const requiredKPIs = allKPISubmissions.filter((sub) => sub.type === 'required');
        const teamKPIs = allKPISubmissions.filter((sub) => sub.type === 'team');

        // Filter required KPIs by search
        const filteredRequiredKPIs = requiredKPIs.filter((sub) => {
          const matchesSearch =
            kpiModalSearchTerm === '' ||
            sub.studentName.toLowerCase().includes(kpiModalSearchTerm.toLowerCase()) ||
            (sub.kpiName && sub.kpiName.toLowerCase().includes(kpiModalSearchTerm.toLowerCase()));
          return matchesSearch;
        });

        // Get unique teams for team KPI tab
        const uniqueTeams = Array.from(new Set(teamKPIs.map((s) => s.teamName))).sort();

        // Filter team KPIs by selected team and search
        const filteredTeamKPIs = teamKPIs.filter((sub) => {
          const matchesTeam = selectedTeamForTeamKPI === '' || sub.teamName === selectedTeamForTeamKPI;
          const matchesSearch =
            kpiModalSearchTerm === '' ||
            sub.studentName.toLowerCase().includes(kpiModalSearchTerm.toLowerCase()) ||
            (sub.teamKpiName && sub.teamKpiName.toLowerCase().includes(kpiModalSearchTerm.toLowerCase()));
          return matchesTeam && matchesSearch;
        });

        // Get team goals for selected team
        const selectedTeamGoals = selectedTeamForTeamKPI
          ? teamKPIGoals.filter((goal) => goal.teamName === selectedTeamForTeamKPI)
          : [];

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  KPI 제출물 관리
                </h3>
                <button
                  onClick={() => {
                    setSelectedKPISubmission(null);
                    setNewComment('');
                    setKpiModalTab('required');
                    setSelectedTeamForTeamKPI('');
                    setKpiModalSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                  <button
                    onClick={() => {
                      setKpiModalTab('required');
                      setKpiModalSearchTerm('');
                    }}
                    className={`pb-4 px-2 font-medium transition-colors relative ${
                      kpiModalTab === 'required' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    필수 KPI
                    {kpiModalTab === 'required' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setKpiModalTab('team');
                      setKpiModalSearchTerm('');
                    }}
                    className={`pb-4 px-2 font-medium transition-colors relative ${
                      kpiModalTab === 'team' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    팀 KPI
                    {kpiModalTab === 'team' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
                  </button>
                </div>
              </div>

              {/* Filters */}
              {kpiModalTab === 'required' && requiredKPIs.length > 0 && (
                <div className="bg-white border rounded-lg p-4 mb-6">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="교육생 이름 또는 KPI명으로 검색..."
                      value={kpiModalSearchTerm}
                      onChange={(e) => setKpiModalSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {kpiModalTab === 'team' && teamKPIs.length > 0 && (
                <div className="bg-white border rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Team Selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">팀 선택:</label>
                      <select
                        value={selectedTeamForTeamKPI}
                        onChange={(e) => setSelectedTeamForTeamKPI(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">선택하세요</option>
                        {uniqueTeams.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="교육생 이름 또는 KPI명으로 검색..."
                        value={kpiModalSearchTerm}
                        onChange={(e) => setKpiModalSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content - Required KPI Tab */}
              {kpiModalTab === 'required' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    필수 KPI 제출물 ({filteredRequiredKPIs.length}건 / 전체 {requiredKPIs.length}건)
                  </h4>

                  {requiredKPIs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">제출된 필수 KPI가 없습니다.</p>
                    </div>
                  ) : filteredRequiredKPIs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">검색 결과가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRequiredKPIs.map((submission) => (
                        <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-semibold text-gray-900">{submission.studentName}</h5>
                                {getStatusBadge(submission.status)}
                              </div>
                              <p className="text-sm font-medium text-gray-700 mb-1">KPI: {submission.kpiName}</p>
                              <p className="text-sm text-gray-600">
                                {submission.teamName} · {submission.coachName}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">제출일: {submission.submitDate}</p>
                            </div>
                          </div>

                          {/* Value Submission */}
                          <div className="bg-green-50 rounded p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-900 mb-1">제출 값</p>
                                <p className="text-lg font-semibold text-green-900">
                                  {submission.actualValue} {submission.unit}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-green-700">목표: {submission.targetValue} {submission.unit}</p>
                                <p className="text-sm text-green-700">
                                  달성률: {((submission.actualValue / submission.targetValue) * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Feedback */}
                          {submission.feedback && (
                            <div className="bg-blue-50 rounded p-3 mb-3">
                              <p className="text-sm font-medium text-blue-900 mb-1">코치 피드백</p>
                              <p className="text-sm text-blue-800">{submission.feedback}</p>
                            </div>
                          )}

                          {/* Approval Actions */}
                          {submission.status === 'pending' && (
                            <div className="border-t pt-3 mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                코멘트 (반려 시 필수)
                              </label>
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                                placeholder="코멘트를 입력하세요..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleKPIApprove(submission.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                  승인
                                </button>
                                <button
                                  onClick={() => handleKPIReject(submission.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                  반려
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content - Team KPI Tab */}
              {kpiModalTab === 'team' && (
                <div>
                  {teamKPIs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">제출된 팀 KPI가 없습니다.</p>
                    </div>
                  ) : !selectedTeamForTeamKPI ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-2">팀을 선택해주세요</p>
                      <p className="text-xs text-gray-400">팀을 선택하면 KPI 목표와 팀원들의 제출물을 볼 수 있습니다</p>
                    </div>
                  ) : (
                    <div>
                      {/* Team KPI Goals Section */}
                      {selectedTeamGoals.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            {selectedTeamForTeamKPI}의 KPI 목표
                          </h4>
                          <div className="space-y-3">
                            {selectedTeamGoals.map((goal) => {
                              const goalDetails = teamKPIDetails.filter((d) => d.teamGoalId === goal.id);
                              return (
                                <div key={goal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="text-base font-semibold text-gray-900">{goal.goalName}</h5>
                                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        기간: {goal.startDate} ~ {goal.endDate}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                      goal.status === 'active' ? 'bg-green-100 text-green-800' :
                                      goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {goal.status === 'active' ? '진행중' : goal.status === 'completed' ? '완료' : '취소'}
                                    </span>
                                  </div>

                                  {/* Goal Details (Sub-KPIs) */}
                                  {goalDetails.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-300">
                                      <p className="text-sm font-medium text-gray-700 mb-2">세부 KPI ({goalDetails.length}개)</p>
                                      <div className="space-y-2">
                                        {goalDetails.map((detail) => (
                                          <div key={detail.id} className="bg-white rounded p-3 border border-gray-200">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-sm text-gray-900 font-medium">{detail.name}</span>
                                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                detail.status === 'not_started' ? 'bg-gray-100 text-gray-800' :
                                                detail.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                              }`}>
                                                {detail.status === 'not_started' ? '시작 전' : detail.status === 'in_progress' ? '진행중' : '완료'}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">{detail.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                              <span>담당: {detail.assignedStudents?.map(s => s.studentName).join(', ') || '미배정'}</span>
                                              <span className="font-medium">{detail.totalCurrentValue} / {detail.targetValue} {detail.unit} ({detail.totalProgress}%)</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Team Member KPI Submissions */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          팀원 KPI 제출물 ({filteredTeamKPIs.length}건 / 전체 {teamKPIs.filter(s => s.teamName === selectedTeamForTeamKPI).length}건)
                        </h4>

                        {filteredTeamKPIs.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredTeamKPIs.map((submission) => (
                              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-semibold text-gray-900">{submission.studentName}</h5>
                                      {getStatusBadge(submission.status)}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">KPI: {submission.teamKpiName}</p>
                                    <p className="text-sm text-gray-600">
                                      {submission.teamName} · {submission.coachName}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">제출일: {submission.submitDate}</p>
                                  </div>
                                </div>

                                {/* Value Submission */}
                                <div className="bg-blue-50 rounded p-3 mb-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-blue-900 mb-1">제출 값</p>
                                      <p className="text-lg font-semibold text-blue-900">
                                        {submission.actualValue} {submission.unit}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-blue-700">목표: {submission.targetValue} {submission.unit}</p>
                                      <p className="text-sm text-blue-700">
                                        달성률: {((submission.actualValue / submission.targetValue) * 100).toFixed(0)}%
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Feedback */}
                                {submission.feedback && (
                                  <div className="bg-green-50 rounded p-3 mb-3">
                                    <p className="text-sm font-medium text-green-900 mb-1">코치 피드백</p>
                                    <p className="text-sm text-green-800">{submission.feedback}</p>
                                  </div>
                                )}

                                {/* Approval Actions */}
                                {submission.status === 'pending' && (
                                  <div className="border-t pt-3 mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      코멘트 (반려 시 필수)
                                    </label>
                                    <textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                                      placeholder="코멘트를 입력하세요..."
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleKPIApprove(submission.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        승인
                                      </button>
                                      <button
                                        onClick={() => handleKPIReject(submission.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                      >
                                        <XCircleIcon className="w-5 h-5" />
                                        반려
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setSelectedKPISubmission(null);
                    setNewComment('');
                    setKpiTeamFilter('');
                    setKpiModalSearchTerm('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📝 과제 관리 워크플로우"
        description="과제 제출 현황을 확인하고 피드백을 제공하는 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '과제 목록 확인',
            description: 'VOD 세트 및 세션별로 등록된 과제 목록을 확인합니다. 필터를 사용하여 특정 프로그램이나 상태의 과제만 볼 수 있습니다.',
          },
          {
            step: 2,
            title: '제출 현황 모니터링',
            description: '각 과제의 제출률, 미제출 인원, 평가 완료 현황을 실시간으로 확인합니다.',
          },
          {
            step: 3,
            title: '제출물 검토 및 피드백',
            description: '학생이 제출한 과제를 검토하고, 합격/불합격 판정과 함께 상세한 피드백을 작성합니다.',
          },
          {
            step: 4,
            title: '재제출 관리',
            description: '불합격 처리된 과제는 재제출을 요청하고, 재제출된 과제를 다시 검토합니다.',
          },
          {
            step: 5,
            title: '통계 및 리포트',
            description: '과제별, 학생별 제출률과 평가 결과를 분석하여 학습 진도를 파악합니다.',
          },
        ]}
        keyFeatures={[
          'VOD 세트 및 세션별 과제 조회',
          '제출 현황 실시간 모니터링',
          '과제 제출물 다운로드',
          '합격/불합격 평가 및 피드백 작성',
          '재제출 요청 및 관리',
          '제출률 및 평가 통계',
          '마감일 기준 지연 제출 확인',
          '학생별 과제 제출 이력 조회',
        ]}
        tips={[
          '마감일이 임박한 과제는 별도로 필터링하여 미제출 학생에게 알림을 보낼 수 있습니다.',
          '피드백은 구체적으로 작성하면 학생의 학습 개선에 큰 도움이 됩니다.',
          '재제출 과제는 이전 피드백을 참고하여 개선 여부를 중점적으로 확인하세요.',
          '과제 제출률이 낮은 경우, 과제 난이도나 마감일 설정을 재검토해보세요.',
        ]}
      />
    </div>
  );
}

export default function AssignmentManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <AssignmentManagementPageContent />
    </Suspense>
  );
}
