'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { TeamKPIGoal, TeamKPIDetail } from '@/types/kpi';

// Mock team members
const mockTeamMembers = [
  { id: 1, name: '김철수', teamId: 1 },
  { id: 2, name: '이영희', teamId: 1 },
  { id: 3, name: '박민수', teamId: 1 },
  { id: 4, name: '정수진', teamId: 1 },
  { id: 5, name: '최동욱', teamId: 1 },
  { id: 6, name: '강민지', teamId: 2 },
  { id: 7, name: '윤서준', teamId: 2 },
  { id: 8, name: '장하늘', teamId: 3 },
  { id: 9, name: '한지우', teamId: 3 },
];

// Progress Visualization Component
function ProgressVisualization({
  type,
  progress,
  size = 'large',
}: {
  type: TeamKPIGoal['progressDisplayType'];
  progress: number;
  size?: 'small' | 'large';
}) {
  const isLarge = size === 'large';

  if (type === 'bar') {
    return (
      <div className={isLarge ? 'space-y-2' : ''}>
        {isLarge && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">전체 진행률</span>
            <span className="text-gray-900 font-bold">{progress}%</span>
          </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full ${isLarge ? 'h-4' : 'h-2'}`}>
          <div
            className="bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, height: '100%' }}
          />
        </div>
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div className={`flex items-center justify-center ${isLarge ? 'h-32' : 'h-16'}`}>
        <div className="text-center">
          <div className={`font-bold text-primary-600 ${isLarge ? 'text-6xl' : 'text-3xl'}`}>{progress}</div>
          {isLarge && <div className="text-gray-600 mt-2">/ 100</div>}
        </div>
      </div>
    );
  }

  if (type === 'percentage') {
    return (
      <div className={`flex items-center justify-center ${isLarge ? 'h-32' : 'h-16'}`}>
        <div className="text-center">
          <div className={`font-bold text-primary-600 ${isLarge ? 'text-6xl' : 'text-3xl'}`}>{progress}%</div>
          {isLarge && <div className="text-gray-600 mt-2">달성률</div>}
        </div>
      </div>
    );
  }

  if (type === 'pie' || type === 'donut') {
    const radius = isLarge ? 80 : 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    const innerRadius = type === 'donut' ? (isLarge ? 60 : 30) : 0;

    return (
      <div className={`flex items-center justify-center ${isLarge ? 'h-48' : 'h-24'}`}>
        <div className="relative">
          <svg width={radius * 2.5} height={radius * 2.5} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={radius * 1.25}
              cy={radius * 1.25}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={isLarge ? 20 : 10}
            />
            {/* Progress circle */}
            <circle
              cx={radius * 1.25}
              cy={radius * 1.25}
              r={radius}
              fill="none"
              stroke="#0066FF"
              strokeWidth={isLarge ? 20 : 10}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Inner circle for donut */}
            {type === 'donut' && (
              <circle cx={radius * 1.25} cy={radius * 1.25} r={innerRadius} fill="white" />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`font-bold text-primary-600 ${isLarge ? 'text-3xl' : 'text-xl'}`}>{progress}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function TeamKPIDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [goal, setGoal] = useState<TeamKPIGoal | null>(null);
  const [kpiDetails, setKpiDetails] = useState<TeamKPIDetail[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<TeamKPIDetail | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetValue: 0,
    unit: '',
    assignedStudentIds: [] as number[], // 여러 팀원 선택 가능
    dueDate: '',
  });

  // 팀원별 입력값 임시 저장 (detailId_studentId를 키로 사용)
  const [memberInputs, setMemberInputs] = useState<Record<string, number>>({});

  // Load goal and KPI details
  useEffect(() => {
    const goalId = Number(params.id);
    const goals = getFromStorage<TeamKPIGoal>(STORAGE_KEYS.TEAM_KPI_GOALS);
    const foundGoal = goals.find((g) => g.id === goalId);

    if (foundGoal) {
      setGoal(foundGoal);

      // Load KPI details for this goal
      const details = getFromStorage<TeamKPIDetail>(STORAGE_KEYS.TEAM_KPI_DETAILS);
      const goalDetails = details.filter((d) => d.teamGoalId === goalId);
      setKpiDetails(goalDetails);
    } else {
      error('팀 KPI 목표를 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/students/teams/kpi');
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Save KPI details whenever they change
  useEffect(() => {
    if (kpiDetails.length > 0 && goal) {
      const allDetails = getFromStorage<TeamKPIDetail>(STORAGE_KEYS.TEAM_KPI_DETAILS);
      const otherDetails = allDetails.filter((d) => d.teamGoalId !== goal.id);
      saveToStorage(STORAGE_KEYS.TEAM_KPI_DETAILS, [...otherDetails, ...kpiDetails]);
    }
  }, [kpiDetails, goal]);

  // Calculate overall progress
  const calculateProgress = () => {
    if (kpiDetails.length === 0) return 0;
    const totalProgress = kpiDetails.reduce((sum, d) => sum + d.totalProgress, 0);
    return Math.round(totalProgress / kpiDetails.length);
  };

  // Get team members for this goal
  const teamMembers = goal ? mockTeamMembers.filter((m) => m.teamId === goal.teamId) : [];

  // Handle add/edit KPI detail
  const handleSaveDetail = () => {
    if (!goal) return;

    // Validation
    if (!formData.name.trim()) {
      error('KPI 이름을 입력해주세요');
      return;
    }
    if (formData.targetValue <= 0) {
      error('목표값을 입력해주세요');
      return;
    }
    if (!formData.unit.trim()) {
      error('단위를 입력해주세요');
      return;
    }
    if (formData.assignedStudentIds.length === 0) {
      error('담당 팀원을 최소 한 명 선택해주세요');
      return;
    }

    // 선택된 팀원들 정보 가져오기
    const assignedStudents = teamMembers
      .filter((m) => formData.assignedStudentIds.includes(m.id))
      .map((m) => ({
        studentId: m.id,
        studentName: m.name,
        currentValue: 0,
        progress: 0,
      }));

    if (assignedStudents.length === 0) {
      error('선택한 팀원 정보를 찾을 수 없습니다');
      return;
    }

    if (editingDetail) {
      // Update existing detail
      setKpiDetails((prev) =>
        prev.map((d) =>
          d.id === editingDetail.id
            ? {
                ...d,
                name: formData.name,
                description: formData.description,
                targetValue: formData.targetValue,
                unit: formData.unit,
                assignedStudents: assignedStudents,
                totalCurrentValue: 0,
                totalProgress: 0,
                dueDate: formData.dueDate || undefined,
                updatedAt: formatDate(),
              }
            : d
        )
      );
      success('세부 KPI가 수정되었습니다');
    } else {
      // Create new detail
      const newDetail: TeamKPIDetail = {
        id: generateId(),
        teamGoalId: goal.id,
        name: formData.name,
        description: formData.description,
        targetValue: formData.targetValue,
        unit: formData.unit,
        assignedStudents: assignedStudents,
        totalCurrentValue: 0,
        totalProgress: 0,
        status: 'not_started',
        dueDate: formData.dueDate || undefined,
        createdAt: formatDate(),
        updatedAt: formatDate(),
      };
      setKpiDetails((prev) => [...prev, newDetail]);
      success('세부 KPI가 추가되었습니다');
    }

    // Reset form
    setShowAddModal(false);
    setEditingDetail(null);
    setFormData({
      name: '',
      description: '',
      targetValue: 0,
      unit: '',
      assignedStudentIds: [],
      dueDate: '',
    });
  };

  // Handle edit detail
  const handleEditDetail = (detail: TeamKPIDetail) => {
    setEditingDetail(detail);
    setFormData({
      name: detail.name,
      description: detail.description,
      targetValue: detail.targetValue,
      unit: detail.unit,
      assignedStudentIds: detail.assignedStudents?.map((s) => s.studentId) || [],
      dueDate: detail.dueDate || '',
    });
    setShowAddModal(true);
  };

  // Handle delete detail
  const handleDeleteDetail = (detail: TeamKPIDetail) => {
    if (confirm(`"${detail.name}" 세부 KPI를 삭제하시겠습니까?`)) {
      setKpiDetails((prev) => prev.filter((d) => d.id !== detail.id));
      success('세부 KPI가 삭제되었습니다');
    }
  };

  // Handle update member progress
  const handleUpdateMemberProgress = (detailId: number, studentId: number, newValue: number) => {
    setKpiDetails((prev) =>
      prev.map((d) => {
        if (d.id === detailId) {
          // Update the specific student's progress
          const updatedStudents = d.assignedStudents.map((student) => {
            if (student.studentId === studentId) {
              const progress = Math.min(100, Math.round((newValue / d.targetValue) * 100));
              return {
                ...student,
                currentValue: newValue,
                progress,
              };
            }
            return student;
          });

          // Calculate total current value and progress
          const totalCurrentValue = updatedStudents.reduce((sum, s) => sum + s.currentValue, 0);
          const totalProgress = Math.min(
            100,
            Math.round((totalCurrentValue / (d.targetValue * updatedStudents.length)) * 100)
          );

          // Determine overall status
          let status: TeamKPIDetail['status'] = 'in_progress';
          if (totalProgress === 0) status = 'not_started';
          if (totalProgress >= 100) status = 'completed';

          return {
            ...d,
            assignedStudents: updatedStudents,
            totalCurrentValue,
            totalProgress,
            status,
            updatedAt: formatDate(),
          };
        }
        return d;
      })
    );
    success('팀원 진행 상황이 업데이트되었습니다');
  };

  // Get status badge
  const getStatusBadge = (status: TeamKPIDetail['status']) => {
    const styles = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    const labels = {
      not_started: '시작 전',
      in_progress: '진행 중',
      completed: '완료',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!goal) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const overallProgress = calculateProgress();

  // Group KPI details by student (한 세부 KPI에 여러 팀원이 있을 수 있으므로 표시 방식 변경)
  const detailsWithMembers = kpiDetails.map((detail) => ({
    detail,
    members: detail.assignedStudents || [],
  }));

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/students/teams/kpi')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>팀 KPI 목록으로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{goal.goalName}</h1>
        <p className="text-gray-600 mt-2">
          {goal.teamName} · {goal.programName}
        </p>
      </div>

      {/* Goal Info Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">목표 정보</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">설명</label>
            <p className="text-gray-900">{goal.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">기간</label>
            <p className="text-gray-900">
              {goal.startDate} ~ {goal.endDate}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Visualization Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">전체 진행률</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              완료: {kpiDetails.filter((d) => d.status === 'completed').length} / {kpiDetails.length}
            </span>
          </div>
        </div>
        <ProgressVisualization type={goal.progressDisplayType} progress={overallProgress} size="large" />
      </div>

      {/* KPI Details Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">세부 KPI 목록</h2>
          <button
            onClick={() => {
              setEditingDetail(null);
              setFormData({
                name: '',
                description: '',
                targetValue: 0,
                unit: '',
                assignedStudentIds: [],
                dueDate: '',
              });
              setShowAddModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            세부 KPI 추가
          </button>
        </div>

        {kpiDetails.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">등록된 세부 KPI가 없습니다</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              세부 KPI 추가하기 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {detailsWithMembers.map(({ detail, members }) => (
              <div key={detail.id} className="border border-gray-200 rounded-lg p-6">
                {/* KPI Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{detail.name}</h3>
                      {getStatusBadge(detail.status)}
                    </div>
                    {detail.description && (
                      <p className="text-sm text-gray-600 mb-3">{detail.description}</p>
                    )}

                    {/* 목표 및 마감일 정보 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>
                        목표: {detail.targetValue} {detail.unit}
                      </span>
                      {detail.dueDate && <span>마감: {detail.dueDate}</span>}
                    </div>

                    {/* 전체 진행 상황 프로그레스바 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-end text-sm">
                        <span className="font-semibold text-gray-900">{detail.totalProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, detail.totalProgress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDetail(detail)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="수정"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDetail(detail)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Assigned Students */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    할당된 팀원 ({members?.length || 0}명)
                  </h4>
                  {members && members.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {members.map((member) => {
                        const inputKey = `${detail.id}_${member.studentId}`;
                        const inputValue = memberInputs[inputKey] ?? member.currentValue;
                        return (
                          <div key={member.studentId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="bg-primary-100 p-1.5 rounded-full">
                                <UserIcon className="w-4 h-4 text-primary-600" />
                              </div>
                              <span className="font-medium text-gray-900">{member.studentName}</span>
                            </div>

                            {/* 현재 진행 상황 */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>
                                  {member.currentValue} / {detail.targetValue} {detail.unit}
                                </span>
                                <span className="font-semibold">{member.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, member.progress)}%` }}
                                />
                              </div>
                            </div>

                            {/* 입력 필드 및 등록 버튼 */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={detail.targetValue}
                                  value={inputValue}
                                  onChange={(e) => {
                                    setMemberInputs((prev) => ({
                                      ...prev,
                                      [inputKey]: Number(e.target.value),
                                    }));
                                  }}
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder="새 값 입력"
                                />
                                <span className="text-xs text-gray-600 min-w-[40px]">{detail.unit}</span>
                              </div>
                              <button
                                onClick={() => {
                                  handleUpdateMemberProgress(detail.id, member.studentId, inputValue);
                                  // 등록 후 입력값 초기화
                                  setMemberInputs((prev) => {
                                    const newInputs = { ...prev };
                                    delete newInputs[inputKey];
                                    return newInputs;
                                  });
                                }}
                                className="w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                              >
                                등록
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-800">
                        이 KPI에 할당된 팀원이 없습니다. 수정 버튼을 눌러 팀원을 할당해주세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit KPI Detail Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingDetail ? '세부 KPI 수정' : '세부 KPI 추가'}
            </h3>

            <div className="space-y-4">
              {/* KPI Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KPI 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 주간 출석률 달성"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="세부 KPI에 대한 설명"
                />
              </div>

              {/* Target Value and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표값 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    단위 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="%, 시간, 회"
                  />
                </div>
              </div>

              {/* Assigned Students (Multiple Selection) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 팀원 <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">팀원이 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedStudentIds.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedStudentIds: [...formData.assignedStudentIds, member.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedStudentIds: formData.assignedStudentIds.filter(
                                    (id) => id !== member.id
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.assignedStudentIds.length > 0
                    ? `${formData.assignedStudentIds.length}명 선택됨`
                    : '팀원을 최소 1명 이상 선택하세요'}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">마감일 (선택)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleSaveDetail}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                {editingDetail ? '수정하기' : '추가하기'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDetail(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">세부 KPI 관리</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>하나의 세부 KPI에 여러 팀원을 할당할 수 있습니다</li>
          <li>각 팀원의 현재값을 개별적으로 업데이트하면 자동으로 진행률이 계산됩니다</li>
          <li>전체 진행률은 모든 할당된 팀원의 평균으로 계산됩니다</li>
          <li>KPI별로 할당된 팀원과 각자의 진행 상황을 한눈에 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
