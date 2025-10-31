'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { TeamKPIGoal, ProgressDisplayType } from '@/types/kpi';

// Mock teams and programs
const mockTeams = [
  { id: 1, name: 'Team Alpha', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 2, name: 'Team Beta', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 3, name: 'Team Gamma', programId: 1, programName: 'AI 부트캠프 3기' },
  { id: 4, name: 'Team Delta', programId: 2, programName: '데이터 분석 부트캠프' },
  { id: 5, name: 'Team Echo', programId: 2, programName: '데이터 분석 부트캠프' },
];

export default function CreateTeamKPIGoalPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [formData, setFormData] = useState({
    teamId: 0,
    goalName: '',
    description: '',
    startDate: '',
    endDate: '',
    progressDisplayType: 'bar' as ProgressDisplayType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.teamId === 0) {
      error('팀을 선택해주세요');
      return;
    }
    if (!formData.goalName.trim()) {
      error('목표명을 입력해주세요');
      return;
    }
    if (!formData.description.trim()) {
      error('설명을 입력해주세요');
      return;
    }
    if (!formData.startDate) {
      error('시작일을 입력해주세요');
      return;
    }
    if (!formData.endDate) {
      error('종료일을 입력해주세요');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      error('종료일은 시작일보다 이후여야 합니다');
      return;
    }

    const team = mockTeams.find((t) => t.id === formData.teamId);
    if (!team) {
      error('팀 정보를 찾을 수 없습니다');
      return;
    }

    const newGoal: TeamKPIGoal = {
      id: generateId(),
      teamId: team.id,
      teamName: team.name,
      programId: team.programId,
      programName: team.programName,
      goalName: formData.goalName,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      progressDisplayType: formData.progressDisplayType,
      status: 'active',
      createdAt: formatDate(),
      updatedAt: formatDate(),
    };

    const goals = getFromStorage<TeamKPIGoal>(STORAGE_KEYS.TEAM_KPI_GOALS);
    saveToStorage(STORAGE_KEYS.TEAM_KPI_GOALS, [...goals, newGoal]);

    success('팀 KPI 목표가 생성되었습니다');
    setTimeout(() => {
      router.push(`/students/teams/kpi/${newGoal.id}`);
    }, 1000);
  };

  const selectedTeam = mockTeams.find((t) => t.id === formData.teamId);

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
        <h1 className="text-3xl font-bold text-gray-900">팀 KPI 목표 생성</h1>
        <p className="text-gray-600 mt-2">팀의 목표를 설정하고 세부 KPI를 관리하세요</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팀 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value={0}>팀을 선택하세요</option>
              {mockTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.programName}
                </option>
              ))}
            </select>
            {selectedTeam && (
              <p className="text-xs text-gray-500 mt-1">
                프로그램: {selectedTeam.programName}
              </p>
            )}
          </div>

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.goalName}
              onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 주차별 학습 목표 100% 달성"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="팀 목표에 대한 상세한 설명을 입력하세요"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Progress Display Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              진행률 표시 방식 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'bar', label: '막대 그래프', icon: '📊' },
                { value: 'pie', label: '파이 차트', icon: '📈' },
                { value: 'donut', label: '도넛 차트', icon: '🍩' },
                { value: 'number', label: '숫자', icon: '🔢' },
                { value: 'percentage', label: '퍼센트', icon: '%' },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.progressDisplayType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="progressDisplayType"
                    value={type.value}
                    checked={formData.progressDisplayType === type.value}
                    onChange={(e) =>
                      setFormData({ ...formData, progressDisplayType: e.target.value as ProgressDisplayType })
                    }
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              팀 KPI 상세 페이지에서 이 방식으로 진행률이 표시됩니다
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            생성하기
          </button>
          <button
            type="button"
            onClick={() => router.push('/students/teams/kpi')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl">
        <h3 className="font-semibold text-blue-900 mb-2">팀 KPI 목표 생성 안내</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>팀 목표를 생성한 후, 상세 페이지에서 세부 KPI를 등록할 수 있습니다</li>
          <li>세부 KPI는 팀원에게 개별적으로 할당할 수 있습니다</li>
          <li>진행률 표시 방식은 나중에 수정할 수 있습니다</li>
          <li>목표 기간 동안 팀원들의 진행 상황을 실시간으로 추적할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
