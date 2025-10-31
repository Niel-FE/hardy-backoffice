'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  PencilIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CoachEvaluation {
  id: number;
  evaluatorName: string;
  evaluatorRole: string;
  programName: string;
  rating: number;
  comment: string;
  date: string;
  categories: {
    teaching: number;
    communication: number;
    expertise: number;
  };
}

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

// Mock data - 실제로는 API에서 가져옴
const mockCoaches: Coach[] = [
  {
    id: 1,
    name: '박코치',
    email: 'park.coach@example.com',
    phone: '010-1111-2222',
    specialization: ['비즈니스 모델링', '린 스타트업', '고객 발견'],
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
    specialization: ['디자인 씽킹', '시장 조사', '고객 인터뷰'],
    status: 'active',
    joinDate: '2024-03-20',
    assignedPrograms: ['YEEEYEP 인도네시아'],
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
    specialization: ['재무 관리', '투자 유치', '사업 계획'],
    status: 'active',
    joinDate: '2024-02-10',
    assignedPrograms: ['하나유니브'],
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
    specialization: ['마케팅 전략', '브랜딩', '성장 해킹'],
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
    specialization: ['피칭', '프레젠테이션', '스토리텔링'],
    status: 'pending',
    joinDate: '2025-10-01',
    assignedPrograms: [],
    totalStudents: 0,
    avgRating: 0,
    completedPrograms: 0,
    experienceYears: 3,
  },
];

// Mock evaluation data
const mockEvaluations: Record<number, CoachEvaluation[]> = {
  1: [
    {
      id: 1,
      evaluatorName: '김교육생',
      evaluatorRole: '교육생',
      programName: 'YEEEYEP 인도네시아',
      rating: 4.8,
      comment: '설명이 명확하고 이해하기 쉽게 가르쳐주셔서 많은 도움이 되었습니다.',
      date: '2025-10-15',
      categories: {
        teaching: 5.0,
        communication: 4.5,
        expertise: 5.0,
      },
    },
    {
      id: 2,
      evaluatorName: '이교육생',
      evaluatorRole: '교육생',
      programName: '하나유니브',
      rating: 4.6,
      comment: '전문성이 뛰어나시고 질문에 대한 답변이 정확합니다.',
      date: '2025-09-20',
      categories: {
        teaching: 4.5,
        communication: 4.5,
        expertise: 5.0,
      },
    },
    {
      id: 3,
      evaluatorName: '박매니저',
      evaluatorRole: '프로그램 매니저',
      programName: 'YEEEYEP 인도네시아',
      rating: 4.7,
      comment: '교육생들과의 소통이 원활하고 프로그램 운영에 적극적으로 협조해주십니다.',
      date: '2025-10-10',
      categories: {
        teaching: 4.5,
        communication: 5.0,
        expertise: 4.5,
      },
    },
  ],
  2: [
    {
      id: 4,
      evaluatorName: '최교육생',
      evaluatorRole: '교육생',
      programName: 'YEEEYEP 인도네시아',
      rating: 5.0,
      comment: '최고의 코치입니다. 열정적이고 친절하십니다.',
      date: '2025-10-12',
      categories: {
        teaching: 5.0,
        communication: 5.0,
        expertise: 5.0,
      },
    },
    {
      id: 5,
      evaluatorName: '정교육생',
      evaluatorRole: '교육생',
      programName: 'YEEEYEP 인도네시아',
      rating: 4.8,
      comment: '실무 경험을 바탕으로 한 설명이 인상적이었습니다.',
      date: '2025-10-08',
      categories: {
        teaching: 4.8,
        communication: 4.8,
        expertise: 5.0,
      },
    },
  ],
  3: [
    {
      id: 6,
      evaluatorName: '강교육생',
      evaluatorRole: '교육생',
      programName: '하나유니브',
      rating: 4.5,
      comment: '재무 관리에 대한 깊은 이해를 가지고 계십니다.',
      date: '2025-10-05',
      categories: {
        teaching: 4.5,
        communication: 4.0,
        expertise: 5.0,
      },
    },
  ],
  4: [
    {
      id: 7,
      evaluatorName: '윤교육생',
      evaluatorRole: '교육생',
      programName: 'SuTEAM',
      rating: 4.3,
      comment: '마케팅 실무 경험이 풍부하시고 도움이 많이 되었습니다.',
      date: '2025-08-20',
      categories: {
        teaching: 4.0,
        communication: 4.5,
        expertise: 4.5,
      },
    },
  ],
};

