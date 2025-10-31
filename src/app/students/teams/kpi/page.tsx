'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, formatDate } from '@/lib/storage';
import { TeamKPIGoal, TeamKPIDetail } from '@/types/kpi';

// Mock teams (이미 teams 페이지에서 사용중인 데이터와 동일)
const mockTeams = [
  { id: 1, name: 'Team Alpha', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 2, name: 'Team Beta', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 3, name: 'Team Gamma', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 4, name: 'Team Delta', programId: 2, programName: '데이터 분석 부트캠프' },
];

// Initial team KPI goals with mock data
const initialTeamKPIGoals: TeamKPIGoal[] = [
  {
    id: 1,
    teamId: 1,
    teamName: 'Team Alpha',
    programId: 1,
    programName: 'AI 부트캠프 3기',
    goalName: '주차별 학습 목표 100% 달성',
    description: '모든 팀원이 주차별로 설정된 학습 목표를 100% 달성하는 것을 목표로 합니다',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    progressDisplayType: 'bar',
    status: 'active',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
  {
    id: 2,
    teamId: 2,
    teamName: 'Team Beta',
    programId: 1,
    programName: 'AI 부트캠프 3기',
    goalName: '팀 프로젝트 우수상 수상',
    description: '최종 팀 프로젝트에서 우수상 이상을 받기 위한 목표입니다',
    startDate: '2025-10-01',
    endDate: '2025-12-20',
    progressDisplayType: 'pie',
    status: 'active',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-05',
  },
  {
    id: 3,
    teamId: 3,
    teamName: 'Team Gamma',
    programId: 1,
    programName: 'AI 부트캠프 3기',
    goalName: '전원 수료 달성',
    description: '팀원 전원이 성공적으로 프로그램을 수료하는 것을 목표로 합니다',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    progressDisplayType: 'number',
    status: 'active',
    createdAt: '2025-09-28',
    updatedAt: '2025-10-10',
  },
];

export default function TeamKPIManagementPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [teamKPIGoals, setTeamKPIGoals] = useState<TeamKPIGoal[]>([]);
  const [teamKPIDetails, setTeamKPIDetails] = useState<TeamKPIDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [filterTeam, setFilterTeam] = useState<number>(0);

  // Load team KPI goals from LocalStorage
  useEffect(() => {
    const goals = getFromStorage<TeamKPIGoal>(STORAGE_KEYS.TEAM_KPI_GOALS || 'ud_backoffice_team_kpi_goals');
    if (goals.length > 0) {
      setTeamKPIGoals(goals);
    } else {
      setTeamKPIGoals(initialTeamKPIGoals);
      saveToStorage(STORAGE_KEYS.TEAM_KPI_GOALS || 'ud_backoffice_team_kpi_goals', initialTeamKPIGoals);
    }

    // Load team KPI details
    const details = getFromStorage<TeamKPIDetail>(STORAGE_KEYS.TEAM_KPI_DETAILS || 'ud_backoffice_team_kpi_details');
    setTeamKPIDetails(details);
  }, []);

  // Calculate progress for each goal
  const calculateGoalProgress = (goalId: number) => {
    const details = teamKPIDetails.filter((d) => d.teamGoalId === goalId);
    if (details.length === 0) return 0;

    const totalProgress = details.reduce((sum, d) => sum + d.totalProgress, 0);
    return Math.round(totalProgress / details.length);
  };

  // Get completed count for each goal
  const getCompletedCount = (goalId: number) => {
    const details = teamKPIDetails.filter((d) => d.teamGoalId === goalId);
    const completed = details.filter((d) => d.status === 'completed').length;
    return { completed, total: details.length };
  };

  // Filtered team KPI goals
  const filteredGoals = teamKPIGoals.filter((goal) => {
    const matchesSearch =
      goal.goalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesTeam = filterTeam === 0 || goal.teamId === filterTeam;
    return matchesSearch && matchesStatus && matchesTeam;
  });

  const getStatusBadge = (status: TeamKPIGoal['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '진행 중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getDisplayTypeBadge = (type: TeamKPIGoal['progressDisplayType']) => {
    const labels = {
      bar: '막대 그래프',
      pie: '파이 차트',
      number: '숫자',
      percentage: '퍼센트',
      donut: '도넛 차트',
    };
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        {labels[type]}
      </span>
    );
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">팀 KPI 관리</h1>
        <p className="text-gray-600 mt-2">팀별 목표 및 세부 KPI를 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 팀 목표</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{teamKPIGoals.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">진행 중</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {teamKPIGoals.filter((g) => g.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">완료</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {teamKPIGoals.filter((g) => g.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">평균 진행률</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {teamKPIGoals.length > 0
              ? Math.round(
                  teamKPIGoals.reduce((sum, goal) => sum + calculateGoalProgress(goal.id), 0) /
                    teamKPIGoals.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="목표명, 팀명, 프로그램으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Team Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">팀:</label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>전체</option>
                {mockTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'active', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all'
                    ? '전체'
                    : status === 'active'
                    ? '진행 중'
                    : status === 'completed'
                    ? '완료'
                    : '취소됨'}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <button
              onClick={() => router.push('/students/teams/kpi/create')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              팀 KPI 목표 생성
            </button>
          </div>
        </div>
      </div>

      {/* Team KPI Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const progress = calculateGoalProgress(goal.id);
          const { completed, total } = getCompletedCount(goal.id);

          return (
            <div
              key={goal.id}
              onClick={() => router.push(`/students/teams/kpi/${goal.id}`)}
              className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <ChartBarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{goal.goalName}</h3>
                    <p className="text-sm text-gray-500">{goal.teamName}</p>
                  </div>
                </div>
                {getStatusBadge(goal.status)}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">프로그램</span>
                  <span className="text-gray-900 font-medium">{goal.programName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">기간</span>
                  <span className="text-gray-900">
                    {goal.startDate} ~ {goal.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">표시 방식</span>
                  {getDisplayTypeBadge(goal.progressDisplayType)}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">전체 진행률</span>
                  <span className="text-gray-900 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* KPI Status */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    세부 KPI: {completed} / {total} 완료
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/students/teams/kpi/${goal.id}`);
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  상세보기 →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">
            {searchTerm || filterTeam !== 0 || filterStatus !== 'all'
              ? '검색 결과가 없습니다.'
              : '등록된 팀 KPI 목표가 없습니다.'}
          </p>
          {!searchTerm && filterTeam === 0 && filterStatus === 'all' && (
            <button
              onClick={() => router.push('/students/teams/kpi/create')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              팀 KPI 목표 생성하기 →
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">팀 KPI 관리</h3>
        <p className="text-sm text-blue-800 mb-2">
          팀이 설정한 목표를 관리하고, 세부 KPI를 팀원에게 할당하여 진행 상황을 추적합니다.
        </p>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>팀별 목표 생성 및 관리</li>
          <li>세부 KPI를 팀원에게 할당</li>
          <li>다양한 방식으로 진행률 시각화 (막대, 파이, 숫자 등)</li>
          <li>팀 목표 달성률 실시간 추적</li>
        </ul>
      </div>
    </div>
  );
}
