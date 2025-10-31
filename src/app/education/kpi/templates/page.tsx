'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId, formatDate } from '@/lib/storage';
import { KPITemplate } from '@/types/kpi';
import WorkflowGuide from '@/components/WorkflowGuide';

export default function KPITemplatesPage() {
  const router = useRouter();
  const { toasts, success, error, hideToast } = useToast();

  const [templates, setTemplates] = useState<KPITemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<KPITemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    unit: string;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    unit: '%',
    isActive: true,
  });

  // Load templates from storage
  useEffect(() => {
    const stored = getFromStorage<KPITemplate>(STORAGE_KEYS.KPI_TEMPLATES);
    if (stored.length > 0) {
      setTemplates(stored);
    } else {
      // Initialize with default templates
      const defaultTemplates: KPITemplate[] = [
        {
          id: generateId(),
          name: '출석률',
          description: '전체 세션 대비 출석 비율',
          unit: '%',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
        {
          id: generateId(),
          name: '마일스톤 달성률',
          description: '주차별 마일스톤 달성 비율',
          unit: '%',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
        {
          id: generateId(),
          name: '멘토링 참여 시간',
          description: '주당 멘토링 및 코칭 참여 시간',
          unit: '시간',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
        {
          id: generateId(),
          name: '사업계획서 완성도',
          description: '사업계획서 평가 점수',
          unit: '점',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
        {
          id: generateId(),
          name: '고객 인터뷰 건수',
          description: '실제 타겟 고객 인터뷰 실행 건수',
          unit: '건',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
        {
          id: generateId(),
          name: '팀 협업 평가',
          description: '팀원 간 협업 평가 점수',
          unit: '점',
          language: 'ko',
          isActive: true,
          createdAt: formatDate(),
          updatedAt: formatDate(),
        },
      ];
      saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, defaultTemplates);
      setTemplates(defaultTemplates);
    }
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit: '%',
      isActive: true,
    });
    setEditingTemplate(null);
  };

  // Handle create/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      error('KPI 이름을 입력해주세요');
      return;
    }
    if (!formData.description) {
      error('설명을 입력해주세요');
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: formData.name,
              description: formData.description,
              unit: formData.unit,
              isActive: formData.isActive,
              updatedAt: formatDate(),
            }
          : t
      );
      setTemplates(updated);
      saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, updated);
      success('KPI 템플릿이 수정되었습니다');
    } else {
      // Create new template
      const newTemplate: KPITemplate = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        language: 'ko',
        isActive: formData.isActive,
        createdAt: formatDate(),
        updatedAt: formatDate(),
      };
      const updated = [...templates, newTemplate];
      setTemplates(updated);
      saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, updated);
      success('KPI 템플릿이 생성되었습니다');
    }

    setShowModal(false);
    resetForm();
  };

  // Handle edit
  const handleEdit = (template: KPITemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      unit: template.unit,
      isActive: template.isActive,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (template: KPITemplate) => {
    if (!confirm(`"${template.name}" KPI 템플릿을 삭제하시겠습니까?`)) {
      return;
    }

    const updated = templates.filter((t) => t.id !== template.id);
    setTemplates(updated);
    saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, updated);
    success('KPI 템플릿이 삭제되었습니다');
  };

  // Handle toggle active
  const handleToggleActive = (template: KPITemplate) => {
    const updated = templates.map((t) =>
      t.id === template.id
        ? { ...t, isActive: !t.isActive, updatedAt: formatDate() }
        : t
    );
    setTemplates(updated);
    saveToStorage(STORAGE_KEYS.KPI_TEMPLATES, updated);
    success(`KPI 템플릿이 ${!template.isActive ? '활성화' : '비활성화'}되었습니다`);
  };

  return (
    <div>
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/education/kpi')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>KPI 관리로 돌아가기</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KPI 템플릿 관리</h1>
            <p className="text-gray-600 mt-2">프로그램에 할당할 KPI 템플릿을 생성하고 관리합니다</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            템플릿 생성
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow ${
              !template.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {template.isActive ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-600">
                  {template.isActive ? '활성' : '비활성'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-600">단위: </span>
              <span className="text-sm font-semibold text-gray-900">{template.unit}</span>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                onClick={() => handleEdit(template)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <PencilIcon className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={() => handleToggleActive(template)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  template.isActive
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {template.isActive ? '비활성화' : '활성화'}
              </button>
              <button
                onClick={() => handleDelete(template)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-500">KPI 템플릿이 없습니다.</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">KPI 템플릿 안내</h3>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>KPI 템플릿은 프로그램에 할당할 수 있는 성과 지표의 기본 양식입니다</li>
          <li>목표값은 프로그램 할당 시 입력합니다</li>
          <li>비활성화된 템플릿은 새 프로그램 할당 시 목록에 표시되지 않습니다</li>
        </ul>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingTemplate ? 'KPI 템플릿 수정' : 'KPI 템플릿 생성'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KPI 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 출석률"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="KPI에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  단위 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: %, 점, 시간, 회"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">활성 상태</span>
                    <p className="text-xs text-gray-500">
                      활성화된 템플릿만 프로그램 할당 시 선택할 수 있습니다
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {editingTemplate ? '수정하기' : '생성하기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide
        title="📋 KPI 템플릿 관리 워크플로우"
        description="재사용 가능한 KPI 템플릿을 생성하고 관리합니다"
        steps={[
          {
            step: 1,
            title: '템플릿 생성',
            description: '자주 사용하는 KPI 측정 항목을 템플릿으로 저장합니다. 템플릿을 만들어두면 프로그램마다 반복 입력할 필요가 없습니다.',
          },
          {
            step: 2,
            title: '측정 기준 정의',
            description: 'KPI 이름, 설명, 단위를 명확히 작성합니다. 일관된 측정을 위해 상세한 설명을 추가하세요.',
          },
          {
            step: 3,
            title: '활성화 상태 설정',
            description: '현재 사용 중인 템플릿은 활성화하고, 사용하지 않는 템플릿은 비활성화하여 목록을 정리합니다.',
          },
          {
            step: 4,
            title: '템플릿 활용',
            description: '프로그램 생성 시 저장된 템플릿을 선택하여 빠르게 KPI를 배정할 수 있습니다.',
          },
        ]}
        keyFeatures={[
          'KPI 템플릿 생성 및 편집',
          '템플릿 활성화/비활성화',
          '측정 단위 설정 (%, 시간, 점 등)',
          '템플릿 복사 및 재사용',
          '템플릿 삭제',
          '프로그램별 템플릿 적용',
        ]}
        tips={[
          '기본 템플릿 (출석률, 과제 제출률 등)은 대부분의 프로그램에서 공통으로 사용할 수 있습니다.',
          '프로그램 특성에 맞는 맞춤 KPI (예: 코드 리뷰 참여율)를 추가로 만들어 사용하세요.',
          '템플릿 설명에 측정 방법을 구체적으로 작성하면, 코치와 교육생 모두 KPI를 명확히 이해할 수 있습니다.',
        ]}
      />
    </div>
  );
}
