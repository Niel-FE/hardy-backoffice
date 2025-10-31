'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  ClockIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate, formatDateTime } from '@/lib/storage';
import { VODSet, Session } from '@/types/vod';
import { StudentProgress, ProgramVODSet, VODViewingHistory } from '@/types/progress';
import WorkflowGuide from '@/components/WorkflowGuide';
import { AssignmentSubmission } from '@/types/assignment';
import { KPISubmission } from '@/types/kpi';

interface ProgramHistory {
  programName: string;
  enrollDate: string;
  endDate: string;
  status: 'completed' | 'dropped';
  finalVodProgress: number;
  finalAttendanceRate: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  program: string;
  programId: number;
  programHistory?: ProgramHistory[];
  team: string;
  coach: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  enrollDate: string;
  programEndDate: string;
  vodProgress: number;
  attendanceRate: number;
}

// Mock students data
const mockStudents: Student[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim.cs@example.com',
    phone: '010-1234-5678',
    program: 'YEEEYEP 인도네시아',
    programId: 1,
    team: '이노베이터스',
    coach: '박코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 75,
    attendanceRate: 95,
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee.yh@example.com',
    phone: '010-2345-6789',
    program: '하나유니브',
    programId: 2,
    programHistory: [
      {
        programName: 'YEEEYEP 인도네시아',
        enrollDate: '2025-03-01',
        endDate: '2025-06-01',
        status: 'completed',
        finalVodProgress: 100,
        finalAttendanceRate: 98,
      },
    ],
    team: '스타트업랩',
    coach: '김코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 88,
    attendanceRate: 98,
  },
  {
    id: 3,
    name: '박민수',
    email: 'park.ms@example.com',
    phone: '010-3456-7890',
    program: 'SuTEAM',
    programId: 3,
    team: '벤처스',
    coach: '박코치',
    status: 'active',
    enrollDate: '2025-09-01',
    programEndDate: '2025-12-31',
    vodProgress: 65,
    attendanceRate: 85,
  },
];

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [vodSets, setVodSets] = useState<VODSet[]>([]);
  const [viewingHistory, setViewingHistory] = useState<VODViewingHistory[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [kpiSubmissions, setKPISubmissions] = useState<KPISubmission[]>([]);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  // Load student data
  useEffect(() => {
    const id = Number(params.id);
    const found = mockStudents.find((s) => s.id === id);
    if (found) {
      setStudent(found);
    } else {
      error('학생을 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/students/list');
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Load student's assigned VOD sets and progress
  useEffect(() => {
    if (!student) return;

    // Get VOD sets assigned to student's program
    const programVODSets = getFromStorage<ProgramVODSet>(STORAGE_KEYS.PROGRAM_VOD_SETS);
    const assignedToProgram = programVODSets.filter(
      (pv) => pv.programId === student.programId && pv.status === 'active'
    );

    // Get actual VOD sets
    const allVODSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    const studentVODSets = allVODSets.filter((vs) =>
      assignedToProgram.some((a) => a.vodSetId === vs.id)
    );
    setVodSets(studentVODSets);

    // Load or initialize progress
    const progress = getFromStorage<StudentProgress>(STORAGE_KEYS.STUDENT_PROGRESS);
    let studentProgressData = progress.filter((p) => p.studentId === student.id);

    // Initialize progress for sessions that don't have progress yet
    studentVODSets.forEach((vodSet) => {
      vodSet.sessions.forEach((session) => {
        const hasProgress = studentProgressData.some(
          (p) => p.sessionId === session.id && p.vodSetId === vodSet.id
        );
        if (!hasProgress) {
          const newProgress: StudentProgress = {
            id: generateId(),
            studentId: student.id,
            studentName: student.name,
            programId: student.programId,
            programName: student.program,
            vodSetId: vodSet.id,
            vodSetName: vodSet.name,
            sessionId: session.id,
            sessionName: session.name,
            status: 'not_started',
            progressPercentage: 0,
            updatedAt: formatDate(),
          };
          studentProgressData.push(newProgress);
        }
      });
    });

    // Save initialized progress
    const allProgress = progress.filter((p) => p.studentId !== student.id);
    saveToStorage(STORAGE_KEYS.STUDENT_PROGRESS, [...allProgress, ...studentProgressData]);
    setStudentProgress(studentProgressData);

    // Load viewing history
    const history = getFromStorage<VODViewingHistory>(STORAGE_KEYS.VOD_VIEWING_HISTORY);
    let studentHistory = history.filter((h) => h.studentId === student.id);

    // Initialize mock viewing history if none exists
    if (studentHistory.length === 0 && studentVODSets.length > 0) {
      const mockHistory: VODViewingHistory[] = [];

      // Create viewing history for the first VOD set and some of its sessions
      const firstVodSet = studentVODSets[0];
      if (firstVodSet) {
        // For the first 3 sessions, create some realistic viewing data
        firstVodSet.sessions.slice(0, 3).forEach((session, sessionIndex) => {
          session.contents.vods?.slice(0, 2).forEach((vod, vodIndex) => {
            const totalDuration = 2700; // 45 minutes in seconds

            // First session: mostly complete
            // Second session: in progress
            // Third session: just started
            let watchedDuration: number;
            if (sessionIndex === 0) {
              watchedDuration = Math.floor(totalDuration * (0.85 + Math.random() * 0.15)); // 85-100%
            } else if (sessionIndex === 1) {
              watchedDuration = Math.floor(totalDuration * (0.4 + Math.random() * 0.3)); // 40-70%
            } else {
              watchedDuration = Math.floor(totalDuration * (0.1 + Math.random() * 0.2)); // 10-30%
            }

            const completed = watchedDuration >= totalDuration * 0.9;

            const historyItem: VODViewingHistory = {
              id: generateId(),
              studentId: student.id,
              studentName: student.name,
              programId: student.programId,
              vodSetId: firstVodSet.id,
              sessionId: session.id,
              vodUrl: vod.url,
              vodDescription: vod.description || `${session.name} - VOD ${vodIndex + 1}`,
              watchedDuration,
              totalDuration,
              progressPercentage: Math.round((watchedDuration / totalDuration) * 100),
              completed,
              firstWatchedAt: formatDateTime(new Date(Date.now() - (7 - sessionIndex * 2) * 24 * 60 * 60 * 1000)),
              lastWatchedAt: formatDateTime(new Date(Date.now() - (1 + sessionIndex) * 24 * 60 * 60 * 1000)),
              watchCount: sessionIndex === 0 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1,
            };
            mockHistory.push(historyItem);
          });
        });
      }

      saveToStorage(STORAGE_KEYS.VOD_VIEWING_HISTORY, [...history, ...mockHistory]);
      studentHistory = mockHistory;
    }

    setViewingHistory(studentHistory);

    // Load assignment submissions from storage
    const allAssignments = getFromStorage<AssignmentSubmission>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
    let studentAssignments = allAssignments.filter((a) => a.studentId === student.id);

    // Initialize mock assignments if none exists
    if (studentAssignments.length === 0) {
      const mockAssignments: AssignmentSubmission[] = [
        {
          id: generateId(),
          assignmentId: 1,
          assignmentTitle: '비즈니스 모델 캔버스 작성',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          submitDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
          status: 'approved',
          coachId: 1,
          coachName: student.coach,
          rating: 5,
          feedback: '핵심 가치 제안이 명확합니다. 고객 세그먼트 분석이 우수합니다.',
          submissionUrl: 'https://docs.google.com/presentation/d/business-model-canvas',
          submissionNote: '목표 고객 인터뷰 10건 완료 후 작성했습니다.',
        },
        {
          id: generateId(),
          assignmentId: 2,
          assignmentTitle: '시장 조사 보고서',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          submitDate: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
          status: 'pending',
          coachId: 1,
          coachName: student.coach,
          submissionUrl: 'https://docs.google.com/document/d/market-research',
          submissionNote: '경쟁사 분석 및 시장 규모 추정 완료했습니다.',
        },
        {
          id: generateId(),
          assignmentId: 3,
          assignmentTitle: '사업계획서 초안',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          submitDate: formatDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
          status: 'approved',
          coachId: 1,
          coachName: student.coach,
          rating: 4,
          feedback: '재무 계획이 탄탄합니다. 마케팅 전략을 더 구체화하면 좋겠습니다.',
          submissionUrl: 'https://docs.google.com/document/d/business-plan',
        },
      ];

      // Save to storage
      saveToStorage(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, [...allAssignments, ...mockAssignments]);
      studentAssignments = mockAssignments;
    }
    setAssignmentSubmissions(studentAssignments);

    // Load KPI submissions from storage
    const allKPIs = getFromStorage<KPISubmission>(STORAGE_KEYS.KPI_SUBMISSIONS);
    let studentKPIs = allKPIs.filter((k) => k.studentId === student.id);

    // Initialize mock KPIs if none exists
    if (studentKPIs.length === 0) {
      const mockKPIs: KPISubmission[] = [
        {
          id: generateId(),
          type: 'required',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          week: 3,
          programKpiId: 1,
          kpiTemplateId: 1,
          kpiName: '멘토링 참여 시간',
          submitDate: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
          status: 'approved',
          coachId: 1,
          coachName: student.coach,
          feedback: '목표를 초과 달성했습니다!',
          actualValue: 12,
          targetValue: 10,
          unit: '시간',
        },
        {
          id: generateId(),
          type: 'team',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          week: 3,
          teamKpiDetailId: 1,
          teamGoalId: 1,
          teamKpiName: '고객 인터뷰 건수',
          submitDate: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
          status: 'approved',
          coachId: 1,
          coachName: student.coach,
          actualValue: 15,
          targetValue: 10,
          unit: '건',
        },
        {
          id: generateId(),
          type: 'required',
          studentId: student.id,
          studentName: student.name,
          teamId: 1,
          teamName: student.team,
          programId: student.programId,
          programName: student.program,
          week: 2,
          programKpiId: 2,
          kpiTemplateId: 2,
          kpiName: '마일스톤 달성률',
          submitDate: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          status: 'approved',
          coachId: 1,
          coachName: student.coach,
          actualValue: 95,
          targetValue: 90,
          unit: '%',
        },
      ];

      // Save to storage
      saveToStorage(STORAGE_KEYS.KPI_SUBMISSIONS, [...allKPIs, ...mockKPIs]);
      studentKPIs = mockKPIs;
    }
    setKPISubmissions(studentKPIs);
  }, [student]);

  // Update session progress status
  const handleUpdateProgress = (progressId: number, newStatus: StudentProgress['status']) => {
    const updatedProgress = studentProgress.map((p) => {
      if (p.id === progressId) {
        const updated: StudentProgress = {
          ...p,
          status: newStatus,
          progressPercentage: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0,
          startedAt: newStatus !== 'not_started' && !p.startedAt ? formatDate() : p.startedAt,
          completedAt: newStatus === 'completed' ? formatDate() : undefined,
          lastAccessedAt: formatDate(),
          updatedAt: formatDate(),
        };
        return updated;
      }
      return p;
    });

    // Save to storage
    const allProgress = getFromStorage<StudentProgress>(STORAGE_KEYS.STUDENT_PROGRESS);
    const otherProgress = allProgress.filter((p) => p.studentId !== student?.id);
    saveToStorage(STORAGE_KEYS.STUDENT_PROGRESS, [...otherProgress, ...updatedProgress]);

    setStudentProgress(updatedProgress);
    success('진도 상태가 업데이트되었습니다');
  };

  // Enter edit mode
  const handleEditClick = () => {
    if (student) {
      setEditedStudent({ ...student });
      setIsEditMode(true);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditedStudent(null);
    setIsEditMode(false);
  };

  // Save edited student
  const handleSaveEdit = () => {
    if (!editedStudent) return;

    // Validation
    if (!editedStudent.name?.trim()) {
      error('이름을 입력해주세요');
      return;
    }
    if (!editedStudent.email?.trim()) {
      error('이메일을 입력해주세요');
      return;
    }
    if (!editedStudent.phone?.trim()) {
      error('전화번호를 입력해주세요');
      return;
    }

    // Update student
    setStudent(editedStudent);
    setIsEditMode(false);
    success('교육생 정보가 수정되었습니다');

    // In real app, this would save to backend/storage
    // For now, just update local state
  };

  // Update edited student field
  const updateEditedField = (field: keyof Student, value: any) => {
    if (editedStudent) {
      setEditedStudent({ ...editedStudent, [field]: value });
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // Calculate overall progress
  const totalSessions = studentProgress.length;
  const completedSessions = studentProgress.filter((p) => p.status === 'completed').length;
  const inProgressSessions = studentProgress.filter((p) => p.status === 'in_progress').length;
  const overallProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800',
    };
    const labels = {
      active: '활동 중',
      inactive: '비활성',
      completed: '수료',
      dropped: '중도 탈락',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getProgressStatusIcon = (status: StudentProgress['status']) => {
    if (status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (status === 'in_progress') {
      return <PlayCircleIcon className="w-5 h-5 text-blue-600" />;
    } else {
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressStatusLabel = (status: StudentProgress['status']) => {
    const labels = {
      not_started: '미시작',
      in_progress: '진행중',
      completed: '완료',
    };
    return labels[status];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/students/list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600 mt-1">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(student.status)}
            {!isEditMode ? (
              <button
                onClick={handleEditClick}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                수정하기
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckIcon className="w-5 h-5" />
                  저장
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">기본 정보</h3>
        {!isEditMode ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500">전화번호</p>
              <p className="text-sm font-medium text-gray-900">{student.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">프로그램</p>
              <p className="text-sm font-medium text-gray-900">{student.program}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">팀</p>
              <p className="text-sm font-medium text-gray-900">{student.team}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">담당 코치</p>
              <p className="text-sm font-medium text-gray-900">{student.coach}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">등록일</p>
              <p className="text-sm font-medium text-gray-900">{student.enrollDate}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedStudent?.name || ''}
                onChange={(e) => updateEditedField('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editedStudent?.email || ''}
                onChange={(e) => updateEditedField('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={editedStudent?.phone || ''}
                onChange={(e) => updateEditedField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로그램</label>
              <input
                type="text"
                value={editedStudent?.program || ''}
                onChange={(e) => updateEditedField('program', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">팀</label>
              <input
                type="text"
                value={editedStudent?.team || ''}
                onChange={(e) => updateEditedField('team', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">담당 코치</label>
              <input
                type="text"
                value={editedStudent?.coach || ''}
                onChange={(e) => updateEditedField('coach', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">등록일</label>
              <input
                type="date"
                value={editedStudent?.enrollDate || ''}
                onChange={(e) => updateEditedField('enrollDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 종료일</label>
              <input
                type="date"
                value={editedStudent?.programEndDate || ''}
                onChange={(e) => updateEditedField('programEndDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={editedStudent?.status || 'active'}
                onChange={(e) => updateEditedField('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">활동 중</option>
                <option value="inactive">비활성</option>
                <option value="completed">수료</option>
                <option value="dropped">중도 탈락</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Current Program Info */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <AcademicCapIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">현재 프로그램 정보</h2>
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">진행 중인 프로그램</p>
            <p className="text-lg font-bold text-gray-900">{student.program}</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-xs text-gray-600">시작일: {student.enrollDate}</p>
              <p className="text-xs text-gray-600">종료일: {student.programEndDate}</p>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium mb-1">과제 제출</p>
            <p className="text-lg font-bold text-gray-900">
              {assignmentSubmissions.filter(a => a.status === 'approved').length} / {assignmentSubmissions.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">승인된 과제 / 전체 제출</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium mb-1">KPI 제출</p>
            <p className="text-lg font-bold text-gray-900">
              {kpiSubmissions.filter(k => k.status === 'approved').length} / {kpiSubmissions.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">승인된 KPI / 전체 제출</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-xs text-primary-600 font-medium mb-2">VOD 진도율</p>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-2xl font-bold text-primary-600">{student.vodProgress}%</p>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${student.vodProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              전체 {viewingHistory.length}개 VOD 중 {viewingHistory.filter(h => h.completed).length}개 완료
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium mb-2">출석률</p>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-2xl font-bold text-gray-900">{student.attendanceRate}%</p>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600">현재 프로그램 기준</p>
          </div>
        </div>

        {/* Recent Viewing History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">최근 시청 이력</h3>
          {viewingHistory.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">시청 이력이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewingHistory
                .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
                .slice(0, 5)
                .map((history) => {
                  const vodSet = vodSets.find((vs) => vs.id === history.vodSetId);
                  const session = vodSet?.sessions.find((s) => s.id === history.sessionId);

                  return (
                    <div key={history.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {history.completed ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <PlayCircleIcon className="w-5 h-5 text-blue-600" />
                            )}
                            <h4 className="font-semibold text-gray-900">{history.vodDescription}</h4>
                          </div>
                          <div className="text-sm text-gray-600 space-y-0.5">
                            <p>VOD 세트: {vodSet?.name || 'Unknown'}</p>
                            <p>세션: {session?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        {history.completed ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            완료
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {history.progressPercentage}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              history.completed ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${history.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">시청 시간</p>
                          <p className="font-medium">
                            {formatDuration(history.watchedDuration)} / {formatDuration(history.totalDuration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">마지막 시청</p>
                          <p className="font-medium">{history.lastWatchedAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">시청 횟수</p>
                          <p className="font-medium">{history.watchCount}회</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {viewingHistory.length > 5 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              최근 5개 시청 이력만 표시됩니다 (전체 {viewingHistory.length}개)
            </p>
          )}
        </div>
      </div>

      {/* Assignment Submissions */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 과제 제출</h2>
        {assignmentSubmissions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">제출한 과제가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignmentSubmissions.slice(0, 3).map((submission) => (
              <div key={submission.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{submission.assignmentTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">제출일: {submission.submitDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.status === 'approved' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        승인됨
                      </span>
                    )}
                    {submission.status === 'pending' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        검토 중
                      </span>
                    )}
                    {submission.status === 'rejected' && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        반려됨
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    코치: {submission.coachName}
                  </p>
                  <button
                    onClick={() => router.push(`/education/assignment?submissionId=${submission.id}`)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    상세보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {assignmentSubmissions.length > 3 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            최근 3개 과제 제출만 표시됩니다 (전체 {assignmentSubmissions.length}개)
          </p>
        )}
      </div>

      {/* KPI Submissions */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 KPI 활동</h2>
        {kpiSubmissions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">KPI 활동 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kpiSubmissions.slice(0, 3).map((kpi) => (
              <div key={kpi.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {kpi.type === 'required' ? kpi.kpiName : kpi.teamKpiName}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        kpi.type === 'required'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {kpi.type === 'required' ? '필수 KPI' : '팀 KPI'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {kpi.week}주차 • 제출일: {kpi.submitDate}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    kpi.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : kpi.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {kpi.status === 'approved' ? '승인됨' : kpi.status === 'pending' ? '검토 중' : '반려됨'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      목표: <span className="font-medium text-gray-900">{kpi.targetValue} {kpi.unit}</span>
                    </span>
                    <span className="text-gray-500">
                      달성: <span className={`font-medium ${kpi.actualValue >= kpi.targetValue ? 'text-green-600' : 'text-orange-600'}`}>
                        {kpi.actualValue} {kpi.unit}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/education/assignment?kpiSubmissionId=${kpi.id}`)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    상세보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {kpiSubmissions.length > 3 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            최근 3개 KPI 활동만 표시됩니다 (전체 {kpiSubmissions.length}개)
          </p>
        )}
      </div>

      {/* Program History */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">프로그램 이력</h2>
        </div>

        <div className="space-y-3">
          {/* Current Program */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{student.program}</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                진행 중
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">시작일</p>
                <p className="font-medium text-gray-900">{student.enrollDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">종료 예정일</p>
                <p className="font-medium text-gray-900">{student.programEndDate}</p>
              </div>
            </div>
          </div>

          {/* Past Programs */}
          {student.programHistory && student.programHistory.length > 0 && (
            <>
              {student.programHistory.map((history, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{history.programName}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        history.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {history.status === 'completed' ? '수료' : '중도 탈락'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">시작일</p>
                      <p className="font-medium text-gray-900">{history.enrollDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">종료일</p>
                      <p className="font-medium text-gray-900">{history.endDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📊 교육생 상세 정보 워크플로우"
        description="교육생의 학습 현황과 성과를 종합적으로 관리합니다"
        steps={[
          {
            step: 1,
            title: '기본 정보 확인',
            description: '교육생의 이름, 이메일, 프로그램 정보 등 기본 정보를 확인합니다.',
          },
          {
            step: 2,
            title: '학습 진도 모니터링',
            description: 'VOD 시청 진도, 과제 제출 현황, KPI 달성도를 실시간으로 확인합니다.',
          },
          {
            step: 3,
            title: '성과 분석',
            description: '학습 시간, 완료율, KPI 점수 등을 종합적으로 분석하여 학습 상태를 파악합니다.',
          },
          {
            step: 4,
            title: '개별 피드백',
            description: '진도가 부진한 부분이나 개선이 필요한 부분에 대해 개별 피드백을 제공합니다.',
          },
          {
            step: 5,
            title: '프로그램 이력 관리',
            description: '과거 참여한 프로그램 이력을 확인하여 학습 패턴을 파악합니다.',
          },
        ]}
        keyFeatures={[
          '교육생 기본 정보 조회 및 수정',
          'VOD 시청 진도 실시간 확인',
          '과제 제출 현황 및 평가 결과',
          'KPI 제출 및 달성도 확인',
          '프로그램 이력 관리',
          '학습 통계 및 분석',
          '개별 메모 및 피드백 작성',
          '시청 히스토리 상세 조회',
        ]}
        tips={[
          'VOD 진도율이 낮거나 과제 미제출이 많은 경우, 조기에 개입하여 학습 이탈을 방지하세요.',
          'KPI 달성도를 통해 학습 목표 대비 실제 성과를 정량적으로 평가할 수 있습니다.',
          '프로그램 이력을 참고하면 교육생의 강점과 약점을 파악하는 데 도움이 됩니다.',
          '시청 히스토리를 통해 어떤 내용에서 많은 시간을 소비하는지 파악할 수 있습니다.',
        ]}
      />
    </div>
  );
}
