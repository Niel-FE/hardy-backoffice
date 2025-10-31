'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import WorkflowGuide from '@/components/WorkflowGuide';

const initialPrograms = [
  { id: 1, name: 'YEEEYEP 인도네시아' },
  { id: 2, name: '하나유니브' },
  { id: 3, name: 'SuTEAM' },
];

const categories = ['창업 기초', '비즈니스 전략', '마케팅', '재무', '피칭', '기타'];

export default function CreateVODSetPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    programId: 0,
    status: 'draft' as 'draft' | 'active' | 'archived',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name) {
      error('세트 이름을 입력해주세요');
      return;
    }

    if (!formData.category) {
      error('카테고리를 선택해주세요');
      return;
    }

    if (!formData.programId) {
      error('프로그램을 선택해주세요');
      return;
    }

    const program = initialPrograms.find((p) => p.id === formData.programId);
    if (!program) {
      error('프로그램을 선택해주세요');
      return;
    }

    // 기존 VOD 세트 가져오기
    const vodSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');

    // 새 VOD 세트 생성
    const newSet: VODSet = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      programId: formData.programId,
      programName: program.name,
      order: vodSets.length + 1,
      status: formData.status,
      createdDate: formatDate(),
      sessions: [],
    };

    // 저장
    const updatedSets = [...vodSets, newSet];
    saveToStorage(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets', updatedSets);

    success('VOD 세트가 생성되었습니다');

    // 목록 페이지로 이동
    setTimeout(() => {
      router.push('/education/vod-sets');
    }, 1000);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">VOD 세트 생성</h1>
        <p className="text-gray-600 mt-2">새로운 VOD 세트를 생성합니다</p>
      </div>

      {/* Form */}
      <div className="bg-white border rounded-lg p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로그램 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>선택하세요</option>
              {initialPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              이 VOD 세트가 속할 프로그램을 선택하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세트 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: Week 1: React 기초"
            />
            <p className="text-xs text-gray-500 mt-1">
              VOD 세트를 식별할 수 있는 명확한 이름을 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">선택하세요</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              이 VOD 세트가 다루는 주제 분야를 선택하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="VOD 세트에 대한 설명을 입력하세요&#10;예: React의 기본 개념을 학습하고 실습을 통해 컴포넌트 기반 개발을 익힙니다."
            />
            <p className="text-xs text-gray-500 mt-1">
              교육생들이 이 세트의 내용을 이해할 수 있도록 설명을 작성하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900">임시저장</div>
                  <div className="text-xs text-gray-500">아직 작업 중인 세트입니다. 교육생에게 노출되지 않습니다.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900">활성</div>
                  <div className="text-xs text-gray-500">세트가 활성화되어 교육생에게 노출됩니다.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={formData.status === 'archived'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900">보관됨</div>
                  <div className="text-xs text-gray-500">세트가 보관되어 교육생에게 노출되지 않습니다.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              생성하기
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-3xl">
        <h3 className="font-medium text-blue-900 mb-2">다음 단계</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• VOD 세트를 생성한 후, 세트 목록에서 세션을 추가할 수 있습니다</li>
          <li>• 각 세션에는 VOD, AI Chat, ActCanvas 등의 컨텐츠를 추가할 수 있습니다</li>
          <li>• 모든 컨텐츠는 선택 사항이며, 필요에 따라 조합하여 사용할 수 있습니다</li>
        </ul>
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📝 VOD 세트 생성 워크플로우"
        description="새로운 VOD 세트를 생성하는 단계별 가이드입니다"
        steps={[
          {
            step: 1,
            title: '프로그램 선택',
            description: 'VOD 세트가 속할 프로그램을 먼저 선택합니다. 프로그램에 따라 교육생 그룹이 결정됩니다.',
          },
          {
            step: 2,
            title: '기본 정보 입력',
            description: '세트 이름, 카테고리, 설명을 입력합니다. 명확한 이름과 설명은 교육생의 이해를 돕습니다.',
          },
          {
            step: 3,
            title: '상태 설정',
            description: '세트의 공개 상태를 선택합니다. 임시저장으로 저장한 후 세션 구성이 완료되면 활성화하세요.',
          },
          {
            step: 4,
            title: '세트 생성 및 세션 추가',
            description: '세트를 생성한 후, 상세 페이지에서 세션을 추가하고 VOD와 과제를 구성합니다.',
          },
        ]}
        keyFeatures={[
          '프로그램별 VOD 세트 그룹화',
          '카테고리별 세트 분류 (프론트엔드, 백엔드, AI/ML 등)',
          '임시저장/활성/보관 상태 관리',
          '세트 생성 후 즉시 세션 추가 가능',
          '교육생 노출 여부 제어',
        ]}
        tips={[
          '세트 이름은 "Week 1: React 기초"처럼 주차와 주제를 함께 표기하면 관리하기 편리합니다.',
          '초기 생성 시 "임시저장" 상태로 저장하고, 모든 세션 구성이 완료된 후 "활성"으로 변경하세요.',
          '설명란에는 학습 목표와 주요 내용을 간략히 작성하면 교육생이 사전에 내용을 파악할 수 있습니다.',
        ]}
      />
    </div>
  );
}
