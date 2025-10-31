'use client';

import { useState } from 'react';
import { UserCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CoachRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    status: 'pending' as 'active' | 'inactive' | 'pending',
    specialization: [] as string[],
    experienceYears: 0,
    bio: '',
    references: '',
    profileImage: '',
  });

  const [specializationInput, setSpecializationInput] = useState('');

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

    // Validation
    if (!formData.email) {
      alert('이메일을 입력해주세요');
      return;
    }
    if (!formData.password) {
      alert('비밀번호를 입력해주세요');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    if (formData.password.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    console.log('Form submitted:', formData);
    console.log('Login ID (Email):', formData.email);
    alert('코치 등록이 완료되었습니다!\n로그인 아이디: ' + formData.email);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
      status: 'pending',
      specialization: [],
      experienceYears: 0,
      bio: '',
      references: '',
      profileImage: '',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">코치 등록</h1>
        <p className="text-gray-600 mt-2">신규 코치 정보 입력 및 등록</p>
      </div>

      {/* Registration Form */}
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
                이메일 (로그인 아이디) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="hong@example.com"
                autoComplete="email"
              />
              <p className="text-xs text-gray-500 mt-1">이메일이 로그인 아이디로 사용됩니다</p>
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
          </div>
        </div>

        {/* Account Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코치 상태 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">대기 중</option>
                <option value="active">활동 중</option>
                <option value="inactive">비활성</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">코치의 현재 상태를 선택하세요</p>
            </div>

            <div></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="최소 8자 이상"
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">영문, 숫자, 특수문자 조합 권장</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="비밀번호 재입력"
                autoComplete="new-password"
              />
              {formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
              )}
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
                placeholder="전문 분야 입력 (예: React, Python, Design Thinking)"
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

        {/* Suggested Programs Section */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">배정 가능 프로그램</h3>
          <p className="text-sm text-blue-800">
            코치 등록 후, &quot;코치 목록&quot; 페이지에서 프로그램별 코치 배정을 진행할 수 있습니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            코치 등록
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('작성 중인 내용이 삭제됩니다. 계속하시겠습니까?')) {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  passwordConfirm: '',
                  status: 'pending',
                  specialization: [],
                  experienceYears: 0,
                  bio: '',
                  references: '',
                  profileImage: '',
                });
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
        <h3 className="font-semibold text-gray-900 mb-2">코치 등록 가이드</h3>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>모든 필수 항목(*)은 반드시 입력해야 합니다</li>
          <li>
            <strong>로그인 정보:</strong> 이메일이 로그인 아이디로 사용되며, 비밀번호와 함께 시스템 접속에 필요합니다
          </li>
          <li>
            <strong>코치 상태:</strong> 대기 중(pending), 활동 중(active), 비활성(inactive) 중 선택 가능합니다
          </li>
          <li>비밀번호는 최소 8자 이상이어야 하며, 영문, 숫자, 특수문자 조합을 권장합니다</li>
          <li>전문 분야는 여러 개 추가할 수 있으며, 프로그램 배정 시 참고됩니다</li>
          <li>경력 및 레퍼런스는 향후 코치 평가 시 활용됩니다</li>
          <li>등록 후에도 코치 정보를 수정할 수 있습니다</li>
          <li>등록된 코치는 &quot;코치 목록&quot;에서 프로그램에 배정할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
