'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import { VODSet } from '@/types/vod';
import WorkflowGuide from '@/components/WorkflowGuide';

const initialPrograms = [
  { id: 1, name: 'YEEEYEP 인도네시아' },
  { id: 2, name: '하나유니브' },
  { id: 3, name: 'SuTEAM' },
];

const categories = ['창업 기초', '비즈니스 전략', '마케팅', '재무', '피칭', '기타'];

export default function EditVODSetPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error, hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vodSet, setVodSet] = useState<VODSet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    programId: 0,
    status: 'draft' as 'draft' | 'active' | 'archived',
  });

  useEffect(() => {
    // ID로 VOD 세트 찾기
    const vodSets = getFromStorage<VODSet>(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets');
    const id = Number(params.id);
    const found = vodSets.find((set) => set.id === id);

    if (found) {
      setVodSet(found);
      setFormData({
        name: found.name,
        description: found.description,
        category: found.category,
        programId: found.programId,
        status: found.status,
      });
    } else {
      error('VOD 세트를 찾을 수 없습니다');
      setTimeout(() => {
        router.push('/education/vod-sets');
      }, 1500);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vodSet) return;

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

    // VOD 세트 수정
    const updatedSets = vodSets.map((set) =>
      set.id === vodSet.id
        ? {
            ...set,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            programId: formData.programId,
            programName: program.name,
            status: formData.status,
          }
        : set
    );

    // 저장
    saveToStorage(STORAGE_KEYS.VOD_SETS || 'ud_backoffice_vod_sets', updatedSets);

    success('VOD 세트가 수정되었습니다');

    // 목록 페이지로 이동
    setTimeout(() => {
      router.push('/education/vod-sets');
    }, 1000);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!vodSet) {
    return null;
  }

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
        <h1 className="text-3xl font-bold text-gray-900">VOD 세트 수정</h1>
        <p className="text-gray-600 mt-2">VOD 세트 정보를 수정합니다</p>
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
              placeholder="VOD 세트에 대한 설명을 입력하세요"
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

          {/* Session Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">세션 정보</h4>
            <p className="text-sm text-blue-800">
              현재 이 세트에는 <span className="font-semibold">{vodSet.sessions.length}개</span>의 세션이 등록되어 있습니다.
              <br />
              세션은 목록 페이지에서 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              수정하기
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

      {/* Workflow Guide */}
      <WorkflowGuide
        title="✏️ VOD 세트 편집 워크플로우"
        description="VOD 세트의 기본 정보와 상태를 수정하는 가이드입니다"
        steps={[
          {
            step: 1,
            title: '정보 확인',
            description: '현재 세트의 프로그램, 이름, 카테고리, 설명을 확인합니다.',
          },
          {
            step: 2,
            title: '내용 수정',
            description: '필요한 항목을 수정합니다. 세트 이름, 카테고리, 설명 등을 변경할 수 있습니다.',
          },
          {
            step: 3,
            title: '상태 변경',
            description: '세트의 공개 상태를 변경합니다. 임시저장/활성/보관 중 선택하세요.',
          },
          {
            step: 4,
            title: '저장 및 확인',
            description: '수정 내용을 저장하고 목록으로 돌아가 변경사항을 확인합니다.',
          },
        ]}
        keyFeatures={[
          '프로그램 변경',
          '세트 이름 및 설명 수정',
          '카테고리 변경',
          '공개 상태 관리 (임시저장/활성/보관)',
          '세션 정보 확인 (수정은 상세 페이지에서)',
        ]}
        tips={[
          '프로그램을 변경하면 해당 세트가 노출되는 교육생 그룹이 달라집니다.',
          '세트를 "보관됨"으로 변경하면 교육생에게 노출되지 않지만, 데이터는 유지됩니다.',
          '세션 구성을 변경하려면 상세 페이지로 이동하세요. 이 페이지에서는 세트의 기본 정보만 수정할 수 있습니다.',
        ]}
      />
    </div>
  );
}
