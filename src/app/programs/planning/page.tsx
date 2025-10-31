'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import WorkflowGuide from '@/components/WorkflowGuide';

interface Program {
  id: number;
  title: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'recruiting' | 'ongoing' | 'completed';
  targetStudents: number;
  currentStudents: number;
  curriculum: string[];
  coordinator: string;
  budget: number;
}

const mockPrograms: Program[] = [
  {
    id: 1,
    title: 'YEEEYEP 인도네시아',
    description: '인도네시아 청년 창업가 양성 프로그램',
    duration: '16주',
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'ongoing',
    targetStudents: 35,
    currentStudents: 35,
    curriculum: ['비즈니스 모델 캔버스', '고객 발견 및 검증', '린 스타트업 방법론', '창업 아이디어 피칭'],
    coordinator: '김매니저',
    budget: 50000000,
  },
  {
    id: 2,
    title: '하나유니브',
    description: '대학생 예비 창업가 양성 프로그램',
    duration: '12주',
    startDate: '2025-08-15',
    endDate: '2025-11-10',
    status: 'ongoing',
    targetStudents: 45,
    currentStudents: 42,
    curriculum: ['창업 기초', '시장 분석', '마케팅 전략', '비즈니스 계획서 작성'],
    coordinator: '박매니저',
    budget: 40000000,
  },
  {
    id: 3,
    title: 'SuTEAM',
    description: '팀 기반 창업 프로젝트 프로그램',
    duration: '10주',
    startDate: '2025-10-01',
    endDate: '2025-12-15',
    status: 'recruiting',
    targetStudents: 20,
    currentStudents: 12,
    curriculum: ['팀 빌딩', '협업 스킬', '프로젝트 관리', '팀 피칭 연습'],
    coordinator: '최매니저',
    budget: 35000000,
  },
  {
    id: 4,
    title: 'YEEEYEP 인도네시아 2기',
    description: '인도네시아 청년 창업가 양성 프로그램 2기',
    duration: '16주',
    startDate: '2026-01-01',
    endDate: '2026-04-30',
    status: 'planning',
    targetStudents: 40,
    currentStudents: 0,
    curriculum: ['비즈니스 모델 캔버스', '고객 발견 및 검증', '린 스타트업 방법론', '창업 아이디어 피칭'],
    coordinator: '김매니저',
    budget: 50000000,
  },
  {
    id: 5,
    title: '하나유니브 1기',
    description: '대학생 예비 창업가 양성 프로그램 1기 (완료)',
    duration: '12주',
    startDate: '2025-05-01',
    endDate: '2025-07-31',
    status: 'completed',
    targetStudents: 30,
    currentStudents: 28,
    curriculum: ['창업 기초', '시장 분석', '마케팅 전략', '비즈니스 계획서 작성'],
    coordinator: '박매니저',
    budget: 35000000,
  },
];

export default function ProgramPlanningPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRecruitmentRate = (program: Program) => {
    return ((program.currentStudents / program.targetStudents) * 100).toFixed(0);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">프로그램 기획</h1>
        <p className="text-gray-600 mt-2">교육 프로그램 기획 및 일정 관리</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 프로그램</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{programs.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">진행 중</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {programs.filter((p) => p.status === 'ongoing').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">모집 중</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {programs.filter((p) => p.status === 'recruiting').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 교육생</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {programs.reduce((sum, p) => sum + p.currentStudents, 0)}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="프로그램명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Add Program Button */}
          <button
            onClick={() => router.push('/programs/create')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            프로그램 생성
          </button>
        </div>

      </div>

      {/* Programs Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로그램명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                일정
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                교육생
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                담당자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                예산
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPrograms.map((program) => (
              <tr
                key={program.id}
                onClick={() => router.push(`/programs/${program.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{program.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{program.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{program.duration}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-900">{program.startDate}</div>
                  <div className="text-xs text-gray-500">~ {program.endDate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {program.currentStudents} / {program.targetStudents}명
                  </div>
                  {program.status === 'recruiting' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${getRecruitmentRate(program)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        모집률 {getRecruitmentRate(program)}%
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{program.coordinator}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {(program.budget / 10000).toLocaleString()}만원
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide
        title="🎯 프로그램 기획 워크플로우"
        description="프로그램 기획부터 운영까지의 전체 과정을 안내합니다"
        steps={[
          {
            step: 1,
            title: '프로그램 검색 및 필터링',
            description: '상태별 필터와 검색 기능으로 원하는 프로그램을 찾습니다. 기획 중, 모집 중, 진행 중, 완료 상태로 분류됩니다.',
          },
          {
            step: 2,
            title: '프로그램 생성',
            description: '"프로그램 생성" 버튼을 클릭하여 새 프로그램 기획을 시작합니다. 기본 정보, 기간, 커리큘럼, 예산을 입력합니다.',
          },
          {
            step: 3,
            title: '프로그램 상세 확인',
            description: '목록에서 프로그램을 클릭하여 상세 정보를 확인합니다. 커리큘럼, 교육생 등록 현황, KPI 배정, 출석 설정 등을 관리할 수 있습니다.',
          },
        ]}
        keyFeatures={[
          '프로그램 생성 및 기본 정보 입력',
          '커리큘럼 설계 및 주차별 계획 수립',
          '상태별 필터링 (기획/모집/진행/완료)',
          '프로그램명 검색',
          '예산 및 담당자 관리',
          '교육생 모집 현황 확인 (모집률 진행바)',
          '프로그램별 통계 확인',
          '프로그램 클릭으로 상세 관리 페이지 이동',
        ]}
        tips={[
          '프로그램 상세 페이지에서 KPI 배정, 출석 설정 등 세부 관리가 가능합니다.',
          '모집률이 낮은 프로그램은 파란색 진행바로 시각적으로 표시됩니다.',
          '완료된 프로그램도 보관되므로, 다음 기수 기획 시 참고 자료로 활용할 수 있습니다.',
        ]}
      />
    </div>
  );
}
