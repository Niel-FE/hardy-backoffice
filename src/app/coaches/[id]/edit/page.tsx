'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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

export default function CoachEditPage() {
  const router = useRouter();
  const params = useParams();
  const [coach, setCoach] = useState<Coach | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'pending',
    experienceYears: 0,
    bio: '',
    references: '',
    profileImage: '',
  });

  const [specializationInput, setSpecializationInput] = useState('');

  useEffect(() => {
    const id = Number(params.id);
    const foundCoach = mockCoaches.find((c) => c.id === id);
    if (foundCoach) {
      setCoach(foundCoach);
      setFormData({
        name: foundCoach.name,
        email: foundCoach.email,
        phone: foundCoach.phone,
        specialization: foundCoach.specialization,
        status: foundCoach.status,
        experienceYears: foundCoach.experienceYears,
        bio: '',
        references: '',
        profileImage: '',
      });
    }
  }, [params.id]);

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specializationInput.trim()],
      });
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((s) => s !== spec),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('코치 정보가 수정되었습니다!');
    router.push(`/coaches/${params.id}`);
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
          onClick={() => router.push(`/coaches/${params.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>코치 상세로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">코치 정보 수정</h1>
        <p className="text-gray-600 mt-2">{coach.name} 코치 정보 수정</p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-8">
        {/* Profile Image Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">프로필 이미지</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                이미지 업로드
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF (최대 5MB)</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="hong@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경력 연수 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">활동 중</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기 중</option>
              </select>
            </div>
          </div>
        </div>

        {/* Specialization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">전문 분야</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialization();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="전문 분야 입력 (예: 비즈니스 모델링, 고객 발견, 디자인 씽킹)"
              />
              <button
                type="button"
                onClick={handleAddSpecialization}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                추가
              </button>
            </div>

            {/* Specialization Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.specialization.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(spec)}
                    className="hover:text-primary-900"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {formData.specialization.length === 0 && (
                <p className="text-sm text-gray-500">전문 분야를 추가해주세요</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">소개 및 경력</h3>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="코치의 경력, 전문성, 교육 철학 등을 자유롭게 작성해주세요..."
          />
        </div>

        {/* References */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">레퍼런스 및 평가 이력</h3>
          <textarea
            value={formData.references}
            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="이전 교육 경험, 추천인, 특이 사항 등을 작성해주세요..."
          />
        </div>

        {/* Program Assignment Info */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">담당 프로그램</h3>
          <p className="text-sm text-blue-800 mb-2">
            현재 {coach.assignedPrograms.length}개의 프로그램을 담당하고 있습니다.
          </p>
          {coach.assignedPrograms.length > 0 && (
            <ul className="text-sm text-blue-800 list-disc list-inside">
              {coach.assignedPrograms.map((program, idx) => (
                <li key={idx}>{program}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            수정 완료
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('수정 사항이 저장되지 않습니다. 계속하시겠습니까?')) {
                router.push(`/coaches/${params.id}`);
              }
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            취소
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">코치 정보 수정 가이드</h3>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>모든 필수 항목(*)은 반드시 입력해야 합니다</li>
          <li>상태를 변경하면 코치의 활동 상태가 업데이트됩니다</li>
          <li>전문 분야는 프로그램 배정 시 참고됩니다</li>
          <li>담당 프로그램은 프로그램 관리 페이지에서 수정할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
