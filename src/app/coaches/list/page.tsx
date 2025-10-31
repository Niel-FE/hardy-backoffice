'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import WorkflowGuide from '@/components/WorkflowGuide';

interface Coach {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  assignedPrograms: string[];
  totalStudents: number;
  avgRating: number;
  completedPrograms: number;
  experienceYears: number;
}

const mockCoaches: Coach[] = [
  {
    id: 1,
    name: '박코치',
    email: 'park.coach@example.com',
    phone: '010-1111-2222',
    specialization: ['비즈니스 전략', '린스타트업', '비즈니스 모델'],
    status: 'active',
    joinDate: '2024-01-15',
    assignedPrograms: ['YEEEYEP 인도네시아', '하나유니브'],
    totalStudents: 45,
    avgRating: 4.7,
    completedPrograms: 8,
    experienceYears: 5,
  },
  {
    id: 2,
    name: '김코치',
    email: 'kim.coach@example.com',
    phone: '010-2222-3333',
    specialization: ['마케팅', '세일즈', '고객 개발'],
    status: 'active',
    joinDate: '2024-03-20',
    assignedPrograms: ['하나유니브'],
    totalStudents: 28,
    avgRating: 4.9,
    completedPrograms: 5,
    experienceYears: 7,
  },
  {
    id: 3,
    name: '최코치',
    email: 'choi.coach@example.com',
    phone: '010-3333-4444',
    specialization: ['재무', '회계', '투자 유치'],
    status: 'active',
    joinDate: '2024-02-10',
    assignedPrograms: ['SuTEAM'],
    totalStudents: 35,
    avgRating: 4.5,
    completedPrograms: 6,
    experienceYears: 4,
  },
  {
    id: 4,
    name: '이코치',
    email: 'lee.coach@example.com',
    phone: '010-4444-5555',
    specialization: ['피칭', '프레젠테이션', 'IR'],
    status: 'inactive',
    joinDate: '2023-11-05',
    assignedPrograms: [],
    totalStudents: 52,
    avgRating: 4.3,
    completedPrograms: 10,
    experienceYears: 6,
  },
  {
    id: 5,
    name: '정코치',
    email: 'jung.coach@example.com',
    phone: '010-5555-6666',
    specialization: ['법률', '특허', '지적재산권'],
    status: 'pending',
    joinDate: '2025-10-01',
    assignedPrograms: [],
    totalStudents: 0,
    avgRating: 0,
    completedPrograms: 0,
    experienceYears: 3,
  },
];

export default function CoachListPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');

  // Get unique programs from all coaches
  const allPrograms = Array.from(new Set(coaches.flatMap((c) => c.assignedPrograms))).sort();

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialization.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || coach.status === filterStatus;
    const matchesProgram =
      filterProgram === 'all' || coach.assignedPrograms.includes(filterProgram);
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const getStatusBadge = (status: Coach['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: '활동 중',
      inactive: '비활성',
      pending: '대기 중',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">코치 인재풀</h1>
        <p className="text-gray-600 mt-2">코치 관리 및 프로필 정보</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">전체 코치</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{coaches.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">활동 중</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {coaches.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">평균 평점</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {(
              coaches.filter((c) => c.avgRating > 0).reduce((sum, c) => sum + c.avgRating, 0) /
              coaches.filter((c) => c.avgRating > 0).length
            ).toFixed(1)}{' '}
            ★
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">담당 교육생</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {coaches.reduce((sum, c) => sum + c.totalStudents, 0)}
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
              placeholder="이름, 이메일, 전문 분야로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Add Coach Button */}
          <button
            onClick={() => router.push('/coaches/register')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            코치 등록
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">상태:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="active">활동 중</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기 중</option>
            </select>
          </div>

          {/* Program Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">프로그램:</span>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              {allPrograms.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coaches Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코치
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                전문분야
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                담당 프로그램
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                교육생
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                평점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                경력
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCoaches.map((coach) => (
              <tr
                key={coach.id}
                onClick={() => router.push(`/coaches/${coach.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{coach.name}</div>
                      <div className="text-xs text-gray-500">가입일: {coach.joinDate}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <EnvelopeIcon className="w-3 h-3" />
                    {coach.email}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3" />
                    {coach.phone}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {coach.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {coach.assignedPrograms.length > 0 ? (
                    <ul className="text-xs text-gray-700 space-y-1">
                      {coach.assignedPrograms.map((program, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary-600 rounded-full"></span>
                          {program}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-400">배정 없음</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{coach.totalStudents}명</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-gray-400 fill-current" />
                    <span className="text-sm font-medium text-gray-400 line-through">
                      {coach.avgRating > 0 ? coach.avgRating.toFixed(1) : '-'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 line-through">
                    {coach.completedPrograms}개 완료
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{coach.experienceYears}년</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(coach.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCoaches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">코치 인재풀 관리 기능</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>코치 DB 및 프로필 관리 (경력, 전문 분야, 레퍼런스)</li>
          <li>프로그램별 코치 매칭 및 배정</li>
          <li>코치 성과 평가 및 평점 관리</li>
          <li>코치 피드백 및 이력 추적</li>
          <li>상태 관리 (활동 중/비활성/대기 중)</li>
        </ul>
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide
        title="👨‍🏫 코치 목록 관리 워크플로우"
        description="코치 풀을 관리하고 프로그램에 배정합니다"
        steps={[
          {
            step: 1,
            title: '코치 등록',
            description: '신규 코치의 기본 정보와 전문 분야를 등록합니다.',
          },
          {
            step: 2,
            title: '코치 검색',
            description: '전문 분야, 경력, 가용 여부 등으로 코치를 검색하고 필터링합니다.',
          },
          {
            step: 3,
            title: '코치 프로필 확인',
            description: '코치의 상세 정보, 담당 이력, 평가 점수 등을 확인합니다.',
          },
          {
            step: 4,
            title: '프로그램 배정',
            description: '코치의 전문성과 가용 시간을 고려하여 적합한 프로그램에 배정합니다.',
          },
        ]}
        keyFeatures={[
          '코치 등록 및 정보 관리',
          '전문 분야별 검색',
          '가용 여부 확인',
          '코치 평가 점수 확인',
          '담당 프로그램 이력',
          '코치 프로필 수정',
          '프로그램 배정',
        ]}
        tips={[
          '코치의 전문 분야를 정확히 등록하면 프로그램 배정 시 적합한 코치를 빠르게 찾을 수 있습니다.',
          '평가 점수를 정기적으로 확인하여 코칭 품질을 관리하세요.',
          '가용 코치가 부족한 분야는 미리 파악하여 채용 계획을 수립하세요.',
        ]}
      />
    </div>
  );
}