export default function CoachDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'programs'>('overview');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    const foundCoach = mockCoaches.find((c) => c.id === id);
    if (foundCoach) {
      setCoach(foundCoach);
    }
  }, [params.id]);

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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!coach) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">코치 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/coaches/list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>코치 목록으로 돌아가기</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <UserCircleIcon className="w-24 h-24 text-gray-400" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{coach.name}</h1>
                {getStatusBadge(coach.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  {coach.email}
                </div>
                <div className="flex items-center gap-1">
                  <PhoneIcon className="w-4 h-4" />
                  {coach.phone}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push(`/coaches/${coach.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            수정
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">담당 교육생</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{coach.totalStudents}명</p>
        </div>

        <div
          onClick={() => setShowEvaluationModal(true)}
          className="bg-red-50 border border-red-200 rounded-lg p-6 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-200 rounded-lg">
              <StarIcon className="w-6 h-6 text-red-700" />
            </div>
            <p className="text-sm text-red-900 font-medium">평균 평점</p>
          </div>
          <p className="text-3xl font-bold text-red-900">
            {coach.avgRating > 0 ? coach.avgRating.toFixed(1) : '-'}
          </p>
          <p className="text-xs text-red-700 mt-2">클릭하여 평가 상세 보기</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">완료 프로그램</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{coach.completedPrograms}개</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">경력</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{coach.experienceYears}년</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'overview' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            개요
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'programs' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            담당 프로그램
            {activeTab === 'programs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="text-sm font-medium text-gray-900">{coach.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b">
                <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">경력</p>
                  <p className="text-sm font-medium text-gray-900">{coach.experienceYears}년</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="text-sm font-medium text-gray-900">{coach.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">전화번호</p>
                  <p className="text-sm font-medium text-gray-900">{coach.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Specialization */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">전문 분야</h2>
            <div className="flex flex-wrap gap-2">
              {coach.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 text-sm font-medium bg-primary-100 text-primary-800 rounded-lg"
                >
                  {spec}
                </span>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{coach.specialization.length}</span>개의
                전문 분야를 보유하고 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">담당 프로그램</h2>
          {coach.assignedPrograms.length > 0 ? (
            <div className="space-y-3">
              {coach.assignedPrograms.map((program, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{program}</h3>
                      <p className="text-sm text-gray-500">진행 중</p>
                    </div>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    상세보기
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">현재 담당 중인 프로그램이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">코치 상세 정보</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>코치의 상세 정보 및 성과를 확인할 수 있습니다</li>
          <li>담당 프로그램 및 교육생 현황을 모니터링할 수 있습니다</li>
          <li>수정 버튼을 통해 코치 정보를 업데이트할 수 있습니다</li>
          <li>평균 평점 카드를 클릭하면 상세 평가 내역을 확인할 수 있습니다</li>
        </ul>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEvaluationModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-red-900">코치 평가 상세</h2>
                <p className="text-sm text-red-700 mt-1">
                  {coach.name} 코치에 대한 평가 내역
                </p>
              </div>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-red-900" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-1">평균 평점</p>
                  <p className="text-3xl font-bold text-red-900">
                    {coach.avgRating.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 평가 수</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {mockEvaluations[coach.id]?.length || 0}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">평균 강의력</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {mockEvaluations[coach.id]
                      ? (
                          mockEvaluations[coach.id].reduce(
                            (sum, e) => sum + e.categories.teaching,
                            0
                          ) / mockEvaluations[coach.id].length
                        ).toFixed(1)
                      : '-'}
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">평균 소통력</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {mockEvaluations[coach.id]
                      ? (
                          mockEvaluations[coach.id].reduce(
                            (sum, e) => sum + e.categories.communication,
                            0
                          ) / mockEvaluations[coach.id].length
                        ).toFixed(1)
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Evaluations List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">평가 내역</h3>
                {mockEvaluations[coach.id] && mockEvaluations[coach.id].length > 0 ? (
                  mockEvaluations[coach.id].map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Evaluator Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {evaluation.evaluatorName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {evaluation.evaluatorRole} · {evaluation.programName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold text-gray-900">
                              {evaluation.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{evaluation.date}</p>
                        </div>
                      </div>

                      {/* Category Ratings */}
                      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">강의력</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(evaluation.categories.teaching / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {evaluation.categories.teaching.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">소통력</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(evaluation.categories.communication / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {evaluation.categories.communication.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">전문성</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${(evaluation.categories.expertise / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {evaluation.categories.expertise.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      {evaluation.comment && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">평가 의견</p>
                          <p className="text-sm text-blue-800">{evaluation.comment}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">아직 평가 내역이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
